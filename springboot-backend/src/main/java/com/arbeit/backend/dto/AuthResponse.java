package com.arbeit.backend.dto;

public class AuthResponse {

    private String message;
    private String userId;
    private String email;
    private String role;
    private String bid; // For business users

    public AuthResponse() {}

    public AuthResponse(String message) {
        this.message = message;
    }

    public AuthResponse(String message, String userId, String email, String role) {
        this.message = message;
        this.userId = userId;
        this.email = email;
        this.role = role;
        // For business users, also set bid field
        if ("business".equals(role)) {
            this.bid = userId;
        }
    }

    // Temporarily removed duplicate constructor
    // public AuthResponse(String message, String email, String role, String bid) {
    //     this.message = message;
    //     this.bid = bid;
    //     this.email = email;
    //     this.role = role;
    // }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getBid() {
        return bid;
    }

    public void setBid(String bid) {
        this.bid = bid;
    }
}
