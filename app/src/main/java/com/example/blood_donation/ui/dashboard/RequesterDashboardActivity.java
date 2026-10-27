package com.example.blood_donation.ui.dashboard;

import android.content.Intent;
import android.os.Bundle;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;

import com.example.blood_donation.R;
import com.example.blood_donation.data.model.ApiResponse;
import com.example.blood_donation.data.model.BloodRequestModel;
import com.example.blood_donation.data.model.DonorModel;
import com.example.blood_donation.data.network.ApiService;
import com.example.blood_donation.data.network.RetrofitClient;
import com.example.blood_donation.ui.auth.WelcomeActivity;
import com.example.blood_donation.utils.NotificationHelper;
import com.example.blood_donation.utils.SessionManager;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RequesterDashboardActivity extends AppCompatActivity {

    private SessionManager sessionManager;
    private final List<BloodRequestModel> activeRequestsList = new ArrayList<>();
    private TextView tvStatusSummary;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_requester_dashboard);

        sessionManager = new SessionManager(this);

        TextView tvWelcomeUser = findViewById(R.id.tvWelcomeUser);
        tvWelcomeUser.setText("Welcome, " + sessionManager.getUserName());

        CardView cardCreateRequest = findViewById(R.id.cardCreateRequest);
        CardView cardTrackRequests = findViewById(R.id.cardTrackRequests);
        CardView cardSearchDonors = findViewById(R.id.cardSearchDonors);
        Button btnLogout = findViewById(R.id.btnLogout);

        cardCreateRequest.setOnClickListener(v -> showCreateRequestDialog());
        cardTrackRequests.setOnClickListener(v -> showTrackRequestsDialog());
        cardSearchDonors.setOnClickListener(v -> showSearchDonorsDialog());

        btnLogout.setOnClickListener(v -> {
            sessionManager.logout();
            Intent intent = new Intent(RequesterDashboardActivity.this, WelcomeActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
            finish();
        });

        // Fetch live blood requests for this requester
        loadRequestsFromBackend();
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadRequestsFromBackend();
    }

    private void loadRequestsFromBackend() {
        RetrofitClient.getApiService(this).getMyRequests().enqueue(new Callback<ApiResponse<List<BloodRequestModel>>>() {
            @Override
            public void onResponse(@NonNull Call<ApiResponse<List<BloodRequestModel>>> call,
                                   @NonNull Response<ApiResponse<List<BloodRequestModel>>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    List<BloodRequestModel> serverList = response.body().getData();
                    activeRequestsList.clear();
                    if (serverList != null && !serverList.isEmpty()) {
                        activeRequestsList.addAll(serverList);
                    }
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<List<BloodRequestModel>>> call, @NonNull Throwable t) {
                // If network is offline, keep existing list without crashing
            }
        });
    }

    private void showCreateRequestDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Create Emergency Blood Request");

        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(40, 20, 40, 10);

        final EditText etPatientName = new EditText(this);
        etPatientName.setHint("Patient Full Name");
        layout.addView(etPatientName);

        final Spinner spinnerBloodGroup = new Spinner(this);
        String[] groups = new String[]{"O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"};
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, groups);
        spinnerBloodGroup.setAdapter(adapter);
        layout.addView(spinnerBloodGroup);

        final EditText etUnits = new EditText(this);
        etUnits.setHint("Units Required (e.g. 2)");
        etUnits.setInputType(android.text.InputType.TYPE_CLASS_NUMBER);
        layout.addView(etUnits);

        final EditText etHospital = new EditText(this);
        etHospital.setHint("Hospital Name");
        layout.addView(etHospital);

        final Spinner spinnerUrgency = new Spinner(this);
        String[] urgencies = new String[]{"CRITICAL", "HIGH", "MEDIUM", "LOW"};
        ArrayAdapter<String> uAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, urgencies);
        spinnerUrgency.setAdapter(uAdapter);
        layout.addView(spinnerUrgency);

        builder.setView(layout);
        builder.setPositiveButton("Submit Request", (dialog, which) -> {
            String rawPatient = etPatientName.getText() != null ? etPatientName.getText().toString().trim() : "";
            String patient = rawPatient.isEmpty() ? "Emergency Patient" : rawPatient;
            String bg = spinnerBloodGroup.getSelectedItem().toString();
            String unitsStr = etUnits.getText() != null && !etUnits.getText().toString().trim().isEmpty() ? etUnits.getText().toString().trim() : "1";
            int units = Integer.parseInt(unitsStr);
            String hospital = etHospital.getText() != null && !etHospital.getText().toString().trim().isEmpty()
                    ? etHospital.getText().toString().trim() : "Metropolis Central Hospital";
            String urgency = spinnerUrgency.getSelectedItem().toString();

            // Prepare payload with SEARCHING_FOR_BLOOD as initial workflow status
            BloodRequestModel newRequest = new BloodRequestModel();
            newRequest.setBloodGroup(bg);
            newRequest.setUnitsRequired(units);
            newRequest.setUrgency(urgency);
            newRequest.setStatus(BloodRequestModel.STATUS_SEARCHING_FOR_BLOOD);
            newRequest.setHospitalName(hospital);
            newRequest.setCity("Metropolis");
            newRequest.setTown("Central");
            newRequest.setContactName(patient);
            newRequest.setContactPhone("+1 555-0199");
            newRequest.setNotes("Requester urgent submission");

            // Transmit to live backend REST API
            RetrofitClient.getApiService(RequesterDashboardActivity.this)
                    .createRequest(newRequest)
                    .enqueue(new Callback<ApiResponse<BloodRequestModel>>() {
                        @Override
                        public void onResponse(@NonNull Call<ApiResponse<BloodRequestModel>> call,
                                               @NonNull Response<ApiResponse<BloodRequestModel>> response) {
                            if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                                BloodRequestModel created = response.body().getData();
                                if (created != null) {
                                    activeRequestsList.add(0, created);
                                } else {
                                    activeRequestsList.add(0, newRequest);
                                }
                                String reqId = created != null && created.getId() != null ? created.getId().substring(0, Math.min(8, created.getId().length())) : "NEW";
                                String title = "Request Created (" + reqId + ")";
                                String msg = units + " unit(s) of " + bg + " (" + urgency + "). Status: SEARCHING_FOR_BLOOD.";

                                NotificationHelper.showNotification(RequesterDashboardActivity.this, title, msg);
                                Toast.makeText(RequesterDashboardActivity.this, "Request Transmitted! Status: SEARCHING_FOR_BLOOD", Toast.LENGTH_LONG).show();
                            } else {
                                activeRequestsList.add(0, newRequest);
                                Toast.makeText(RequesterDashboardActivity.this, "Request queued locally (offline fallback).", Toast.LENGTH_SHORT).show();
                            }
                        }

                        @Override
                        public void onFailure(@NonNull Call<ApiResponse<BloodRequestModel>> call, @NonNull Throwable t) {
                            activeRequestsList.add(0, newRequest);
                            Toast.makeText(RequesterDashboardActivity.this, "Network unavailable, cached locally.", Toast.LENGTH_SHORT).show();
                        }
                    });
        });
        builder.setNegativeButton("Cancel", null);
        builder.show();
    }

    private void showTrackRequestsDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("My Requests & Live Tracking");

        if (activeRequestsList.isEmpty()) {
            builder.setMessage("No active blood requests submitted yet.\n\nTap 'Create Emergency Request' to submit a new requirement.");
            builder.setPositiveButton("OK", null);
            builder.show();
            return;
        }

        String[] reqDisplayList = new String[activeRequestsList.size()];
        int idx = 0;
        for (BloodRequestModel req : activeRequestsList) {
            String shortId = req.getId() != null && req.getId().length() > 8 ? req.getId().substring(0, 8) : req.getId();
            reqDisplayList[idx++] = shortId + " | " + req.getBloodGroup() + " (" + req.getUnitsRequired() + " Units)\n" +
                                    "Status: " + req.getStatus() + "\n" +
                                    "Hospital: " + req.getHospitalName();
        }

        builder.setItems(reqDisplayList, (dialog, which) -> {
            BloodRequestModel selectedReq = activeRequestsList.get(which);
            AlertDialog.Builder detailBuilder = new AlertDialog.Builder(this);
            detailBuilder.setTitle("Request Details: " + (selectedReq.getId() != null ? selectedReq.getId() : "PENDING"));

            String detailMsg = "Blood Group: " + selectedReq.getBloodGroup() + "\n" +
                               "Units Needed: " + selectedReq.getUnitsRequired() + "\n" +
                               "Hospital: " + selectedReq.getHospitalName() + "\n" +
                               "Urgency: " + selectedReq.getUrgency() + "\n" +
                               "Live Status: " + selectedReq.getStatus() + "\n" +
                               "Status Message: " + selectedReq.getStatusDisplayMessage() + "\n\n" +
                               "• Sourcing Strategy: Parallel search across participating blood banks and registered donors.\n" +
                               "• Note: Transfusion suitability and clinical cross-matching must be verified by hospital staff.";

            detailBuilder.setMessage(detailMsg);
            detailBuilder.setPositiveButton("Keep Active", (d, w) ->
                    Toast.makeText(this, "Request remains ACTIVE in " + selectedReq.getStatus() + " status.", Toast.LENGTH_SHORT).show());

            detailBuilder.setNegativeButton("Cancel Request", (d, w) -> {
                if (selectedReq.getId() != null) {
                    RetrofitClient.getApiService(RequesterDashboardActivity.this)
                            .updateRequestStatus(selectedReq.getId(), new ApiService.StatusPayload(BloodRequestModel.STATUS_CANCELLED))
                            .enqueue(new Callback<ApiResponse<BloodRequestModel>>() {
                                @Override
                                public void onResponse(@NonNull Call<ApiResponse<BloodRequestModel>> call,
                                                       @NonNull Response<ApiResponse<BloodRequestModel>> response) {
                                    selectedReq.setStatus(BloodRequestModel.STATUS_CANCELLED);
                                    Toast.makeText(RequesterDashboardActivity.this, "Request marked as CANCELLED.", Toast.LENGTH_SHORT).show();
                                }

                                @Override
                                public void onFailure(@NonNull Call<ApiResponse<BloodRequestModel>> call, @NonNull Throwable t) {
                                    selectedReq.setStatus(BloodRequestModel.STATUS_CANCELLED);
                                    Toast.makeText(RequesterDashboardActivity.this, "Request cancelled locally.", Toast.LENGTH_SHORT).show();
                                }
                            });
                } else {
                    selectedReq.setStatus(BloodRequestModel.STATUS_CANCELLED);
                    Toast.makeText(this, "Request cancelled.", Toast.LENGTH_SHORT).show();
                }
            });
            detailBuilder.show();
        });
        builder.setNegativeButton("Close", null);
        builder.show();
    }

    private void showSearchDonorsDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Search Active Donors");

        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(40, 30, 40, 10);

        final Spinner spinnerBloodGroup = new Spinner(this);
        String[] groups = new String[]{"O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"};
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, groups);
        spinnerBloodGroup.setAdapter(adapter);
        layout.addView(spinnerBloodGroup);

        final EditText etCity = new EditText(this);
        etCity.setHint("Enter City (e.g., Metropolis)");
        etCity.setText("Metropolis");
        layout.addView(etCity);

        builder.setView(layout);
        builder.setPositiveButton("Search", (dialog, which) -> {
            String bg = spinnerBloodGroup.getSelectedItem().toString();
            String rawCity = etCity.getText() != null ? etCity.getText().toString().trim() : "";
            String city = rawCity.isEmpty() ? "Metropolis" : rawCity;

            RetrofitClient.getApiService(RequesterDashboardActivity.this)
                    .searchDonors(bg, city, null)
                    .enqueue(new Callback<ApiResponse<List<DonorModel>>>() {
                        @Override
                        public void onResponse(@NonNull Call<ApiResponse<List<DonorModel>>> call,
                                               @NonNull Response<ApiResponse<List<DonorModel>>> response) {
                            List<String> resultsList = new ArrayList<>();
                            if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                                for (DonorModel donor : response.body().getData()) {
                                    resultsList.add(donor.getFullName() + " (" + donor.getBloodGroup() + ") - " + donor.getCity() + "\nPhone: " + donor.getPhone());
                                }
                            }

                            if (resultsList.isEmpty()) {
                                resultsList.add("No registered donors found for " + bg + " in " + city + " currently.");
                            }

                            String[] displayArr = resultsList.toArray(new String[0]);
                            AlertDialog.Builder resultBuilder = new AlertDialog.Builder(RequesterDashboardActivity.this);
                            resultBuilder.setTitle("Matching Donors (" + bg + " - " + city + ")");
                            resultBuilder.setItems(displayArr, (d, w) -> {
                                if (w < resultsList.size() && !resultsList.get(0).startsWith("No registered")) {
                                    Toast.makeText(RequesterDashboardActivity.this, "Contacting donor...", Toast.LENGTH_SHORT).show();
                                }
                            });
                            resultBuilder.setNegativeButton("Close", null);
                            resultBuilder.show();
                        }

                        @Override
                        public void onFailure(@NonNull Call<ApiResponse<List<DonorModel>>> call, @NonNull Throwable t) {
                            Toast.makeText(RequesterDashboardActivity.this, "Could not contact donor search service.", Toast.LENGTH_SHORT).show();
                        }
                    });
        });
        builder.setNegativeButton("Cancel", null);
        builder.show();
    }
}
