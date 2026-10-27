package com.example.blood_donation.ui.auth;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;

import com.example.blood_donation.R;

public class AccountTypeSelectionActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_account_type_selection);

        CardView cardDonor = findViewById(R.id.cardDonor);
        CardView cardRequester = findViewById(R.id.cardRequester);
        CardView cardWebNotice = findViewById(R.id.cardWebNotice);
        TextView tvLoginLink = findViewById(R.id.tvLoginLink);

        cardDonor.setOnClickListener(v -> openIndividualRegistration("DONOR"));
        cardRequester.setOnClickListener(v -> openIndividualRegistration("REQUESTER"));

        cardWebNotice.setOnClickListener(v -> {
            Toast.makeText(this, "Redirecting to Web Portal: https://portal.blooddonation.org", Toast.LENGTH_LONG).show();
            try {
                Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("https://portal.blooddonation.org"));
                startActivity(browserIntent);
            } catch (Exception e) {
                // Ignore if browser not available in emulator
            }
        });

        tvLoginLink.setOnClickListener(v -> startActivity(new Intent(this, LoginActivity.class)));
    }

    private void openIndividualRegistration(String role) {
        Intent intent = new Intent(this, RegisterActivity.class);
        intent.putExtra("PRESELECTED_ROLE", role);
        startActivity(intent);
    }
}
