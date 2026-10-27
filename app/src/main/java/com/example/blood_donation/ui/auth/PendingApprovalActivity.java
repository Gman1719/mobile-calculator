package com.example.blood_donation.ui.auth;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.blood_donation.R;
import com.example.blood_donation.utils.SessionManager;

public class PendingApprovalActivity extends AppCompatActivity {

    private SessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_pending_approval);

        sessionManager = new SessionManager(this);

        TextView tvOrgNameText = findViewById(R.id.tvOrgNameText);
        Button btnCheckStatus = findViewById(R.id.btnCheckStatus);
        Button btnLogout = findViewById(R.id.btnLogout);

        String name = sessionManager.getUserName();
        if (!name.isEmpty()) {
            tvOrgNameText.setText("Registration for " + name + " has been submitted and is currently pending System Administrator verification.");
        }

        btnCheckStatus.setOnClickListener(v -> {
            if (sessionManager.isApproved()) {
                Toast.makeText(this, "Organization approved! Redirecting to dashboard...", Toast.LENGTH_SHORT).show();
                sessionManager.redirectToDashboard(this);
                finish();
            } else {
                Toast.makeText(this, "Status: Still Pending Verification. Administrators have been notified.", Toast.LENGTH_LONG).show();
            }
        });

        btnLogout.setOnClickListener(v -> {
            sessionManager.logout();
            Intent intent = new Intent(this, WelcomeActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
            finish();
        });
    }
}
