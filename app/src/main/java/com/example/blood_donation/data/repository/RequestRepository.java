package com.example.blood_donation.data.repository;

import android.content.Context;

import com.example.blood_donation.data.local.AppDatabase;
import com.example.blood_donation.data.local.CachedBloodRequest;
import com.example.blood_donation.data.local.RequestDao;
import com.example.blood_donation.data.model.ApiResponse;
import com.example.blood_donation.data.model.BloodRequestModel;
import com.example.blood_donation.data.network.ApiService;
import com.example.blood_donation.data.network.RetrofitClient;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RequestRepository {

    private final ApiService apiService;
    private final RequestDao requestDao;
    private final ExecutorService executor;

    public interface RequestCallback {
        void onSuccess(List<BloodRequestModel> requests, boolean isOffline);
        void onError(String message);
    }

    public RequestRepository(Context context) {
        this.apiService = RetrofitClient.getApiService(context);
        this.requestDao = AppDatabase.getInstance(context).requestDao();
        this.executor = Executors.newSingleThreadExecutor();
    }

    public void fetchRequests(String bloodGroup, String city, String status, RequestCallback callback) {
        apiService.getRequests(bloodGroup, city, status).enqueue(new Callback<ApiResponse<List<BloodRequestModel>>>() {
            @Override
            public void onResponse(Call<ApiResponse<List<BloodRequestModel>>> call, Response<ApiResponse<List<BloodRequestModel>>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().isSuccess()) {
                    List<BloodRequestModel> remoteRequests = response.body().getData();
                    callback.onSuccess(remoteRequests, false);

                    // Cache in Room DB asynchronously
                    executor.execute(() -> {
                        List<CachedBloodRequest> cacheList = new ArrayList<>();
                        for (BloodRequestModel req : remoteRequests) {
                            cacheList.add(new CachedBloodRequest(
                                    req.getId(),
                                    req.getBloodGroup(),
                                    req.getUnitsRequired(),
                                    req.getUrgency(),
                                    req.getStatus(),
                                    req.getHospitalName(),
                                    req.getTown(),
                                    req.getCity(),
                                    req.getContactPhone()
                            ));
                        }
                        requestDao.clearAll();
                        requestDao.insertRequests(cacheList);
                    });
                } else {
                    fetchFromOfflineCache(callback, "API error: " + response.message());
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<List<BloodRequestModel>>> call, Throwable t) {
                fetchFromOfflineCache(callback, "Network offline. Displaying cached requests.");
            }
        });
    }

    private void fetchFromOfflineCache(RequestCallback callback, String errorMessage) {
        executor.execute(() -> {
            List<CachedBloodRequest> cachedList = requestDao.getAllCachedRequests();
            List<BloodRequestModel> convertedList = new ArrayList<>();

            for (CachedBloodRequest c : cachedList) {
                BloodRequestModel model = new BloodRequestModel(
                        c.getId(),
                        c.getBloodGroup(),
                        c.getUnitsRequired(),
                        c.getUrgency(),
                        c.getStatus(),
                        c.getHospitalName(),
                        c.getCity(),
                        "Contact Person",
                        c.getContactPhone()
                );
                convertedList.add(model);
            }

            if (!convertedList.isEmpty()) {
                callback.onSuccess(convertedList, true);
            } else {
                callback.onError(errorMessage);
            }
        });
    }
}
