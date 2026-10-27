package com.example.blood_donation.data.local;

import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;

import java.util.List;

@Dao
public interface RequestDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertRequests(List<CachedBloodRequest> requests);

    @Query("SELECT * FROM cached_requests ORDER BY id DESC")
    List<CachedBloodRequest> getAllCachedRequests();

    @Query("DELETE FROM cached_requests")
    void clearAll();
}
