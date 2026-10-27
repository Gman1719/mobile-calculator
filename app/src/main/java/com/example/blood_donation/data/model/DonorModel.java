package com.example.blood_donation.data.model;

public class DonorModel {
    private String donorProfileId;
    private String userId;
    private String fullName;
    private String phone;
    private String email;
    private String bloodGroup;
    private String town;
    private String city;
    private boolean isAvailable;

    public String getDonorProfileId() {
        return donorProfileId;
    }

    public String getUserId() {
        return userId;
    }

    public String getFullName() {
        return fullName;
    }

    public String getPhone() {
        return phone;
    }

    public String getEmail() {
        return email;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public String getTown() {
        return town;
    }

    public String getCity() {
        return city;
    }

    public boolean isAvailable() {
        return isAvailable;
    }
}
