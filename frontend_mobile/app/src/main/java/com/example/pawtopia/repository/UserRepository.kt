package com.example.pawtopia.repository

import android.util.Log
import com.example.pawtopia.model.AddressRequest
import com.example.pawtopia.model.AddressResponse
import com.example.pawtopia.util.Result
import com.example.pawtopia.util.SessionManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class UserRepository(private val sessionManager: SessionManager) {
    private val client = OkHttpClient.Builder()
        .connectTimeout(3600, TimeUnit.SECONDS)
        .readTimeout(3600, TimeUnit.SECONDS)
        .writeTimeout(3600, TimeUnit.SECONDS)
        .build()
    private val JSON_MEDIA_TYPE = "application/json; charset=utf-8".toMediaTypeOrNull()

    suspend fun getUserAddress(userId: Long): Result<AddressResponse> {
        return try {
            val request = Request.Builder()
                .url("https://it342-pawtopia-10.onrender.com/adresses/get-users/$userId")
                .get()
                .addHeader("Authorization", "Bearer ${sessionManager.getToken()}")
                .build()

            val response = withContext(Dispatchers.IO) {
                client.newCall(request).execute()
            }

            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                if (!responseBody.isNullOrEmpty()) {
                    val jsonResponse = JSONObject(responseBody)
                    val addressResponse = AddressResponse(
                        addressId = jsonResponse.getLong("addressId"),
                        region = jsonResponse.getString("region"),
                        province = jsonResponse.getString("province"),
                        city = jsonResponse.getString("city"),
                        barangay = jsonResponse.getString("barangay"),
                        postalCode = jsonResponse.getString("postalCode"),
                        streetBuildingHouseNo = jsonResponse.optString("streetBuildingHouseNo")
                    )
                    Result.Success(addressResponse)
                } else {
                    Result.Error(Exception("Empty response body"))
                }
            } else {
                Result.Error(Exception("Failed to get address: ${response.code}"))
            }
        } catch (e: Exception) {
            Log.e("UserRepository", "Error getting address", e)
            Result.Error(e)
        }
    }

    suspend fun updateUserAddress(userId: Long, address: AddressRequest): Result<Unit> {
        return try {
            val jsonObject = JSONObject().apply {
                put("region", address.region)
                put("province", address.province)
                put("city", address.city)
                put("barangay", address.barangay)
                put("postalCode", address.postalCode)
                put("streetBuildingHouseNo", address.streetBuildingHouseNo)
            }

            val requestBody = jsonObject.toString().toRequestBody(JSON_MEDIA_TYPE)

            val request = Request.Builder()
                .url("https://it342-pawtopia-10.onrender.com/adresses/users/$userId")
                .put(requestBody)
                .addHeader("Content-Type", "application/json")
                .addHeader("Authorization", "Bearer ${sessionManager.getToken()}")
                .build()

            val response = withContext(Dispatchers.IO) {
                client.newCall(request).execute()
            }

            if (response.isSuccessful) {
                Result.Success(Unit)
            } else {
                Result.Error(Exception("Failed to update address: ${response.code}"))
            }
        } catch (e: Exception) {
            Log.e("UserRepository", "Error updating address", e)
            Result.Error(e)
        }
    }
}