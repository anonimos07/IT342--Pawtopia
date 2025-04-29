package com.example.pawtopia.repository

import android.util.Log
import com.example.pawtopia.model.Order
import com.example.pawtopia.model.OrderItem
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
import java.util.Date
import java.util.concurrent.TimeUnit

class OrderRepository(private val sessionManager: SessionManager) {

    private val client = OkHttpClient.Builder()
        .connectTimeout(3600, TimeUnit.SECONDS)
        .readTimeout(3600, TimeUnit.SECONDS)
        .writeTimeout(3600, TimeUnit.SECONDS)
        .build()

    private val JSON_MEDIA_TYPE = "application/json; charset=utf-8".toMediaTypeOrNull()

    suspend fun placeOrder(order: Order): Result<Order> {
        return try {
            val dateFormat = SimpleDateFormat("yyyy-MM-dd")
            val orderItemsJson = JSONArray()
            order.orderItems?.forEach { orderItem ->
                val orderItemJson = JSONObject().apply {
                    put("orderItemName", orderItem.orderItemName)
                    put("orderItemImage", orderItem.orderItemImage)
                    put("price", orderItem.price)
                    put("quantity", orderItem.quantity)
                    put("productId", orderItem.productId)
                    put("isRated", orderItem.isRated)
                }
                orderItemsJson.put(orderItemJson)
            }

            val jsonObject = JSONObject().apply {
                put("orderDate", dateFormat.format(Date()))
                put("paymentMethod", order.paymentMethod)
                put("paymentStatus", order.paymentStatus)
                put("orderStatus", order.orderStatus)
                put("totalPrice", order.totalPrice)
                put("orderItems", orderItemsJson)
                put("user", JSONObject().apply { put("userId", order.user?.userId) })
            }

            val requestBody = jsonObject.toString().toRequestBody(JSON_MEDIA_TYPE)

            val request = Request.Builder()
                .url("https://it342-pawtopia-10.onrender.com/api/order/postOrderRecord")
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
                    Result.Success(
                        Order(
                            orderID = jsonResponse.getInt("orderID"),
                            orderDate = jsonResponse.getString("orderDate"),
                            paymentMethod = jsonResponse.getString("paymentMethod"),
                            paymentStatus = jsonResponse.getString("paymentStatus"),
                            orderStatus = jsonResponse.getString("orderStatus"),
                            totalPrice = jsonResponse.getDouble("totalPrice"),
                            orderItems = order.orderItems,
                            user = order.user
                        )
                    )
                } else {
                    Result.Error(Exception("Empty response body"))
                }
            } else {
                Result.Error(Exception("Failed to place order: ${response.code}"))
            }
        } catch (e: Exception) {
            Log.e("OrderRepository", "Error placing order", e)
            Result.Error(e)
        }
    }
}
