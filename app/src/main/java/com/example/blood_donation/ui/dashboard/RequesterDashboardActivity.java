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

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;

import com.example.blood_donation.R;
import com.example.blood_donation.data.model.BloodRequestModel;
import com.example.blood_donation.ui.auth.WelcomeActivity;
import com.example.blood_donation.utils.NotificationHelper;
import com.example.blood_donation.utils.SessionManager;

import java.util.ArrayList;
import java.util.List;

public class RequesterDashboardActivity extends AppCompatActivity {

    private SessionManager sessionManager;
    private final List<BloodRequestModel> activeRequestsList = new ArrayList<>();

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

        // Initialize sample request for tracking
        BloodRequestModel sampleReq = new BloodRequestModel(
                "REQ-" + (System.currentTimeMillis() % 10000),
                "O+",
                2,
                "HIGH",
                BloodRequestModel.STATUS_SEARCHING_FOR_BLOOD,
                "City General Hospital",
                "New York",
                sessionManager.getUserName(),
                "+1 555-0199"
        );
        activeRequestsList.add(sampleReq);
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
            String hospital = etHospital.getText() != null ? etHospital.getText().toString().trim() : "General Hospital";
            String urgency = spinnerUrgency.getSelectedItem().toString();

            // Status is set to SEARCHING_FOR_BLOOD when initial search is active
            String reqId = "REQ-" + (System.currentTimeMillis() % 10000);
            BloodRequestModel newRequest = new BloodRequestModel(
                    reqId,
                    bg,
                    units,
                    urgency,
                    BloodRequestModel.STATUS_SEARCHING_FOR_BLOOD,
                    hospital,
                    "New York",
                    patient,
                    "+1 555-0199"
            );
            activeRequestsList.add(0, newRequest);

            String title = "Blood Request Created (" + reqId + ")";
            String msg = "Request for " + units + " unit(s) of " + bg + " (" + urgency + ") created. Status: SEARCHING_FOR_BLOOD.";

            NotificationHelper.showNotification(this, title, msg);
            Toast.makeText(this, "Request Created! Status set to: SEARCHING_FOR_BLOOD", Toast.LENGTH_LONG).show();
        });
        builder.setNegativeButton("Cancel", null);
        builder.show();
    }

    private void showTrackRequestsDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("My Requests & Live Tracking");

        if (activeRequestsList.isEmpty()) {
            builder.setMessage("No active blood requests submitted yet.");
            builder.setPositiveButton("OK", null);
            builder.show();
            return;
        }

        String[] reqDisplayList = new String[activeRequestsList.size()];
        int idx = 0;
        for (BloodRequestModel req : activeRequestsList) {
            reqDisplayList[idx++] = req.getId() + " | " + req.getBloodGroup() + " (" + req.getUnitsRequired() + " Units)\n" +
                                    "Status: " + req.getStatus() + "\n" +
                                    "Hospital: " + req.getHospitalName();
        }

        builder.setItems(reqDisplayList, (dialog, which) -> {
            BloodRequestModel selectedReq = activeRequestsList.get(which);
            AlertDialog.Builder detailBuilder = new AlertDialog.Builder(this);
            detailBuilder.setTitle("Request Details: " + selectedReq.getId());

            String detailMsg = "Blood Group: " + selectedReq.getBloodGroup() + "\n" +
                               "Units Needed: " + selectedReq.getUnitsRequired() + "\n" +
                               "Hospital: " + selectedReq.getHospitalName() + "\n" +
                               "Urgency: " + selectedReq.getUrgency() + "\n" +
                               "Status Message: " + selectedReq.getStatusDisplayMessage() + "\n\n" +
                               "Note: Blood shortage handling is active. The system will continue searching active donors as availability updates.";

            detailBuilder.setMessage(detailMsg);
            detailBuilder.setPositiveButton("Keep Searching", (d, w) -> Toast.makeText(this, "Request remains ACTIVE in SEARCHING_FOR_BLOOD status.", Toast.LENGTH_SHORT).show());
            detailBuilder.setNegativeButton("Cancel Request", (d, w) -> {
                selectedReq.setStatus(BloodRequestModel.STATUS_CANCELLED);
                Toast.makeText(this, "Request " + selectedReq.getId() + " marked as CANCELLED.", Toast.LENGTH_LONG).show();
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
        etCity.setHint("Enter City (e.g., New York)");
        layout.addView(etCity);

        builder.setView(layout);
        builder.setPositiveButton("Search", (dialog, which) -> {
            String bg = spinnerBloodGroup.getSelectedItem().toString();
            String rawCity = etCity.getText() != null ? etCity.getText().toString().trim() : "";
            String city = rawCity.isEmpty() ? "All Cities" : rawCity;

            AlertDialog.Builder resultBuilder = new AlertDialog.Builder(this);
            resultBuilder.setTitle("Matching Donors (" + bg + " - " + city + ")");
            String[] results = new String[]{
                    "John Doe (" + bg + ") - Available in " + city + " | Phone: +1 555-0192",
                    "Sarah Smith (" + bg + ") - Available in " + city + " | Phone: +1 555-0143",
                    "Michael Brown (" + bg + ") - Available in " + city + " | Phone: +1 555-0188"
            };
            resultBuilder.setItems(results, (d, w) -> Toast.makeText(this, "Contacting donor: " + results[w].split("\\|")[0], Toast.LENGTH_LONG).show());
            resultBuilder.setNegativeButton("Close", null);
            resultBuilder.show();
        });
        builder.setNegativeButton("Cancel", null);
        builder.show();
    }
}
