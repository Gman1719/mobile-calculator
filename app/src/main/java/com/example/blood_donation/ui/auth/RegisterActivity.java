package com.example.blood_donation.ui.auth;

import android.app.DatePickerDialog;
import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Patterns;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.blood_donation.R;
import com.example.blood_donation.utils.SessionManager;
import com.google.android.material.textfield.TextInputEditText;

import java.util.Calendar;

public class RegisterActivity extends AppCompatActivity {

    private TextInputEditText etFullName, etEmail, etPhone, etDob, etCity, etPassword, etConfirmPassword;
    private Spinner spinnerRole, spinnerBloodGroup;
    private LinearLayout layoutBloodGroupContainer;
    private CheckBox cbTerms;
    private SessionManager sessionManager;

    private int selectedYear = 0;
    private int selectedMonth = 0;
    private int selectedDay = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        sessionManager = new SessionManager(this);

        spinnerRole = findViewById(R.id.spinnerRole);
        etFullName = findViewById(R.id.etFullName);
        etEmail = findViewById(R.id.etEmail);
        etPhone = findViewById(R.id.etPhone);
        etDob = findViewById(R.id.etDob);
        etCity = findViewById(R.id.etCity);
        layoutBloodGroupContainer = findViewById(R.id.layoutBloodGroupContainer);
        spinnerBloodGroup = findViewById(R.id.spinnerBloodGroup);
        etPassword = findViewById(R.id.etPassword);
        etConfirmPassword = findViewById(R.id.etConfirmPassword);
        cbTerms = findViewById(R.id.cbTerms);

        TextView tvLoginLink = findViewById(R.id.tvLoginLink);
        Button btnRegisterSubmit = findViewById(R.id.btnRegisterSubmit);

        String[] roles = new String[]{"Blood Donor", "Blood Requester"};
        ArrayAdapter<String> roleAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, roles);
        spinnerRole.setAdapter(roleAdapter);

        String[] bloodGroups = new String[]{"Unknown / Not Specified", "O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"};
        ArrayAdapter<String> bgAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, bloodGroups);
        spinnerBloodGroup.setAdapter(bgAdapter);

        String preselectedRole = getIntent().getStringExtra("PRESELECTED_ROLE");
        if ("REQUESTER".equalsIgnoreCase(preselectedRole)) {
            spinnerRole.setSelection(1);
            layoutBloodGroupContainer.setVisibility(View.GONE);
        } else {
            spinnerRole.setSelection(0);
            layoutBloodGroupContainer.setVisibility(View.VISIBLE);
        }

        spinnerRole.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                if (position == 0) {
                    layoutBloodGroupContainer.setVisibility(View.VISIBLE);
                } else {
                    layoutBloodGroupContainer.setVisibility(View.GONE);
                }
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {}
        });

        etDob.setOnClickListener(v -> showDatePicker());

        tvLoginLink.setOnClickListener(v -> startActivity(new Intent(RegisterActivity.this, LoginActivity.class)));
        btnRegisterSubmit.setOnClickListener(v -> performRegistration());
    }

    private void showDatePicker() {
        final Calendar c = Calendar.getInstance();
        int year = c.get(Calendar.YEAR) - 18;
        int month = c.get(Calendar.MONTH);
        int day = c.get(Calendar.DAY_OF_MONTH);

        DatePickerDialog datePickerDialog = new DatePickerDialog(
                this,
                (view, sYear, sMonth, sDay) -> {
                    selectedYear = sYear;
                    selectedMonth = sMonth;
                    selectedDay = sDay;
                    String dob = sDay + "/" + (sMonth + 1) + "/" + sYear;
                    etDob.setText(dob);
                    etDob.setError(null);
                },
                year, month, day
        );
        datePickerDialog.show();
    }

    private boolean isValidEthiopianPhone(String phone) {
        if (TextUtils.isEmpty(phone)) return false;
        String cleanPhone = phone.trim().replaceAll("\\s+", "");
        return cleanPhone.matches("^(\\+251[97]\\d{8}|0[97]\\d{8})$");
    }

    private int calculateAge(int year, int month, int day) {
        Calendar dob = Calendar.getInstance();
        dob.set(year, month, day);
        Calendar today = Calendar.getInstance();
        int baseAge = today.get(Calendar.YEAR) - dob.get(Calendar.YEAR);
        if (today.get(Calendar.DAY_OF_YEAR) < dob.get(Calendar.DAY_OF_YEAR)) {
            return baseAge - 1;
        }
        return baseAge;
    }

    private void performRegistration() {
        String name = etFullName.getText() != null ? etFullName.getText().toString().trim() : "";
        String email = etEmail.getText() != null ? etEmail.getText().toString().trim() : "";
        String phone = etPhone.getText() != null ? etPhone.getText().toString().trim() : "";
        String city = etCity.getText() != null ? etCity.getText().toString().trim() : "";
        String password = etPassword.getText() != null ? etPassword.getText().toString().trim() : "";
        String confirmPassword = etConfirmPassword.getText() != null ? etConfirmPassword.getText().toString().trim() : "";
        String roleSelection = spinnerRole.getSelectedItem().toString();
        boolean isDonor = "Blood Donor".equalsIgnoreCase(roleSelection);

        if (TextUtils.isEmpty(name)) {
            etFullName.setError("Full Name is required");
            etFullName.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(email) || !Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            etEmail.setError("Please enter a valid email address (e.g. user@example.com)");
            etEmail.requestFocus();
            return;
        }

        if (!isValidEthiopianPhone(phone)) {
            etPhone.setError("Invalid Ethiopian phone number. Must start with +2519, +2517, 09, or 07 followed by 8 digits");
            etPhone.requestFocus();
            return;
        }

        if (isDonor) {
            if (selectedYear == 0) {
                etDob.setError("Date of Birth is required for Donors");
                Toast.makeText(this, "Please select your Date of Birth", Toast.LENGTH_SHORT).show();
                return;
            }
            int age = calculateAge(selectedYear, selectedMonth, selectedDay);
            if (age < 18) {
                etDob.setError("Blood Donors must be at least 18 years old");
                Toast.makeText(this, "Registration failed: Blood Donors must be at least 18 years old. Current age: " + age, Toast.LENGTH_LONG).show();
                return;
            }
        }

        if (TextUtils.isEmpty(city)) {
            etCity.setError("City / Town is required");
            etCity.requestFocus();
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
            Toast.makeText(this, "Please accept the Terms of Service & Privacy Policy", Toast.LENGTH_SHORT).show();
            return;
        }

        String role = isDonor ? "DONOR" : "REQUESTER";

        sessionManager.createLoginSession(
                "user-id-" + System.currentTimeMillis(),
                name,
                email,
                role,
                "fake-access-token",
                "fake-refresh-token",
                false, // email verification required
                true   // individual donor/requester approved by default
        );

        sessionManager.setVerificationCode("123456");

        Toast.makeText(this, "Registration Successful! Verification code sent to " + email, Toast.LENGTH_LONG).show();
        sessionManager.redirectToDashboard(this);
        finish();
    }
}
