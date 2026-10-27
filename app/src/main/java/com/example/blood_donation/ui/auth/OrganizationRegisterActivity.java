package com.example.blood_donation.ui.auth;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Patterns;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;

import com.example.blood_donation.R;
import com.example.blood_donation.utils.SessionManager;
import com.google.android.material.textfield.TextInputEditText;

public class OrganizationRegisterActivity extends AppCompatActivity {

    private Spinner spinnerOrgType;
    private TextInputEditText etOrgName, etOrgEmail, etOrgPhone, etRegion, etCity, etAddress, etRepName, etPassword, etConfirmPassword;
    private TextView tvLicenseStatus;
    private CheckBox cbTerms;
    private SessionManager sessionManager;
    private Uri selectedDocumentUri = null;

    private final ActivityResultLauncher<String[]> documentPickerLauncher =
            registerForActivityResult(new ActivityResultContracts.OpenDocument(), uri -> {
                if (uri != null) {
                    selectedDocumentUri = uri;
                    tvLicenseStatus.setText("License Document Selected: " + uri.getLastPathSegment());
                }
            });

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_organization_register);

        sessionManager = new SessionManager(this);

        spinnerOrgType = findViewById(R.id.spinnerOrgType);
        etOrgName = findViewById(R.id.etOrgName);
        etOrgEmail = findViewById(R.id.etOrgEmail);
        etOrgPhone = findViewById(R.id.etOrgPhone);
        etRegion = findViewById(R.id.etRegion);
        etCity = findViewById(R.id.etCity);
        etAddress = findViewById(R.id.etAddress);
        etRepName = findViewById(R.id.etRepName);
        etPassword = findViewById(R.id.etPassword);
        etConfirmPassword = findViewById(R.id.etConfirmPassword);
        tvLicenseStatus = findViewById(R.id.tvLicenseStatus);
        cbTerms = findViewById(R.id.cbTerms);

        Button btnUploadLicense = findViewById(R.id.btnUploadLicense);
        Button btnSubmitOrg = findViewById(R.id.btnSubmitOrg);
        TextView tvLoginLink = findViewById(R.id.tvLoginLink);

        String[] orgTypes = new String[]{"Hospital", "Blood Bank"};
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, orgTypes);
        spinnerOrgType.setAdapter(adapter);

        String preselectedOrg = getIntent().getStringExtra("ORG_TYPE");
        if ("BLOOD_BANK".equalsIgnoreCase(preselectedOrg)) {
            spinnerOrgType.setSelection(1);
        } else {
            spinnerOrgType.setSelection(0);
        }

        btnUploadLicense.setOnClickListener(v -> documentPickerLauncher.launch(new String[]{"application/pdf", "image/*"}));
        btnSubmitOrg.setOnClickListener(v -> performOrganizationRegistration());
        tvLoginLink.setOnClickListener(v -> startActivity(new Intent(this, LoginActivity.class)));
    }

    private boolean isValidEthiopianPhone(String phone) {
        if (TextUtils.isEmpty(phone)) return false;
        String cleanPhone = phone.trim().replaceAll("\\s+", "");
        return cleanPhone.matches("^(\\+251[97]\\d{8}|0[97]\\d{8})$");
    }

    private void performOrganizationRegistration() {
        String orgTypeSelection = spinnerOrgType.getSelectedItem().toString();
        String orgName = etOrgName.getText() != null ? etOrgName.getText().toString().trim() : "";
        String email = etOrgEmail.getText() != null ? etOrgEmail.getText().toString().trim() : "";
        String phone = etOrgPhone.getText() != null ? etOrgPhone.getText().toString().trim() : "";
        String region = etRegion.getText() != null ? etRegion.getText().toString().trim() : "";
        String city = etCity.getText() != null ? etCity.getText().toString().trim() : "";
        String address = etAddress.getText() != null ? etAddress.getText().toString().trim() : "";
        String repName = etRepName.getText() != null ? etRepName.getText().toString().trim() : "";
        String password = etPassword.getText() != null ? etPassword.getText().toString().trim() : "";
        String confirmPassword = etConfirmPassword.getText() != null ? etConfirmPassword.getText().toString().trim() : "";

        if (TextUtils.isEmpty(orgName)) {
            etOrgName.setError("Organization Name is required");
            etOrgName.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(email) || !Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            etOrgEmail.setError("Please enter a valid email address (e.g. org@hospital.org)");
            etOrgEmail.requestFocus();
            return;
        }

        if (!isValidEthiopianPhone(phone)) {
            etOrgPhone.setError("Invalid Ethiopian phone number. Must start with +2519, +2517, 09, or 07 followed by 8 digits");
            etOrgPhone.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(region)) {
            etRegion.setError("Region / State is required");
            etRegion.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(city)) {
            etCity.setError("City / Town is required");
            etCity.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(address)) {
            etAddress.setError("Physical Address is required");
            etAddress.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(repName)) {
            etRepName.setError("Representative Name is required");
            etRepName.requestFocus();
            return;
        }

        if (selectedDocumentUri == null) {
            Toast.makeText(this, "Please upload your Organization License / Authorization Document", Toast.LENGTH_LONG).show();
            return;
        }

        if (TextUtils.isEmpty(password) || password.length() < 6) {
            etPassword.setError("Password must be at least 6 characters");
            etPassword.requestFocus();
            return;
        }

        if (!password.equals(confirmPassword)) {
            etConfirmPassword.setError("Passwords do not match");
            etConfirmPassword.requestFocus();
            return;
        }

        if (!cbTerms.isChecked()) {
            Toast.makeText(this, "Please accept the Terms & Privacy Consent", Toast.LENGTH_SHORT).show();
            return;
        }

        String role = "Hospital".equalsIgnoreCase(orgTypeSelection) ? "HOSPITAL_STAFF" : "BLOOD_BANK_OFFICER";

        sessionManager.createLoginSession(
                "org-id-" + System.currentTimeMillis(),
                orgName + " (" + repName + ")",
                email,
                role,
                "fake-access-token",
                "fake-refresh-token",
                false, // email verification required
                false  // admin approval required for organizations
        );

        sessionManager.setVerificationCode("654321");

        Toast.makeText(this, "Organization registration submitted! Verification code sent to " + email, Toast.LENGTH_LONG).show();
        sessionManager.redirectToDashboard(this);
        finish();
    }
}
