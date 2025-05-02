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
            // Create simplified user JSON object
            val userJson = JSONObject().apply {
                put("userId", order.user?.userId)
                put("username", order.user?.username ?: "")
            }

            // Prepare order items array
            val orderItemsJson = JSONArray()
            order.orderItems?.forEach { orderItem ->
                val orderItemJson = JSONObject().apply {
                    put("orderItemName", orderItem.orderItemName)
                    put("orderItemImage", orderItem.orderItemImage)
                    put("price", orderItem.price)
                    put("quantity", orderItem.quantity)
                    put("productId", orderItem.productId)
                    // Removed isRated as it's not in the frontend implementation
                }
                orderItemsJson.put(orderItemJson)
            }

            // Build the complete order JSON
            val jsonObject = JSONObject().apply {
                put("orderDate", SimpleDateFormat("yyyy-MM-dd").format(Date()))
                put("paymentMethod", order.paymentMethod)
                put("paymentStatus", "PENDING")  // Matches frontend capitalization
                put("orderStatus", "To Receive") // Matches frontend status
                put("totalPrice", order.totalPrice)
                put("orderItems", orderItemsJson)
                put("user", userJson) // Simplified user object
            }

            Log.d("OrderRepository", "Request payload: ${jsonObject.toString()}")

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

            // Enhanced response handling
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                Log.d("OrderRepository", "Success response: $responseBody")

                if (!responseBody.isNullOrEmpty()) {
                    try {
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
                    } catch (e: Exception) {
                        Log.e("OrderRepository", "Error parsing response", e)
                        Result.Error(Exception("Error parsing order response: ${e.message}"))
                    }
                } else {
                    Result.Error(Exception("Empty response body"))
                }
            } else {
                val errorBody = response.body?.string()
                Log.e("OrderRepository", "Error ${response.code}: $errorBody")
                Result.Error(Exception("Failed to place order: ${response.code} - $errorBody"))
            }
        } catch (e: Exception) {
            Log.e("OrderRepository", "Error placing order", e)
            Result.Error(e)
        }
    }

    suspend fun getOrderById(orderId: Int): Result<Order> {
        return try {
            val request = Request.Builder()
                .url("https://it342-pawtopia-10.onrender.com/api/order/getOrderDetails/$orderId") // Changed endpoint
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
                    Result.Success(
                        Order(
                            orderID = jsonResponse.getInt("orderID"),
                            orderDate = jsonResponse.getString("orderDate"),
                            paymentMethod = jsonResponse.getString("paymentMethod"),
                            paymentStatus = jsonResponse.getString("paymentStatus"),
                            orderStatus = jsonResponse.getString("orderStatus"),
                            totalPrice = jsonResponse.getDouble("totalPrice"),
                            orderItems = parseOrderItems(jsonResponse.getJSONArray("orderItems")),
                            user = null // Not needed for confirmation
                        )
                    )
                } else {
                    Result.Error(Exception("Empty response body"))
                }
            } else {
                Result.Error(Exception("Failed to get order: ${response.code}"))
            }
        } catch (e: Exception) {
            Log.e("OrderRepository", "Error getting order", e)
            Result.Error(e)
        }
    }

    private fun parseOrderItems(orderItemsJson: JSONArray): List<OrderItem> {
        val orderItems = mutableListOf<OrderItem>()
        for (i in 0 until orderItemsJson.length()) {
            val itemJson = orderItemsJson.getJSONObject(i)
            orderItems.add(
                OrderItem(
                    orderItemID = itemJson.getInt("orderItemID"),
                    orderItemName = itemJson.getString("orderItemName"),
                    orderItemImage = itemJson.getString("orderItemImage"),
                    price = itemJson.getDouble("price"),
                    quantity = itemJson.getInt("quantity"),
                    productId = itemJson.getString("productId"),
                    isRated = itemJson.optBoolean("isRated", false),
                    order = null
                )
            )
        }
        return orderItems
    }
}