package com.example.pawtopia.repository

import android.util.Log
import com.example.pawtopia.model.Order
import com.example.pawtopia.model.PaymentLink
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

class PaymentRepository(private val sessionManager: SessionManager) {

    private val client = OkHttpClient.Builder()
        .connectTimeout(60, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .build()

    private val JSON_MEDIA_TYPE = "application/json; charset=utf-8".toMediaTypeOrNull()

    // Create a payment link using PayMongo API via our backend
    suspend fun createPaymentLink(order: Order): Result<PaymentLink> {
        return try {
            val jsonObject = JSONObject().apply {
                put("totalPrice", order.totalPrice)
                put("description", "A Great Way to Spend Money to your Pets!")
                put("remarks", "Shop Again!")
            }

            Log.d("PaymentRepository", "Request payload: ${jsonObject.toString()}")

            val requestBody = jsonObject.toString().toRequestBody(JSON_MEDIA_TYPE)

            val request = Request.Builder()
                .url("https://it342-pawtopia-10.onrender.com/api/payment/create-payment")
                .post(requestBody)
                .addHeader("Content-Type", "application/json")
                .addHeader("Authorization", "Bearer ${sessionManager.getToken()}")
                .build()

            val response = withContext(Dispatchers.IO) {
                client.newCall(request).execute()
            }

            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                Log.d("PaymentRepository", "Success response: $responseBody")

                if (!responseBody.isNullOrEmpty()) {
                    try {
                        val jsonResponse = JSONObject(responseBody)
                        val checkoutUrl = jsonResponse.getString("checkoutUrl")

                        Result.Success(
                            PaymentLink(
                                checkoutUrl = checkoutUrl,
                                referenceNumber = jsonResponse.optString("referenceNumber", ""),
                                isSuccess = true
                            )
                        )
                    } catch (e: Exception) {
                        Log.e("PaymentRepository", "Error parsing response", e)
                        Result.Error(Exception("Error parsing payment response: ${e.message}"))
                    }
                } else {
                    Result.Error(Exception("Empty payment response body"))
                }
            } else {
                val errorBody = response.body?.string()
                Log.e("PaymentRepository", "Error ${response.code}: $errorBody")
                Result.Error(Exception("Failed to create payment: ${response.code} - $errorBody"))
            }
        } catch (e: Exception) {
            Log.e("PaymentRepository", "Error creating payment", e)
            Result.Error(e)
        }
    }
}