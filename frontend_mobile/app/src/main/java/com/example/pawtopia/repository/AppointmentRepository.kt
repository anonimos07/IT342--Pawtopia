package com.example.pawtopia.repository

import android.util.Log
import com.example.pawtopia.model.AppointmentRequest
import com.example.pawtopia.model.AppointmentResponse
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

class AppointmentRepository(private val sessionManager: SessionManager) {
    private val client = OkHttpClient.Builder()
        .connectTimeout(3600, TimeUnit.SECONDS)
        .readTimeout(3600, TimeUnit.SECONDS)
        .writeTimeout(3600, TimeUnit.SECONDS)
        .build()
    private val JSON_MEDIA_TYPE = "application/json; charset=utf-8".toMediaTypeOrNull()

    suspend fun bookAppointment(request: AppointmentRequest): Result<AppointmentResponse> {
        return try {
            val jsonObject = JSONObject().apply {
                put("userId", request.userId)
                put("email", request.email)
                put("contactNo", request.contactNo)
                put("date", request.date)
                put("time", request.time)
                put("groomService", request.groomService)
                put("price", request.price)
            }

            val requestBody = jsonObject.toString().toRequestBody(JSON_MEDIA_TYPE)

            val request = Request.Builder()
                .url("https://it342-pawtopia-10.onrender.com/appointments/postAppointment")
                .post(requestBody)
                .addHeader("Content-Type", "application/json")
                .addHeader("Authorization", "Bearer ${sessionManager.getToken()}")
                .build()

            val response = withContext(Dispatchers.IO) {
                client.newCall(request).execute()
            }

            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                if (!responseBody.isNullOrEmpty()) {
                    val jsonResponse = JSONObject(responseBody)
                    val appointmentResponse = AppointmentResponse(
                        success = jsonResponse.optBoolean("success", false),
                        message = jsonResponse.optString("message", ""),
                        appointmentId = jsonResponse.optLong("appointmentId", 0L)
                    )
                    Result.Success(appointmentResponse)
                } else {
                    Result.Error(Exception("Empty response body"))
                }
            } else {
                Result.Error(Exception("Failed to book appointment: ${response.code}"))
            }
        } catch (e: Exception) {
            Log.e("AppointmentRepository", "Error booking appointment", e)
            Result.Error(e)
        }
    }
}