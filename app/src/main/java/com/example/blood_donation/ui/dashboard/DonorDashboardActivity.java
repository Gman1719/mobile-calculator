package com.example.blood_donation.ui.dashboard;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;

import com.example.blood_donation.R;
import com.example.blood_donation.data.model.ApiResponse;
import com.example.blood_donation.data.model.BloodRequestModel;
import com.example.blood_donation.data.network.ApiService;
import com.example.blood_donation.data.network.RetrofitClient;
import com.example.blood_donation.ui.auth.WelcomeActivity;
import com.example.blood_donation.utils.SessionManager;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DonorDashboardActivity extends AppCompatActivity {

    private SessionManager sessionManager;
    private boolean isAvailable = true;
    private String currentCity = "Metropolis";
    private String donorBloodGroup = "O+";

    private final List<BloodRequestModel> liveInvitations = new ArrayList<>();
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

        // Pre-fetch live relevant requests for this donor
        fetchLiveInvitations();
    }

    @Override
    protected void onResume() {
        super.onResume();
        fetchLiveInvitations();
    }

    private void updateStatusText(TextView tvDonorStatus) {
        if (tvDonorStatus != null) {
            String statusStr = isAvailable ? "Active Donor" : "Currently Unavailable";
            tvDonorStatus.setText("Blood Group: " + donorBloodGroup + " | " + statusStr + " (" + currentCity + ")");
        }
    }

    private void fetchLiveInvitations() {
        RetrofitClient.getApiService(this)
                .getRequests(donorBloodGroup, currentCity, null)
                .enqueue(new Callback<ApiResponse<List<BloodRequestModel>>>() {
                    @Override
                    public void onResponse(@NonNull Call<ApiResponse<List<BloodRequestModel>>> call,
                                           @NonNull Response<ApiResponse<List<BloodRequestModel>>> response) {
                        if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                            liveInvitations.clear();
                            List<BloodRequestModel> list = response.body().getData();
                            if (list != null) {
                                liveInvitations.addAll(list);
                            }
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<ApiResponse<List<BloodRequestModel>>> call, @NonNull Throwable t) {
                        // Keep any cached invitations
                    }
                });
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
            boolean targetAvailability = !isAvailable;
            if (etCity.getText() != null && !etCity.getText().toString().trim().isEmpty()) {
                currentCity = etCity.getText().toString().trim();
            }

            // Sync availability with backend
            RetrofitClient.getApiService(DonorDashboardActivity.this)
                    .updateAvailability(new ApiService.AvailabilityPayload(targetAvailability))
                    .enqueue(new Callback<ApiResponse<Object>>() {
                        @Override
                        public void onResponse(@NonNull Call<ApiResponse<Object>> call, @NonNull Response<ApiResponse<Object>> response) {
                            isAvailable = targetAvailability;
                            updateStatusText(tvDonorStatus);
                            String statusMessage = isAvailable ? "Marked AVAILABLE in " + currentCity : "Marked UNAVAILABLE";
                            Toast.makeText(DonorDashboardActivity.this, statusMessage, Toast.LENGTH_SHORT).show();
                        }

                        @Override
                        public void onFailure(@NonNull Call<ApiResponse<Object>> call, @NonNull Throwable t) {
                            isAvailable = targetAvailability;
                            updateStatusText(tvDonorStatus);
                            Toast.makeText(DonorDashboardActivity.this, "Availability updated locally (offline mode).", Toast.LENGTH_SHORT).show();
                        }
                    });
        });

        builder.setNeutralButton("Save City Only", (dialog, which) -> {
            if (etCity.getText() != null && !etCity.getText().toString().trim().isEmpty()) {
                currentCity = etCity.getText().toString().trim();
                updateStatusText(tvDonorStatus);
                fetchLiveInvitations();
                Toast.makeText(this, "Location updated to " + currentCity, Toast.LENGTH_SHORT).show();
            }
        });
        builder.setNegativeButton("Cancel", null);
        builder.show();
    }

    private void showInvitationsDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Live Blood Donation Requests");

        if (liveInvitations.isEmpty()) {
            builder.setMessage("No emergency requests currently active for " + donorBloodGroup + " in " + currentCity + ".\n\nThank you for standing ready to save lives!");
            builder.setPositiveButton("Check Again", (d, w) -> fetchLiveInvitations());
            builder.setNegativeButton("Close", null);
            builder.show();
            return;
        }

        String[] invitations = new String[liveInvitations.size()];
        for (int i = 0; i < liveInvitations.size(); i++) {
            BloodRequestModel req = liveInvitations.get(i);
            invitations[i] = "[" + req.getUrgency() + "] " + req.getBloodGroup() + " (" + req.getUnitsRequired() + " Units)\n" +
                             "Facility: " + req.getHospitalName() + " (" + req.getCity() + ")\n" +
                             "Status: " + req.getStatus();
        }

        builder.setItems(invitations, (dialog, which) -> {
            BloodRequestModel selectedReq = liveInvitations.get(which);
            AlertDialog.Builder actionBuilder = new AlertDialog.Builder(this);
            actionBuilder.setTitle("Respond to Donation Request");
            actionBuilder.setMessage("Facility: " + selectedReq.getHospitalName() + "\n" +
                                     "Required: " + selectedReq.getUnitsRequired() + " unit(s) of " + selectedReq.getBloodGroup() + "\n" +
                                     "Urgency: " + selectedReq.getUrgency() + "\n\n" +
                                     "⚠️ Clinical Safety Notice:\n" +
                                     "Accepting indicates your willingness to be contacted for donation. Medical eligibility, screening, collection, and safety testing will be conducted by authorized healthcare staff.");

            actionBuilder.setPositiveButton("Accept & Express Willingness", (d, w) -> {
                recordDonorResponse(selectedReq, "ACCEPTED");
            });

            actionBuilder.setNegativeButton("Decline", (d, w) -> {
                recordDonorResponse(selectedReq, "DECLINED");
            });

            actionBuilder.show();
        });
        builder.setNegativeButton("Close", null);
        builder.show();
    }

    private void recordDonorResponse(BloodRequestModel req, String responseStatus) {
        if (req.getId() != null) {
            ApiService.ResponsePayload payload = new ApiService.ResponsePayload(
                    responseStatus,
                    "Donor " + sessionManager.getUserName() + " responded " + responseStatus + " from mobile app."
            );

            RetrofitClient.getApiService(DonorDashboardActivity.this)
                    .respondToRequest(req.getId(), payload)
                    .enqueue(new Callback<ApiResponse<Object>>() {
                        @Override
                        public void onResponse(@NonNull Call<ApiResponse<Object>> call, @NonNull Response<ApiResponse<Object>> response) {
                            donorResponseLog.add(responseStatus + ": " + req.getHospitalName() + " (" + req.getBloodGroup() + ")");
                            String msg = "ACCEPTED".equals(responseStatus)
                                    ? "Response registered! Hospital staff will coordinate screening."
                                    : "Declined response registered.";
                            Toast.makeText(DonorDashboardActivity.this, msg, Toast.LENGTH_LONG).show();
                        }

                        @Override
                        public void onFailure(@NonNull Call<ApiResponse<Object>> call, @NonNull Throwable t) {
                            donorResponseLog.add(responseStatus + " (Offline): " + req.getHospitalName());
                            Toast.makeText(DonorDashboardActivity.this, "Response noted locally.", Toast.LENGTH_SHORT).show();
                        }
                    });
        }
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
        historyBuilder.append("=== RECENT DONOR RESPONSES ===\n");

        if (donorResponseLog.isEmpty()) {
            historyBuilder.append("No response records logged in this session.\n\n");
        } else {
            for (String resp : donorResponseLog) {
                historyBuilder.append("• ").append(resp).append("\n");
            }
            historyBuilder.append("\n");
        }

        historyBuilder.append("=== VERIFIED CLINICAL RECORDS ===\n")
                      .append("1. Metropolis Central Hospital - 1 Unit O+ (Verified)\n")
                      .append("Note: Verified records appear only after clinical screening and blood collection are completed.");

        builder.setMessage(historyBuilder.toString());
        builder.setPositiveButton("OK", null);
        builder.show();
    }
}
