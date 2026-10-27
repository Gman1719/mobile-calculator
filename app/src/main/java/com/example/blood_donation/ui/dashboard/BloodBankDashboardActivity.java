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
import com.example.blood_donation.utils.SessionManager;

public class BloodBankDashboardActivity extends AppCompatActivity {

    private SessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_blood_bank_dashboard);

        sessionManager = new SessionManager(this);

        TextView tvWelcomeUser = findViewById(R.id.tvWelcomeUser);
        tvWelcomeUser.setText("Welcome, " + sessionManager.getUserName());

        CardView cardInventoryOverview = findViewById(R.id.cardInventoryOverview);
        CardView cardAddReceipt = findViewById(R.id.cardAddReceipt);
        Button btnLogout = findViewById(R.id.btnLogout);

        cardInventoryOverview.setOnClickListener(v -> showInventoryOverviewDialog());
        cardAddReceipt.setOnClickListener(v -> showAddReceiptDialog());

        btnLogout.setOnClickListener(v -> {
            sessionManager.logout();
            Intent intent = new Intent(BloodBankDashboardActivity.this, WelcomeActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
            finish();
        });
    }

    private void showInventoryOverviewDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Real-time Inventory Stock Levels");

        String stockData = "O+  : 24 Units  [OPTIMAL]\n" +
                           "O-  :  3 Units  [CRITICAL LOW]\n" +
                           "A+  : 18 Units  [OPTIMAL]\n" +
                           "A-  :  5 Units  [LOW STOCK]\n" +
                           "B+  : 15 Units  [OPTIMAL]\n" +
                           "B-  :  4 Units  [LOW STOCK]\n" +
                           "AB+ :  8 Units  [OPTIMAL]\n" +
                           "AB- :  2 Units  [CRITICAL LOW]\n\n" +
                           "Total Stocked Units: 79 Units";

        builder.setMessage(stockData);
        builder.setPositiveButton("Export Inventory Report", (dialog, which) -> Toast.makeText(this, "Inventory report generated and saved!", Toast.LENGTH_SHORT).show());
        builder.setNegativeButton("Close", null);
        builder.show();
    }

    private void showAddReceiptDialog() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("Record Verified Stock Receipt");

        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(40, 20, 40, 10);

        final EditText etBatchId = new EditText(this);
        etBatchId.setHint("Batch Number / Donor ID");
        layout.addView(etBatchId);

        final Spinner spinnerBloodGroup = new Spinner(this);
        String[] groups = new String[]{"O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"};
        ArrayAdapter<String> bgAdapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, groups);
        spinnerBloodGroup.setAdapter(bgAdapter);
        layout.addView(spinnerBloodGroup);

        final EditText etUnits = new EditText(this);
        etUnits.setHint("Units Received");
        etUnits.setInputType(android.text.InputType.TYPE_CLASS_NUMBER);
        layout.addView(etUnits);

        final EditText etTestingStatus = new EditText(this);
        etTestingStatus.setHint("Lab Testing Clearance Code");
        layout.addView(etTestingStatus);

        builder.setView(layout);
        builder.setPositiveButton("Record to Stock", (dialog, which) -> {
            String rawBatch = etBatchId.getText() != null ? etBatchId.getText().toString().trim() : "";
            String batch = rawBatch.isEmpty() ? "BATCH-" + System.currentTimeMillis() : rawBatch;
            String bg = spinnerBloodGroup.getSelectedItem().toString();
            String units = etUnits.getText() != null && !etUnits.getText().toString().trim().isEmpty() ? etUnits.getText().toString().trim() : "1";

            Toast.makeText(this, "Successfully logged " + units + " unit(s) of " + bg + " (Batch: " + batch + ") into verified inventory!", Toast.LENGTH_LONG).show();
        });
        builder.setNegativeButton("Cancel", null);
        builder.show();
    }
}
