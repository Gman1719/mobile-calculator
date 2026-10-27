package com.example.blood_donation.data.model;

import java.util.List;

public class LoginResponseData {
    private UserData user;
    private String accessToken;
    private String refreshToken;

    public UserData getUser() {
        return user;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public static class UserData {
        private String id;
        private String fullName;
        private String email;
        private List<String> roles;

        public String getId() {
            return id;
        }

        public String getFullName() {
            return fullName;
        }

        public String getEmail() {
            return email;
        }

        public List<String> getRoles() {
            return roles;
        }
    }
}
