package com.example.pawtopia.repository

import android.util.Log
import com.example.pawtopia.model.Product
import com.example.pawtopia.util.Result
import com.example.pawtopia.util.SessionManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import java.util.concurrent.TimeUnit

class ProductRepository(private val sessionManager: SessionManager) {
    private val client = OkHttpClient.Builder()
        .connectTimeout(3600, TimeUnit.SECONDS)
        .readTimeout(3600, TimeUnit.SECONDS)
        .writeTimeout(3600, TimeUnit.SECONDS)
        .build()

    suspend fun getProducts(type: String? = null): Result<List<Product>> {
        return try {
            val url = if (type != null) {
                "https://it342-pawtopia-10.onrender.com/api/product/getProduct?type=$type"
            } else {
                "https://it342-pawtopia-10.onrender.com/api/product/getProduct"
            }

            val requestBuilder = Request.Builder()
                .url(url)
                .get()

            // Only add authorization header if user is logged in
            sessionManager.getToken()?.let { token ->
                requestBuilder.addHeader("Authorization", "Bearer $token")
            }

            val request = requestBuilder.build()

            val response = withContext(Dispatchers.IO) {
                client.newCall(request).execute()
            }

            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                if (!responseBody.isNullOrEmpty()) {
                    val jsonArray = JSONArray(responseBody)
                    val products = mutableListOf<Product>()
                    for (i in 0 until jsonArray.length()) {
                        val jsonObject = jsonArray.getJSONObject(i)
                        products.add(
                            Product(
                                productID = jsonObject.getInt("productID"),
                                description = jsonObject.getString("description"),
                                productPrice = jsonObject.getDouble("productPrice"),
                                productName = jsonObject.getString("productName"),
                                productType = jsonObject.getString("productType"),
                                quantity = jsonObject.getInt("quantity"),
                                quantitySold = jsonObject.getInt("quantitySold"),
                                productImage = jsonObject.getString("productImage")
                            )
                        )
                    }
                    Result.Success(products)
                } else {
                    Result.Error(Exception("Empty response body"))
                }
            } else {
                Result.Error(Exception("Failed to get products: ${response.code}"))
            }
        } catch (e: Exception) {
            Log.e("ProductRepository", "Error getting products", e)
            Result.Error(e)
        }
    }
}