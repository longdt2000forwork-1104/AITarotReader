package com.aitarotreader.controllers;

import com.aitarotreader.entities.*;
import com.aitarotreader.dtos.*;
import com.aitarotreader.services.*;
import com.aitarotreader.repositories.*;
import com.aitarotreader.utils.*;
import com.aitarotreader.exceptions.*;

import com.aitarotreader.utils.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Authentication", description = "Endpoints for seeker sign up, login, Google OAuth2, and profile session")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Register a new Seeker account")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Registration successful", response));
    }

    @Operation(summary = "Login with email and password")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @Operation(summary = "Authenticate or auto-register via Google OAuth2")
    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> loginWithGoogle(@Valid @RequestBody GoogleAuthRequest request) {
        AuthResponse response = authService.loginWithGoogle(request);
        return ResponseEntity.ok(ApiResponse.ok("Google authentication successful", response));
    }

    @Operation(summary = "Get current authenticated seeker user profile")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@AuthenticationPrincipal UUID userId) {
        UserDto user = authService.getCurrentUser(userId);
        return ResponseEntity.ok(ApiResponse.ok(user));
    }
}
