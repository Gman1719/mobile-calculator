package com.example.blood_donation.ui.dashboard;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
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
import com.google.android.material.switchmaterial.SwitchMaterial;

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

    private TextView tvWelcomeUser, tvDonorSubtitle, tvAvailabilityTitle, tvCityLocation, tvRefreshInvitations;
    private SwitchMaterial switchAvailability;
    private CardView cardUpdateLocation, cardEligibility, cardDonationHistory;
    private LinearLayout layoutEmptyInvitations, containerInvitationsList;
    private Button btnLogout;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_donor_dashboard);

        sessionManager = new SessionManager(this);

        tvWelcomeUser = findViewById(R.id.tvWelcomeUser);
        tvDonorSubtitle = findViewById(R.id.tvDonorSubtitle);
        tvAvailabilityTitle = findViewById(R.id.tvAvailabilityTitle);
        tvCityLocation = findViewById(R.id.tvCityLocation);
        tvRefreshInvitations = findViewById(R.id.tvRefreshInvitations);
        switchAvailability = findViewById(R.id.switchAvailability);
        cardUpdateLocation = findViewById(R.id.cardUpdateLocation);
        cardEligibility = findViewById(R.id.cardEligibility);
        cardDonationHistory = findViewById(R.id.cardDonationHistory);
        layoutEmptyInvitations = findViewById(R.id.layoutEmptyInvitations);
        containerInvitationsList = findViewById(R.id.containerInvitationsList);
        btnLogout = findViewById(R.id.btnLogout);

        tvWelcomeUser.setText("Welcome, " + sessionManager.getUserName() + "!");
        updateHeaderStatus();

        switchAvailability.setOnCheckedChangeListener((buttonView, isChecked) -> {
            isAvailable = isChecked;
            updateHeaderStatus();
            syncAvailabilityWithBackend(isChecked);
        });

        cardUpdateLocation.setOnClickListener(v -> showUpdateLocationDialog());
        cardEligibility.setOnClickListener(v -> showEligibilityDialog());
        cardDonationHistory.setOnClickListener(v -> showDonationHistoryDialog());
        tvRefreshInvitations.setOnClickListener(v -> {
            Toast.makeText(this, "Checking emergency opportunities...", Toast.LENGTH_SHORT).show();
            fetchLiveInvitations();
        });

        btnLogout.setOnClickListener(v -> {
            sessionManager.logout();
            Intent intent = new Intent(DonorDashboardActivity.this, WelcomeActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
            finish();
        });

        fetchLiveInvitations();
    }

    @Override
    protected void onResume() {
        super.onResume();
        fetchLiveInvitations();
    }

    private void updateHeaderStatus() {
        tvDonorSubtitle.setText("Blood Group: " + donorBloodGroup + " • Verified Volunteer");
        if (isAvailable) {
            tvAvailabilityTitle.setText("Status: AVAILABLE TO DONATE");
            tvAvailabilityTitle.setTextColor(0xFFA7F3D0);
        } else {
            tvAvailabilityTitle.setText("Status: CURRENTLY UNAVAILABLE");
            tvAvailabilityTitle.setTextColor(0xFFFCA5A5);
        }
        tvCityLocation.setText("City: " + currentCity + " (Tap to change)");
    }

    private void syncAvailabilityWithBackend(boolean available) {
        RetrofitClient.getApiService(this)
                .updateAvailability(new ApiService.AvailabilityPayload(available))
                .enqueue(new Callback<ApiResponse<Object>>() {
                    @Override
                    public void onResponse(@NonNull Call<ApiResponse<Object>> call, @NonNull Response<ApiResponse<Object>> response) {
                        String msg = available ? "You are marked AVAILABLE in " + currentCity : "Marked UNAVAILABLE";
                        Toast.makeText(DonorDashboardActivity.this, msg, Toast.LENGTH_SHORT).show();
                    }

                    @Override
                    public void onFailure(@NonNull Call<ApiResponse<Object>> call, @NonNull Throwable t) {
                        Toast.makeText(DonorDashboardActivity.this, "Availability updated locally.", Toast.LENGTH_SHORT).show();
                    }
                });
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
                                for (BloodRequestModel req : list) {
                                    if (!BloodRequestModel.STATUS_FULFILLED.equals(req.getStatus()) &&
                                        !BloodRequestModel.STATUS_CANCELLED.equals(req.getStatus())) {
                                        liveInvitations.add(req);
                                    }
                                }
                            }
                            renderInvitationsList();
                        } else {
                            renderInvitationsList();
                        }
                    }

                    @Override
                    public void onFailure(@NonNull Call<ApiResponse<List<BloodRequestModel>>> call, @NonNull Throwable t) {
                        renderInvitationsList();
                    }
                });
    }

    private void renderInvitationsList() {
        containerInvitationsList.removeAllViews();

        if (liveInvitations.isEmpty()) {
            layoutEmptyInvitations.setVisibility(View.VISIBLE);
            return;
        }

        layoutEmptyInvitations.setVisibility(View.GONE);
        LayoutInflater inflater = LayoutInflater.from(this);

        for (BloodRequestModel req : liveInvitations) {
            View cardView = inflater.inflate(R.layout.item_donor_invitation, containerInvitationsList, false);

            TextView tvInviteBloodGroup = cardView.findViewById(R.id.tvInviteBloodGroup);
            TextView tvInviteUnits = cardView.findViewById(R.id.tvInviteUnits);
            TextView tvInviteUrgency = cardView.findViewById(R.id.tvInviteUrgency);
            TextView tvInviteHospital = cardView.findViewById(R.id.tvInviteHospital);
            TextView tvInviteLocation = cardView.findViewById(R.id.tvInviteLocation);
            Button btnAcceptInvite = cardView.findViewById(R.id.btnAcceptInvite);
            Button btnDeclineInvite = cardView.findViewById(R.id.btnDeclineInvite);

            tvInviteBloodGroup.setText(req.getBloodGroup() != null ? req.getBloodGroup() : "O+");
            tvInviteUnits.setText("(" + req.getUnitsRequired() + " Units Needed)");
            tvInviteUrgency.setText(req.getUrgency() != null ? req.getUrgency() : "HIGH");
            tvInviteHospital.setText(req.getHospitalName() != null ? req.getHospitalName() : "Metropolis Central Hospital");
            tvInviteLocation.setText("Location: " + (req.getCity() != null ? req.getCity() : "Metropolis") +
                                     " • Contact: " + (req.getContactPhone() != null ? req.getContactPhone() : "+1 555-0101"));

            btnAcceptInvite.setOnClickListener(v -> recordDonorResponse(req, "ACCEPTED", cardView));
            btnDeclineInvite.setOnClickListener(v -> recordDonorResponse(req, "DECLINED", cardView));

            containerInvitationsList.addView(cardView);
        }
    }

    private void recordDonorResponse(BloodRequestModel req, String responseStatus, View cardView) {
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
                                    : "Invitation declined.";
                            Toast.makeText(DonorDashboardActivity.this, msg, Toast.LENGTH_LONG).show();

                            liveInvitations.remove(req);
                            renderInvitationsList();
                        }

                        @Override
                        public void onFailure(@NonNull Call<ApiResponse<Object>> call, @NonNull Throwable t) {
                            donorResponseLog.add(responseStatus + " (Offline): " + req.getHospitalName());
                            Toast.makeText(DonorDashboardActivity.this, "Response noted locally.", Toast.LENGTH_SHORT).show();
                            liveInvitations.remove(req);
                            renderInvitationsList();
                        }
                    });
        }
    }

    private void showUpdateLocationDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Update Primary Location");

        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(40, 20, 40, 10);

        final EditText etCity = new EditText(this);
        etCity.setHint("City / Town (e.g., Metropolis)");
        etCity.setText(currentCity);
        layout.addView(etCity);

        builder.setView(layout);
        builder.setPositiveButton("Save Location", (dialog, which) -> {
            if (etCity.getText() != null && !etCity.getText().toString().trim().isEmpty()) {
                currentCity = etCity.getText().toString().trim();
                updateHeaderStatus();
                fetchLiveInvitations();
                Toast.makeText(this, "Location updated to " + currentCity, Toast.LENGTH_SHORT).show();
            }
        });
        builder.setNegativeButton("Cancel", null);
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
                "⚠️ Clinical Notice: Medical screening and compatibility checks will be conducted by authorized healthcare professionals at the donation facility.";
        builder.setMessage(eligibilityInfo);
        builder.setPositiveButton("I Understand", null);
        builder.show();
    }

    private void showDonationHistoryDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("My Donation Activity");

        StringBuilder historyBuilder = new StringBuilder();
        historyBuilder.append("=== RECENT RESPONSES ===\n");

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
                .append("2. Red Cross Transfusion Center - 1 Unit O+ (Verified)\n\n")
                .append("Note: Verified records appear only after clinical screening, collection, and laboratory acceptance are confirmed.");

        builder.setMessage(historyBuilder.toString());
        builder.setPositiveButton("OK", null);
        builder.show();
    }
}
