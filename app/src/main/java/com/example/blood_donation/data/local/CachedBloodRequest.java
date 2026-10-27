package com.example.blood_donation.data.local;

import androidx.annotation.NonNull;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "cached_requests")
public class CachedBloodRequest {

    @PrimaryKey
    @NonNull
    private String id;
    private String bloodGroup;
    private int unitsRequired;
    private String urgency;
    private String status;
    private String hospitalName;
    private String town;
    private String city;
    private String contactPhone;

    public CachedBloodRequest(@NonNull String id, String bloodGroup, int unitsRequired, String urgency, String status, String hospitalName, String town, String city, String contactPhone) {
        this.id = id;
        this.bloodGroup = bloodGroup;
        this.unitsRequired = unitsRequired;
        this.urgency = urgency;
        this.status = status;
        this.hospitalName = hospitalName;
        this.town = town;
        this.city = city;
        this.contactPhone = contactPhone;
    }

    @NonNull
    public String getId() {
        return id;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public int getUnitsRequired() {
        return unitsRequired;
    }

    public String getUrgency() {
        return urgency;
    }

    public String getStatus() {
        return status;
    }

    public String getHospitalName() {
        return hospitalName;
    }

    public String getTown() {
        return town;
    }

    public String getCity() {
        return city;
    }

    public String getContactPhone() {
        return contactPhone;
    }
}
