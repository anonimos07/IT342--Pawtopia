package com.example.pawtopia.repository

import android.util.Log
import com.example.pawtopia.model.Appointment
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
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.time.LocalTime
import java.util.Date
import java.util.Locale
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

    // Add this to your AppointmentRepository.kt
    suspend fun getAppointmentsByEmail(email: String): Result<List<Appointment>> {
        return try {
            Log.d("AppointmentRepository", "Fetching appointments for email: $email")

            val request = Request.Builder()
                .url("https://it342-pawtopia-10.onrender.com/appointments/byUserEmail/$email")
                .get()
                .addHeader("Content-Type", "application/json")
                .addHeader("Authorization", "Bearer ${sessionManager.getToken()}")
                .build()

            val response = withContext(Dispatchers.IO) {
                client.newCall(request).execute()
            }

            Log.d("AppointmentRepository", "Response code: ${response.code}")

            if (response.isSuccessful) {
                val responseBody = response.body?.string() // Store the string result
                Log.d("AppointmentRepository", "Response body: $responseBody") // Log the stored string

                if (!responseBody.isNullOrEmpty()) {
                    val jsonArray = JSONArray(responseBody)
                    val appointments = mutableListOf<Appointment>()
                    for (i in 0 until jsonArray.length()) {
                        val jsonObject = jsonArray.getJSONObject(i)

                        // Parse the date string to a Date object
                        val dateString = jsonObject.getString("date")
                        val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                        val date = dateFormat.parse(dateString)

                        appointments.add(
                            Appointment(
                                appId = jsonObject.getLong("appId"),
                                date = date ?: Date(), // Use the parsed date
                                email = jsonObject.getString("email"),
                                contactNo = jsonObject.getString("contactNo"),
                                time = LocalTime.parse(jsonObject.getString("time")),
                                canceled = jsonObject.getBoolean("canceled"),
                                confirmed = jsonObject.getBoolean("confirmed"),
                                groomService = jsonObject.getString("groomService"),
                                price = jsonObject.getInt("price")
                            )
                        )
                    }
                    Result.Success(appointments)
                } else {
                    Result.Error(Exception("Empty response body"))
                }
            } else {
                Log.e("AppointmentRepository", "Failed to fetch appointments: ${response.code}")
                Result.Error(Exception("Failed to fetch appointments: ${response.code}"))
            }
        } catch (e: Exception) {
            Log.e("AppointmentRepository", "Error fetching appointments", e)
            Result.Error(e)
        }
    }
}