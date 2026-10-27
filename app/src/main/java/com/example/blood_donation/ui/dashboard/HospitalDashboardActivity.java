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
import com.example.blood_donation.ui.auth.WelcomeActivity;
import com.example.blood_donation.utils.NotificationHelper;
import com.example.blood_donation.utils.SessionManager;

public class HospitalDashboardActivity extends AppCompatActivity {

    private SessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_hospital_dashboard);

        sessionManager = new SessionManager(this);

        TextView tvWelcomeUser = findViewById(R.id.tvWelcomeUser);
        tvWelcomeUser.setText("Welcome, " + sessionManager.getUserName());

        CardView cardCreateHospitalRequest = findViewById(R.id.cardCreateHospitalRequest);
        CardView cardQueryBloodBank = findViewById(R.id.cardQueryBloodBank);
        Button btnLogout = findViewById(R.id.btnLogout);

        cardCreateHospitalRequest.setOnClickListener(v -> showCreateHospitalRequestDialog());
        cardQueryBloodBank.setOnClickListener(v -> showQueryBloodBankDialog());

        btnLogout.setOnClickListener(v -> {
            sessionManager.logout();
            Intent intent = new Intent(HospitalDashboardActivity.this, WelcomeActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
            finish();
        });
    }

    private void showCreateHospitalRequestDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Official Hospital Blood Requisition");

        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(40, 20, 40, 10);

        final EditText etPatientId = new EditText(this);
        etPatientId.setHint("Patient Record ID / Ward");
        layout.addView(etPatientId);

        final Spinner spinnerComponent = new Spinner(this);
        String[] components = new String[]{"Whole Blood", "Packed Red Blood Cells (PRBC)", "Platelet Concentrate", "Fresh Frozen Plasma (FFP)"};
        ArrayAdapter<String> cAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, components);
        spinnerComponent.setAdapter(cAdapter);
        layout.addView(spinnerComponent);

        final Spinner spinnerBloodGroup = new Spinner(this);
        String[] groups = new String[]{"O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"};
        ArrayAdapter<String> bgAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, groups);
        spinnerBloodGroup.setAdapter(bgAdapter);
        layout.addView(spinnerBloodGroup);

        final EditText etUnits = new EditText(this);
        etUnits.setHint("Units Needed");
        etUnits.setInputType(android.text.InputType.TYPE_CLASS_NUMBER);
        layout.addView(etUnits);

        builder.setView(layout);
        builder.setPositiveButton("Submit Official Request", (dialog, which) -> {
            String rawPatientId = etPatientId.getText() != null ? etPatientId.getText().toString().trim() : "";
            String patientId = rawPatientId.isEmpty() ? "Patient-Ward-A" : rawPatientId;
            String comp = spinnerComponent.getSelectedItem().toString();
            String bg = spinnerBloodGroup.getSelectedItem().toString();
            String units = etUnits.getText() != null && !etUnits.getText().toString().trim().isEmpty() ? etUnits.getText().toString().trim() : "1";

            String title = "Hospital Requisition Logged";
            String message = "Requested " + units + " unit(s) of " + comp + " (" + bg + ") for " + patientId;

            NotificationHelper.showNotification(this, title, message);
            Toast.makeText(this, "Clinical requisition logged & broadcasted!", Toast.LENGTH_LONG).show();
        });
        builder.setNegativeButton("Cancel", null);
        builder.show();
    }

    private void showQueryBloodBankDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Partner Blood Bank Inventories");

        String[] bloodBanks = new String[]{
                "1. Central Red Cross Blood Bank - O+: 15 Units, A+: 8 Units, B+: 12 Units",
                "2. City Memorial Blood Repository - O-: 3 Units, AB+: 5 Units, B-: 2 Units",
                "3. Metropolitan Medical Blood Center - A-: 4 Units, O+: 20 Units, AB-: 1 Unit"
        };

        builder.setItems(bloodBanks, (dialog, which) -> {
            AlertDialog.Builder reserveBuilder = new AlertDialog.Builder(this);
            reserveBuilder.setTitle("Reserve Stock Units");
            reserveBuilder.setMessage("Send official reservation requisition to:\n" + bloodBanks[which] + "?");
            reserveBuilder.setPositiveButton("Send Reservation Request", (d, w) -> Toast.makeText(this, "Reservation request sent to Blood Bank Officer!", Toast.LENGTH_LONG).show());
            reserveBuilder.setNegativeButton("Cancel", null);
            reserveBuilder.show();
        });
        builder.setNegativeButton("Close", null);
        builder.show();
    }
}
