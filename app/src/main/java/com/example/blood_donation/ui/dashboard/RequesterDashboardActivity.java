package com.example.blood_donation.ui.dashboard;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
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

    private TextView tvWelcomeUser, tvActiveCount, tvRefreshRequests;
    private Button btnCreateRequest, btnSearchDonors, btnLogout;
    private LinearLayout layoutEmptyRequests, containerRequestsList;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_requester_dashboard);

        sessionManager = new SessionManager(this);

        tvWelcomeUser = findViewById(R.id.tvWelcomeUser);
        tvActiveCount = findViewById(R.id.tvActiveCount);
        tvRefreshRequests = findViewById(R.id.tvRefreshRequests);
        btnCreateRequest = findViewById(R.id.btnCreateRequest);
        btnSearchDonors = findViewById(R.id.btnSearchDonors);
        btnLogout = findViewById(R.id.btnLogout);
        layoutEmptyRequests = findViewById(R.id.layoutEmptyRequests);
        containerRequestsList = findViewById(R.id.containerRequestsList);

        tvWelcomeUser.setText("Welcome, " + sessionManager.getUserName() + "!");

        btnCreateRequest.setOnClickListener(v -> showCreateRequestDialog());
        btnSearchDonors.setOnClickListener(v -> showSearchDonorsDialog());
        tvRefreshRequests.setOnClickListener(v -> {
            Toast.makeText(this, "Refreshing requisitions...", Toast.LENGTH_SHORT).show();
            loadRequestsFromBackend();
        });

        btnLogout.setOnClickListener(v -> {
            sessionManager.logout();
            Intent intent = new Intent(RequesterDashboardActivity.this, WelcomeActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
            finish();
        });

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
                    renderRequestsList();
                } else {
                    renderRequestsList();
                }
            }

            @Override
            public void onFailure(@NonNull Call<ApiResponse<List<BloodRequestModel>>> call, @NonNull Throwable t) {
                renderRequestsList();
            }
        });
    }

    private void renderRequestsList() {
        containerRequestsList.removeAllViews();
        int activeCount = 0;

        for (BloodRequestModel req : activeRequestsList) {
            if (!BloodRequestModel.STATUS_CANCELLED.equals(req.getStatus()) &&
                !BloodRequestModel.STATUS_FULFILLED.equals(req.getStatus())) {
                activeCount++;
            }
        }
        tvActiveCount.setText(String.valueOf(activeCount));

        if (activeRequestsList.isEmpty()) {
            layoutEmptyRequests.setVisibility(View.VISIBLE);
            return;
        }

        layoutEmptyRequests.setVisibility(View.GONE);
        LayoutInflater inflater = LayoutInflater.from(this);

        for (BloodRequestModel req : activeRequestsList) {
            View cardView = inflater.inflate(R.layout.item_blood_request, containerRequestsList, false);

            TextView tvCardBloodGroup = cardView.findViewById(R.id.tvCardBloodGroup);
            TextView tvCardUnits = cardView.findViewById(R.id.tvCardUnits);
            TextView tvCardUrgency = cardView.findViewById(R.id.tvCardUrgency);
            TextView tvCardHospital = cardView.findViewById(R.id.tvCardHospital);
            TextView tvCardPatient = cardView.findViewById(R.id.tvCardPatient);
            TextView tvCardStatusMessage = cardView.findViewById(R.id.tvCardStatusMessage);
            Button btnCancelRequest = cardView.findViewById(R.id.btnCancelRequest);

            tvCardBloodGroup.setText(req.getBloodGroup() != null ? req.getBloodGroup() : "O+");
            tvCardUnits.setText("(" + req.getUnitsRequired() + " Units)");
            tvCardUrgency.setText(req.getUrgency() != null ? req.getUrgency() : "HIGH");
            tvCardHospital.setText(req.getHospitalName() != null ? req.getHospitalName() : "Metropolis Central Hospital");

            String patientInfo = "Contact: " + (req.getContactName() != null ? req.getContactName() : "Requester") +
                                 " • " + (req.getContactPhone() != null ? req.getContactPhone() : "+1 555-0199");
            tvCardPatient.setText(patientInfo);

            String statusMsg = req.getStatusDisplayMessage();
            tvCardStatusMessage.setText(statusMsg);

            if (BloodRequestModel.STATUS_CANCELLED.equals(req.getStatus()) ||
                BloodRequestModel.STATUS_FULFILLED.equals(req.getStatus())) {
                btnCancelRequest.setVisibility(View.GONE);
            } else {
                btnCancelRequest.setVisibility(View.VISIBLE);
                btnCancelRequest.setOnClickListener(v -> cancelRequest(req));
            }

            containerRequestsList.addView(cardView);
        }
    }

    private void cancelRequest(BloodRequestModel req) {
        if (req.getId() != null) {
            RetrofitClient.getApiService(this)
                    .updateRequestStatus(req.getId(), new ApiService.StatusPayload(BloodRequestModel.STATUS_CANCELLED))
                    .enqueue(new Callback<ApiResponse<BloodRequestModel>>() {
                        @Override
                        public void onResponse(@NonNull Call<ApiResponse<BloodRequestModel>> call,
                                               @NonNull Response<ApiResponse<BloodRequestModel>> response) {
                            req.setStatus(BloodRequestModel.STATUS_CANCELLED);
                            Toast.makeText(RequesterDashboardActivity.this, "Request marked as CANCELLED", Toast.LENGTH_SHORT).show();
                            renderRequestsList();
                        }

                        @Override
                        public void onFailure(@NonNull Call<ApiResponse<BloodRequestModel>> call, @NonNull Throwable t) {
                            req.setStatus(BloodRequestModel.STATUS_CANCELLED);
                            Toast.makeText(RequesterDashboardActivity.this, "Request marked as CANCELLED (local)", Toast.LENGTH_SHORT).show();
                            renderRequestsList();
                        }
                    });
        }
    }

    private void showCreateRequestDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Create Emergency Blood Requisition");

        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(40, 20, 40, 10);

        final EditText etPatientName = new EditText(this);
        etPatientName.setHint("Patient Full Name (e.g., Alex Johnson)");
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
        etHospital.setHint("Hospital / Facility Name");
        layout.addView(etHospital);

        final Spinner spinnerUrgency = new Spinner(this);
        String[] urgencies = new String[]{"CRITICAL", "HIGH", "MEDIUM", "LOW"};
        ArrayAdapter<String> uAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, urgencies);
        spinnerUrgency.setAdapter(uAdapter);
        layout.addView(spinnerUrgency);

        builder.setView(layout);
        builder.setPositiveButton("Submit Emergency Request", (dialog, which) -> {
            String rawPatient = etPatientName.getText() != null ? etPatientName.getText().toString().trim() : "";
            String patient = rawPatient.isEmpty() ? "Emergency Patient" : rawPatient;
            String bg = spinnerBloodGroup.getSelectedItem().toString();
            String unitsStr = etUnits.getText() != null && !etUnits.getText().toString().trim().isEmpty() ? etUnits.getText().toString().trim() : "1";
            int units = Integer.parseInt(unitsStr);
            String hospital = etHospital.getText() != null && !etHospital.getText().toString().trim().isEmpty()
                    ? etHospital.getText().toString().trim() : "Metropolis Central Hospital";
            String urgency = spinnerUrgency.getSelectedItem().toString();

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
            newRequest.setNotes("Emergency patient requirement broadcast");

            RetrofitClient.getApiService(RequesterDashboardActivity.this)
                    .createRequest(newRequest)
                    .enqueue(new Callback<ApiResponse<BloodRequestModel>>() {
                        @Override
                        public void onResponse(@NonNull Call<ApiResponse<BloodRequestModel>> call,
                                               @NonNull Response<ApiResponse<BloodRequestModel>> response) {
                            if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                                BloodRequestModel created = response.body().getData();
                                activeRequestsList.add(0, created != null ? created : newRequest);
                            } else {
                                activeRequestsList.add(0, newRequest);
                            }
                            renderRequestsList();
                            String title = "Blood Request Broadcast";
                            String msg = units + " unit(s) of " + bg + " (" + urgency + "). Sourcing active!";
                            NotificationHelper.showNotification(RequesterDashboardActivity.this, title, msg);
                            Toast.makeText(RequesterDashboardActivity.this, "Requisition Live! Status: SEARCHING_FOR_BLOOD", Toast.LENGTH_LONG).show();
                        }

                        @Override
                        public void onFailure(@NonNull Call<ApiResponse<BloodRequestModel>> call, @NonNull Throwable t) {
                            activeRequestsList.add(0, newRequest);
                            renderRequestsList();
                            Toast.makeText(RequesterDashboardActivity.this, "Request cached locally (offline).", Toast.LENGTH_SHORT).show();
                        }
                    });
        });
        builder.setNegativeButton("Cancel", null);
        builder.show();
    }

    private void showSearchDonorsDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Search Available Blood Donors");

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
        builder.setPositiveButton("Search Donors", (dialog, which) -> {
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
                                    resultsList.add(donor.getFullName() + " (" + donor.getBloodGroup() + ")\n" +
                                            "Location: " + donor.getCity() + " • Phone: " + donor.getPhone());
                                }
                            }

                            if (resultsList.isEmpty()) {
                                resultsList.add("No registered donors found for " + bg + " in " + city + " currently.");
                            }

                            String[] displayArr = resultsList.toArray(new String[0]);
                            AlertDialog.Builder resultBuilder = new AlertDialog.Builder(RequesterDashboardActivity.this);
                            resultBuilder.setTitle("Active Donors (" + bg + " - " + city + ")");
                            resultBuilder.setItems(displayArr, (d, w) -> {
                                if (w < resultsList.size() && !resultsList.get(0).startsWith("No registered")) {
                                    Toast.makeText(RequesterDashboardActivity.this, "Initiating contact with donor...", Toast.LENGTH_SHORT).show();
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
