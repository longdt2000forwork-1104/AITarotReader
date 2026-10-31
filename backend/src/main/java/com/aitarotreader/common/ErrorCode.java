package com.aitarotreader.common;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "ERR_INTERNAL", "An unexpected internal error occurred"),
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "ERR_BAD_REQUEST", "Invalid request parameters"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "ERR_UNAUTHORIZED", "Authentication required"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "ERR_FORBIDDEN", "Insufficient permissions"),
    NOT_FOUND(HttpStatus.NOT_FOUND, "ERR_NOT_FOUND", "Requested resource was not found"),
    USER_ALREADY_EXISTS(HttpStatus.CONFLICT, "ERR_USER_EXISTS", "User with this email already exists"),
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "ERR_INVALID_CREDENTIALS", "Invalid email or password"),
    INSUFFICIENT_CRYSTALS(HttpStatus.PAYMENT_REQUIRED, "ERR_INSUFFICIENT_CRYSTALS", "Not enough crystals for this reading spread"),
    FOLLOW_UP_LIMIT_REACHED(HttpStatus.BAD_REQUEST, "ERR_FOLLOW_UP_LIMIT", "Maximum follow-up question limit reached for this session");

    private final HttpStatus httpStatus;
    private final String code;
    private final String defaultMessage;

    ErrorCode(HttpStatus httpStatus, String code, String defaultMessage) {
        this.httpStatus = httpStatus;
        this.code = code;
        this.defaultMessage = defaultMessage;
    }
}
