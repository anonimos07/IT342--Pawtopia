package com.example.pawtopia.repository

import android.util.Log
import com.example.pawtopia.model.Order
import com.example.pawtopia.model.OrderItem
import com.example.pawtopia.model.User
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

    suspend fun getOrdersByUserId(userId: Long): Result<List<Order>> {
        return try {
            val request = Request.Builder()
                .url("https://it342-pawtopia-10.onrender.com/api/order/getAllOrdersByUserId?userId=$userId")
                .get()
                .addHeader("Authorization", "Bearer ${sessionManager.getToken()}")
                .build()

            val response = withContext(Dispatchers.IO) {
                client.newCall(request).execute()
            }

            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                if (!responseBody.isNullOrEmpty()) {
                    val jsonArray = JSONArray(responseBody)
                    val orders = mutableListOf<Order>()
                    for (i in 0 until jsonArray.length()) {
                        val jsonObject = jsonArray.getJSONObject(i)
                        orders.add(
                            Order(
                                orderID = jsonObject.getInt("orderID"),
                                orderDate = jsonObject.getString("orderDate"),
                                paymentMethod = jsonObject.getString("paymentMethod"),
                                paymentStatus = jsonObject.getString("paymentStatus"),
                                orderStatus = jsonObject.getString("orderStatus"),
                                totalPrice = jsonObject.getDouble("totalPrice"),
                                orderItems = null, // We don't need items in the list view
                                user = null
                            )
                        )
                    }
                    Result.Success(orders)
                } else {
                    Result.Error(Exception("Empty response body"))
                }
            } else {
                Result.Error(Exception("Failed to get orders: ${response.code}"))
            }
        } catch (e: Exception) {
            Log.e("OrderRepository", "Error getting orders", e)
            Result.Error(e)
        }
    }

    // Added getOrderById method to fetch a specific order with its details
    suspend fun getOrderById(orderId: Int): Result<Order> {
        return try {
            val token = sessionManager.getToken()
            if (token.isNullOrEmpty()) {
                return Result.Error(Exception("Authentication required"))
            }

            val request = Request.Builder()
                .url("https://it342-pawtopia-10.onrender.com/api/order/getOrderDetails/$orderId")
                .get()
                .addHeader("Authorization", "Bearer $token")
                .build()

            val response = withContext(Dispatchers.IO) {
                client.newCall(request).execute()
            }

            when {
                response.code == 401 -> {
                    Result.Error(Exception("Unauthorized - Please login again"))
                }

                response.code == 403 -> {
                    Result.Error(Exception("You don't have permission to view this order"))
                }

                response.isSuccessful -> {
                    val responseBody = response.body?.string()
                    if (!responseBody.isNullOrEmpty()) {
                        try {
                            val jsonObject = JSONObject(responseBody)

                            // Parse order items
                            val orderItemsJsonArray = jsonObject.getJSONArray("orderItems")
                            val orderItems = mutableListOf<OrderItem>()

                            for (i in 0 until orderItemsJsonArray.length()) {
                                val orderItemJson = orderItemsJsonArray.getJSONObject(i)
                                orderItems.add(
                                    OrderItem(
                                        orderItemID = orderItemJson.getInt("orderItemID"),
                                        orderItemName = orderItemJson.getString("orderItemName"),
                                        orderItemImage = orderItemJson.getString("orderItemImage"),
                                        price = orderItemJson.getDouble("price"),
                                        quantity = orderItemJson.getInt("quantity"),
                                        productId = orderItemJson.getString("productId"),
                                        isRated = orderItemJson.optBoolean("isRated", false),
                                        order = null // Avoid circular reference
                                    )
                                )
                            }

                            // Parse user info
                            val userJson = jsonObject.getJSONObject("user")
                            val user = User(
                                userId = userJson.getLong("userId"),
                                username = userJson.getString("username"),
                                password = "", // Don't store password
                                firstName = userJson.optString("firstName", ""),
                                lastName = userJson.optString("lastName", ""),
                                email = userJson.optString("email", ""),
                                role = userJson.optString("role", "USER"),
                                googleId = userJson.optString("googleId", null),
                                authProvider = userJson.optString("authProvider", null),
                                address = null, // AddressResponse would need to be parsed separately if needed
                                cart = null // Cart would need to be parsed separately if needed
                            )

                            // Create complete order object
                            val order = Order(
                                orderID = jsonObject.getInt("orderID"),
                                orderDate = jsonObject.getString("orderDate"),
                                paymentMethod = jsonObject.getString("paymentMethod"),
                                paymentStatus = jsonObject.getString("paymentStatus"),
                                orderStatus = jsonObject.getString("orderStatus"),
                                totalPrice = jsonObject.getDouble("totalPrice"),
                                orderItems = orderItems,
                                user = user
                            )

                            Result.Success(order)
                        } catch (e: Exception) {
                            Result.Error(Exception("Error parsing response: ${e.message}"))
                        }
                    } else {
                        Result.Error(Exception("Empty response body"))
                    }
                }

                else -> {
                    Result.Error(Exception("Failed to get order: ${response.code}"))
                }
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }
}