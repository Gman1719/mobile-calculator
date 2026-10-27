package com.example.blood_donation.data.model;

public class BloodRequestModel {

    public static final String STATUS_OPEN = "OPEN";
    public static final String STATUS_SEARCHING_FOR_BLOOD = "SEARCHING_FOR_BLOOD";
    public static final String STATUS_MATCHING = "MATCHING";
    public static final String STATUS_RESPONSES_RECEIVED = "RESPONSES_RECEIVED";
    public static final String STATUS_IN_PROGRESS = "IN_PROGRESS";
    public static final String STATUS_FULFILLED = "FULFILLED";
    public static final String STATUS_CANCELLED = "CANCELLED";

    private String id;
    private String requesterId;
    private String bloodGroup;
    private int unitsRequired;
    private String urgency;
    private String status;
    private String hospitalName;
    private String town;
    private String city;
    private String contactName;
    private String contactPhone;
    private String notes;
    private String createdAt;

    public BloodRequestModel() {}

    public BloodRequestModel(String id, String bloodGroup, int unitsRequired, String urgency, String status, String hospitalName, String city, String contactName, String contactPhone) {
        this.id = id;
        this.bloodGroup = bloodGroup;
        this.unitsRequired = unitsRequired;
        this.urgency = urgency;
        this.status = status;
        this.hospitalName = hospitalName;
        this.city = city;
        this.contactName = contactName;
        this.contactPhone = contactPhone;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRequesterId() {
        return requesterId;
    }

    public void setRequesterId(String requesterId) {
        this.requesterId = requesterId;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public int getUnitsRequired() {
        return unitsRequired;
    }

    public void setUnitsRequired(int unitsRequired) {
        this.unitsRequired = unitsRequired;
    }

    public String getUrgency() {
        return urgency;
    }

    public void setUrgency(String urgency) {
        this.urgency = urgency;
    }

    public String getStatus() {
        return status != null ? status : STATUS_OPEN;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getHospitalName() {
        return hospitalName;
    }

    public void setHospitalName(String hospitalName) {
        this.hospitalName = hospitalName;
    }

    public String getTown() {
        return town;
    }

    public void setTown(String town) {
        this.town = town;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getStatusDisplayMessage() {
        if (STATUS_SEARCHING_FOR_BLOOD.equals(status)) {
            return "Searching for Blood Donors nearby...";
        } else if (STATUS_RESPONSES_RECEIVED.equals(status)) {
            return "Donor Response Received!";
        } else if (STATUS_FULFILLED.equals(status)) {
            return "Request Fulfilled";
        } else if (STATUS_CANCELLED.equals(status)) {
            return "Request Cancelled";
        } else {
            return "Active Request (" + getStatus() + ")";
        }
    }
}
