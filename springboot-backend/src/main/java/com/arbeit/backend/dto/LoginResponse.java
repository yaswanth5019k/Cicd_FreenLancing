package com.arbeit.backend.dto;

public class LoginResponse extends AuthResponse {

    private String accessToken;
    private String refreshToken;

    public LoginResponse() {}

    public LoginResponse(String message, String userId, String email, String role, String accessToken, String refreshToken) {
        super(message, userId, email, role);
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
