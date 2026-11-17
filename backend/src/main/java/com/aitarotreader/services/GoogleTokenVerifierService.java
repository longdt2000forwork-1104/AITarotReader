package com.aitarotreader.services;

import com.aitarotreader.exceptions.CustomException;
import com.aitarotreader.exceptions.ErrorCode;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class GoogleTokenVerifierService {

    private final List<String> allowedClientIds;
    private final GoogleIdTokenVerifier verifier;

    public GoogleTokenVerifierService(@Value("${app.google.client-ids:}") String rawClientIds) {
        this.allowedClientIds = Arrays.stream((rawClientIds == null ? "" : rawClientIds).split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());

        if (this.allowedClientIds.isEmpty()) {
            this.verifier = null;
            log.warn("GOOGLE_CLIENT_IDS is not configured; Google Sign-In verification will reject tokens until configured.");
        } else {
            this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(this.allowedClientIds)
                    .build();
        }
    }

    public GoogleUserPayload verify(String idTokenString) {
        if (idTokenString == null || idTokenString.isBlank()) {
            throw new CustomException(ErrorCode.INVALID_GOOGLE_TOKEN, "Google ID token is required");
        }
        if (verifier == null) {
            throw new CustomException(ErrorCode.INVALID_GOOGLE_TOKEN, "Google Sign-In is not configured on the server");
        }

        try {
            GoogleIdToken idToken = verifier.verify(idTokenString.trim());
            if (idToken == null) {
                throw new CustomException(ErrorCode.INVALID_GOOGLE_TOKEN, "Invalid or expired Google ID token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String sub = payload.getSubject();
            String email = payload.getEmail();
            Boolean emailVerified = payload.getEmailVerified();

            if (sub == null || sub.isBlank() || email == null || email.isBlank()) {
                throw new CustomException(ErrorCode.INVALID_GOOGLE_TOKEN, "Google token is missing required account claims");
            }
            if (!Boolean.TRUE.equals(emailVerified)) {
                throw new CustomException(ErrorCode.INVALID_GOOGLE_TOKEN, "Google account email is not verified");
            }

            Object nameClaim = payload.get("name");
            Object pictureClaim = payload.get("picture");

            return new GoogleUserPayload(
                    sub,
                    email.trim().toLowerCase(),
                    true,
                    nameClaim != null ? nameClaim.toString() : null,
                    pictureClaim != null ? pictureClaim.toString() : null
            );
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Failed to verify Google ID token: {}", e.getMessage());
            throw new CustomException(ErrorCode.INVALID_GOOGLE_TOKEN, "Unable to verify Google ID token");
        }
    }

    public record GoogleUserPayload(
            String sub,
            String email,
            boolean emailVerified,
            String name,
            String picture
    ) {
    }
}
