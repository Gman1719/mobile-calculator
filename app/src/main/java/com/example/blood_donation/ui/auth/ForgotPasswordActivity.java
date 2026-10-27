package com.example.blood_donation.ui.auth;

import android.os.Bundle;
import android.text.TextUtils;
import android.widget.Button;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.blood_donation.R;
import com.google.android.material.textfield.TextInputEditText;

public class ForgotPasswordActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_forgot_password);

        TextInputEditText etEmail = findViewById(R.id.etEmail);
        Button btnResetSubmit = findViewById(R.id.btnResetSubmit);

        btnResetSubmit.setOnClickListener(v -> {
            String email = etEmail.getText() != null ? etEmail.getText().toString().trim() : "";
            if (TextUtils.isEmpty(email)) {
                Toast.makeText(this, "Please enter your registered email address", Toast.LENGTH_SHORT).show();
                return;
            }
            Toast.makeText(this, "Recovery email sent to " + email, Toast.LENGTH_LONG).show();
            finish();
        });
    }
}
