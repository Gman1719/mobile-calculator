package com.example.blood_donation.ui.dashboard;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;

import com.example.blood_donation.R;
import com.example.blood_donation.ui.auth.WelcomeActivity;
import com.example.blood_donation.utils.SessionManager;

import java.util.ArrayList;
import java.util.List;

public class DonorDashboardActivity extends AppCompatActivity {

    private SessionManager sessionManager;
    private boolean isAvailable = true;
    private String currentCity = "New York";

    // Donor responses kept strictly separate from confirmed donation records
    private final List<String> donorResponseLog = new ArrayList<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_donor_dashboard);

        sessionManager = new SessionManager(this);

        TextView tvWelcomeUser = findViewById(R.id.tvWelcomeUser);
        TextView tvDonorStatus = findViewById(R.id.tvDonorStatus);

        tvWelcomeUser.setText("Welcome, " + sessionManager.getUserName() + "!");
        updateStatusText(tvDonorStatus);

        CardView cardUpdateAvailability = findViewById(R.id.cardUpdateAvailability);
        CardView cardInvitations = findViewById(R.id.cardInvitations);
        CardView cardEligibility = findViewById(R.id.cardEligibility);
        CardView cardDonationHistory = findViewById(R.id.cardDonationHistory);
        Button btnLogout = findViewById(R.id.btnLogout);

        cardUpdateAvailability.setOnClickListener(v -> showUpdateAvailabilityDialog(tvDonorStatus));
        cardInvitations.setOnClickListener(v -> showInvitationsDialog());
        cardEligibility.setOnClickListener(v -> showEligibilityDialog());
        cardDonationHistory.setOnClickListener(v -> showDonationHistoryDialog());

        btnLogout.setOnClickListener(v -> {
            sessionManager.logout();
            Intent intent = new Intent(DonorDashboardActivity.this, WelcomeActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
            finish();
        });
    }

    private void updateStatusText(TextView tvDonorStatus) {
        if (tvDonorStatus != null) {
            String statusStr = isAvailable ? "Active Donor" : "Currently Unavailable";
            tvDonorStatus.setText("Blood Group: O+ | " + statusStr + " (" + currentCity + ")");
        }
    }

    private void showUpdateAvailabilityDialog(TextView tvDonorStatus) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Update Availability & Location");

        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(40, 30, 40, 10);

        final EditText etCity = new EditText(this);
        etCity.setHint("Enter City / Town");
        etCity.setText(currentCity);
        layout.addView(etCity);

        builder.setView(layout);
        builder.setPositiveButton(isAvailable ? "Set Unavailable" : "Set Available", (dialog, which) -> {
            isAvailable = !isAvailable;
            if (etCity.getText() != null && !etCity.getText().toString().trim().isEmpty()) {
                currentCity = etCity.getText().toString().trim();
            }
            updateStatusText(tvDonorStatus);
            String statusMessage = isAvailable ? "You are now marked AVAILABLE in " + currentCity : "You are marked UNAVAILABLE";
            Toast.makeText(this, statusMessage, Toast.LENGTH_SHORT).show();
        });
        builder.setNeutralButton("Save City Only", (dialog, which) -> {
            if (etCity.getText() != null && !etCity.getText().toString().trim().isEmpty()) {
                currentCity = etCity.getText().toString().trim();
                updateStatusText(tvDonorStatus);
                Toast.makeText(this, "Location updated to " + currentCity, Toast.LENGTH_SHORT).show();
            }
        });
        builder.setNegativeButton("Cancel", null);
        builder.show();
    }

    private void showInvitationsDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Blood Request Invitations");
        String[] invitations = new String[]{
                "URGENT: O+ Required at City General Hospital (2 Units)",
                "HIGH: O+ Needed at St. Jude Medical Center (1 Unit)",
                "ROUTINE: O+ Needed at Mercy Community Hospital (1 Unit)"
        };

        builder.setItems(invitations, (dialog, which) -> {
            AlertDialog.Builder actionBuilder = new AlertDialog.Builder(this);
            actionBuilder.setTitle("Respond to Request");
            actionBuilder.setMessage("Do you accept the donation invitation for:\n" + invitations[which] + "?\n\nNote: Responding 'Accept' registers your availability. Final medical eligibility is assessed at collection.");
            actionBuilder.setPositiveButton("Accept & Respond", (d, w) -> {
                donorResponseLog.add("ACCEPTED: " + invitations[which]);
                Toast.makeText(this, "Response registered as ACCEPTED. Requester notified!", Toast.LENGTH_LONG).show();
            });
            actionBuilder.setNegativeButton("Decline", (d, w) -> {
                donorResponseLog.add("DECLINED: " + invitations[which]);
                Toast.makeText(this, "Response registered as DECLINED.", Toast.LENGTH_SHORT).show();
            });
            actionBuilder.show();
        });
        builder.setNegativeButton("Close", null);
        builder.show();
    }

    private void showEligibilityDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Donation Eligibility Guidelines");
        String eligibilityInfo = "• Age: Must be between 18 and 65 years old\n" +
                                 "• Weight: Minimum 50 kg (110 lbs)\n" +
                                 "• Donation Interval: At least 56 days (8 weeks) between whole blood donations\n" +
                                 "• Hemoglobin: Normal levels (>= 12.5 g/dL)\n" +
                                 "• Health Status: Feeling healthy and well on donation day\n\n" +
                                 "Note: Medical eligibility is verified by healthcare professionals at the donation facility prior to collection.";
        builder.setMessage(eligibilityInfo);
        builder.setPositiveButton("I Understand", null);
        builder.show();
    }

    private void showDonationHistoryDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Donation Records & Responses");

        StringBuilder historyBuilder = new StringBuilder();
        historyBuilder.append("=== VERIFIED DONATION RECORDS ===\n")
                      .append("1. City General Hospital - 1 Unit O+ (Jan 15, 2025)\n")
                      .append("2. Red Cross Center - 1 Unit O+ (Sep 10, 2024)\n\n")
                      .append("=== RECENT RESPONSES ===\n");

        if (donorResponseLog.isEmpty()) {
            historyBuilder.append("No active responses logged in this session.");
        } else {
            for (String resp : donorResponseLog) {
                historyBuilder.append("• ").append(resp).append("\n");
            }
        }

        builder.setMessage(historyBuilder.toString());
        builder.setPositiveButton("OK", null);
        builder.show();
    }
}
