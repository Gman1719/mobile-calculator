package com.example.blood_donation.data.network;

import com.example.blood_donation.data.model.ApiResponse;
import com.example.blood_donation.data.model.BloodRequestModel;
import com.example.blood_donation.data.model.DonorModel;
import com.example.blood_donation.data.model.LoginRequest;
import com.example.blood_donation.data.model.LoginResponseData;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface ApiService {

    @POST("auth/login")
    Call<ApiResponse<LoginResponseData>> login(@Body LoginRequest request);

    @GET("donors/search")
    Call<ApiResponse<List<DonorModel>>> searchDonors(
            @Query("bloodGroup") String bloodGroup,
            @Query("city") String city,
            @Query("town") String town
    );

    @GET("requests")
    Call<ApiResponse<List<BloodRequestModel>>> getRequests(
            @Query("bloodGroup") String bloodGroup,
            @Query("city") String city,
            @Query("status") String status
    );

    @POST("requests")
    Call<ApiResponse<BloodRequestModel>> createRequest(@Body BloodRequestModel request);

    @GET("requests/my-requests")
    Call<ApiResponse<List<BloodRequestModel>>> getMyRequests();

    @POST("requests/{id}/respond")
    Call<ApiResponse<Object>> respondToRequest(
            @Path("id") String requestId,
            @Body ResponsePayload responsePayload
    );

    class ResponsePayload {
        private String responseStatus;
        private String notes;

        public ResponsePayload(String responseStatus, String notes) {
            this.responseStatus = responseStatus;
            this.notes = notes;
        }

        public String getResponseStatus() {
            return responseStatus;
        }

        public String getNotes() {
            return notes;
        }
    }
}
