package com.example.blood_donation.utils;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.Toast;

import androidx.security.crypto.EncryptedSharedPreferences;
import androidx.security.crypto.MasterKey;

import com.example.blood_donation.ui.auth.EmailVerificationActivity;
import com.example.blood_donation.ui.auth.LoginActivity;
import com.example.blood_donation.ui.dashboard.DonorDashboardActivity;
import com.example.blood_donation.ui.dashboard.RequesterDashboardActivity;

import java.io.IOException;
import java.security.GeneralSecurityException;

public class SessionManager {

    private static final String PREF_NAME = "blood_donation_secure_prefs";
    private static final String KEY_IS_LOGGED_IN = "is_logged_in";
    private static final String KEY_ACCESS_TOKEN = "access_token";
    private static final String KEY_REFRESH_TOKEN = "refresh_token";
    private static final String KEY_USER_ID = "user_id";
    private static final String KEY_USER_NAME = "user_name";
    private static final String KEY_USER_EMAIL = "user_email";
    private static final String KEY_PRIMARY_ROLE = "primary_role";
    private static final String KEY_IS_EMAIL_VERIFIED = "is_email_verified";
    private static final String KEY_IS_APPROVED = "is_approved";
    private static final String KEY_VERIFICATION_CODE = "verification_code";

    private SharedPreferences sharedPreferences;
    private SharedPreferences.Editor editor;

    public SessionManager(Context context) {
        try {
            MasterKey masterKey = new MasterKey.Builder(context)
                    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
                    .build();

            sharedPreferences = EncryptedSharedPreferences.create(
                    context,
                    PREF_NAME,
                    masterKey,
                    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
                    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
            );
        } catch (GeneralSecurityException | IOException e) {
            sharedPreferences = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        }
        editor = sharedPreferences.edit();
    }

    public void createLoginSession(String userId, String name, String email, String primaryRole, String accessToken, String refreshToken) {
        createLoginSession(userId, name, email, primaryRole, accessToken, refreshToken, true, true);
    }

    public void createLoginSession(String userId, String name, String email, String primaryRole, String accessToken, String refreshToken, boolean isEmailVerified, boolean isApproved) {
        editor.putBoolean(KEY_IS_LOGGED_IN, true);
        editor.putString(KEY_USER_ID, userId);
        editor.putString(KEY_USER_NAME, name);
        editor.putString(KEY_USER_EMAIL, email);
        editor.putString(KEY_PRIMARY_ROLE, primaryRole);
        editor.putString(KEY_ACCESS_TOKEN, accessToken);
        editor.putString(KEY_REFRESH_TOKEN, refreshToken);
        editor.putBoolean(KEY_IS_EMAIL_VERIFIED, isEmailVerified);
        editor.putBoolean(KEY_IS_APPROVED, isApproved);
        editor.apply();
    }

    public void setEmailVerified(boolean verified) {
        editor.putBoolean(KEY_IS_EMAIL_VERIFIED, verified);
        editor.apply();
    }

    public boolean isEmailVerified() {
        return sharedPreferences.getBoolean(KEY_IS_EMAIL_VERIFIED, false);
    }

    public void setApproved(boolean approved) {
        editor.putBoolean(KEY_IS_APPROVED, approved);
        editor.apply();
    }

    public boolean isApproved() {
        return sharedPreferences.getBoolean(KEY_IS_APPROVED, true);
    }

    public void setVerificationCode(String code) {
        editor.putString(KEY_VERIFICATION_CODE, code);
        editor.apply();
    }

    public String getVerificationCode() {
        return sharedPreferences.getString(KEY_VERIFICATION_CODE, "123456");
    }

    public boolean isLoggedIn() {
        return sharedPreferences.getBoolean(KEY_IS_LOGGED_IN, false);
    }

    public String getAccessToken() {
        return sharedPreferences.getString(KEY_ACCESS_TOKEN, null);
    }

    public String getRefreshToken() {
        return sharedPreferences.getString(KEY_REFRESH_TOKEN, null);
    }

    public String getUserId() {
        return sharedPreferences.getString(KEY_USER_ID, null);
    }

    public String getUserName() {
        return sharedPreferences.getString(KEY_USER_NAME, "User");
    }

    public String getUserEmail() {
        return sharedPreferences.getString(KEY_USER_EMAIL, "");
    }

    public String getPrimaryRole() {
        return sharedPreferences.getString(KEY_PRIMARY_ROLE, "DONOR");
    }

    public void logout() {
        editor.clear();
        editor.apply();
    }

    public void redirectToDashboard(Context context) {
        Intent intent;

        if (!isEmailVerified()) {
            intent = new Intent(context, EmailVerificationActivity.class);
        } else {
            String role = getPrimaryRole();
            if ("REQUESTER".equalsIgnoreCase(role)) {
                intent = new Intent(context, RequesterDashboardActivity.class);
            } else if ("DONOR".equalsIgnoreCase(role)) {
                intent = new Intent(context, DonorDashboardActivity.class);
            } else {
                Toast.makeText(context, "Hospitals, Blood Banks & Admins must log in via Web Application: https://portal.blooddonation.org", Toast.LENGTH_LONG).show();
                logout();
                intent = new Intent(context, LoginActivity.class);
            }
        }

        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        context.startActivity(intent);
    }
}
