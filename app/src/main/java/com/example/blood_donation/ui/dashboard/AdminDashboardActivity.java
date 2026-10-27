package com.example.blood_donation.ui.dashboard;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;

import com.example.blood_donation.R;
import com.example.blood_donation.ui.auth.WelcomeActivity;
import com.example.blood_donation.utils.SessionManager;

public class AdminDashboardActivity extends AppCompatActivity {

    private SessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_admin_dashboard);

        sessionManager = new SessionManager(this);

        TextView tvWelcomeUser = findViewById(R.id.tvWelcomeUser);
        tvWelcomeUser.setText("Welcome, " + sessionManager.getUserName());

        CardView cardVerifyOrganizations = findViewById(R.id.cardVerifyOrganizations);
        CardView cardAuditLogs = findViewById(R.id.cardAuditLogs);
        Button btnLogout = findViewById(R.id.btnLogout);

        cardVerifyOrganizations.setOnClickListener(v -> showVerifyOrganizationsDialog());
        cardAuditLogs.setOnClickListener(v -> showAuditLogsDialog());

        btnLogout.setOnClickListener(v -> {
            sessionManager.logout();
            Intent intent = new Intent(AdminDashboardActivity.this, WelcomeActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
            finish();
        });
    }

    private void showVerifyOrganizationsDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Pending Organization Verifications");

        String[] pendingOrgs = new String[]{
                "1. St. Mary's General Hospital (Reg ID: HOSP-9921)",
                "2. City Life Care Blood Repository (Reg ID: BBANK-4012)",
                "3. Metro Urgent Medical Clinic (Reg ID: HOSP-1082)"
        };

        builder.setItems(pendingOrgs, (dialog, which) -> {
            AlertDialog.Builder actionBuilder = new AlertDialog.Builder(this);
            actionBuilder.setTitle("Verify Organization");
            actionBuilder.setMessage("Action for:\n" + pendingOrgs[which]);
            actionBuilder.setPositiveButton("Approve & Verify", (d, w) -> Toast.makeText(this, "Organization approved & verified!", Toast.LENGTH_SHORT).show());
            actionBuilder.setNegativeButton("Reject", (d, w) -> Toast.makeText(this, "Application rejected.", Toast.LENGTH_SHORT).show());
            actionBuilder.show();
        });
        builder.setNegativeButton("Close", null);
        builder.show();
    }

    private void showAuditLogsDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("System Audit & Security Logs");

        String auditTrail = "[2025-02-23 10:14:02] LOGIN_SUCCESS - User ID: usr_102 (HOSPITAL_STAFF)\n" +
                           "[2025-02-23 10:12:45] REQUEST_CREATED - Request ID: req_901 (Urgency: CRITICAL)\n" +
                           "[2025-02-23 09:58:19] STOCK_UPDATED - Blood Bank: BBANK-01 (Added 10 Units O+)\n" +
                           "[2025-02-23 09:30:11] USER_REGISTER - New Donor Registered (Role: DONOR)\n" +
                           "[2025-02-23 08:45:00] VERIFICATION_APPROVED - Admin approved HOSP-9921\n\n" +
                           "System Integrity: 100% SECURE";

        builder.setMessage(auditTrail);
        builder.setPositiveButton("Export Logs", (dialog, which) -> Toast.makeText(this, "Audit logs exported to system record.", Toast.LENGTH_SHORT).show());
        builder.setNegativeButton("Close", null);
        builder.show();
    }
}
