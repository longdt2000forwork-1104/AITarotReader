package com.aitarotreader.controllers;

import com.aitarotreader.dtos.*;
import com.aitarotreader.services.AuthService;
import com.aitarotreader.utils.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Authentication", description = "Endpoints for email registration, verification, password reset, Google Sign-In, refresh tokens, and session")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Register a new Seeker account and send verification email")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Registration successful. Please verify your email.", response));
    }

    @Operation(summary = "Login with verified email and password")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest servletRequest) {
        AuthResponse response = authService.login(request, resolveClientIp(servletRequest), servletRequest.getHeader("User-Agent"));
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @Operation(summary = "Authenticate or link account via verified Google ID token")
    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> loginWithGoogle(
            @Valid @RequestBody GoogleAuthRequest request,
            HttpServletRequest servletRequest) {
        AuthResponse response = authService.loginWithGoogle(request, servletRequest.getHeader("User-Agent"));
        return ResponseEntity.ok(ApiResponse.ok("Google authentication successful", response));
    }

    @Operation(summary = "Rotate refresh token and issue a new access token")
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @Valid @RequestBody RefreshTokenRequest request,
            HttpServletRequest servletRequest) {
        AuthResponse response = authService.refresh(request, servletRequest.getHeader("User-Agent"));
        return ResponseEntity.ok(ApiResponse.ok("Token refreshed", response));
    }

    @Operation(summary = "Logout and revoke refresh token")
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestBody(required = false) LogoutRequest request) {
        authService.logout(request);
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully", null));
    }

    @Operation(summary = "Verify email address using one-time token")
    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authService.verifyEmail(request);
        return ResponseEntity.ok(ApiResponse.ok("Email verified successfully", null));
    }

    @Operation(summary = "Resend email verification link")
    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Void>> resendVerification(
            @Valid @RequestBody ResendVerificationRequest request,
            HttpServletRequest servletRequest) {
        authService.resendVerification(request, resolveClientIp(servletRequest));
        return ResponseEntity.ok(ApiResponse.ok("If the account exists and is unverified, a verification email has been sent.", null));
    }

    @Operation(summary = "Request a password reset link")
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request,
            HttpServletRequest servletRequest) {
        authService.forgotPassword(request, resolveClientIp(servletRequest));
        return ResponseEntity.ok(ApiResponse.ok("If an account exists with that email, we have sent a password reset link.", null));
    }

    @Operation(summary = "Reset password using one-time token and revoke old sessions")
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Password reset successfully", null));
    }

    @Operation(summary = "Get current authenticated seeker user profile")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@AuthenticationPrincipal UUID userId) {
        UserDto user = authService.getCurrentUser(userId);
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
