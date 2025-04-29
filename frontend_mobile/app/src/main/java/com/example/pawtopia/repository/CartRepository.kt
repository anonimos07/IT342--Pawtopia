package com.example.pawtopia.repository

import android.util.Log
import com.example.pawtopia.model.Cart
import com.example.pawtopia.model.CartItem
import com.example.pawtopia.model.Product
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

class CartRepository(private val sessionManager: SessionManager) {

    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    private val JSON_MEDIA_TYPE = "application/json; charset=utf-8".toMediaTypeOrNull()

    suspend fun getCartByUserId(userId: Long): Result<Cart> {
        return try {
            val request = Request.Builder()
                .url("https://it342-pawtopia-10.onrender.com/api/cart/getCartById/$userId")
                .get()
                .addHeader("Authorization", "Bearer ${sessionManager.getToken()}")
                .build()

            val response = withContext(Dispatchers.IO) {
                client.newCall(request).execute()
            }

            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                if (!responseBody.isNullOrEmpty()) {
                    val jsonObject = JSONObject(responseBody)
                    val cartItemsJson = jsonObject.getJSONArray("cartItems")
                    val cartItems = mutableListOf<CartItem>()

                    for (i in 0 until cartItemsJson.length()) {
                        val itemJson = cartItemsJson.getJSONObject(i)
                        val productJson = itemJson.getJSONObject("product")
                        cartItems.add(
                            CartItem(
                                cartItemId = itemJson.getInt("cartItemId"),
                                quantity = itemJson.getInt("quantity"),
                                lastUpdated = null, // Not needed for display
                                cart = null, // Not needed for display
                                product = Product(
                                    productID = productJson.getInt("productID"),
                                    description = productJson.getString("description"),
                                    productPrice = productJson.getDouble("productPrice"),
                                    productName = productJson.getString("productName"),
                                    productType = productJson.getString("productType"),
                                    quantity = productJson.getInt("quantity"),
                                    quantitySold = productJson.getInt("quantitySold"),
                                    productImage = productJson.getString("productImage")
                                )
                            )
                        )
                    }
                    Result.Success(Cart(userId, cartItems, null))
                } else {
                    Result.Error(Exception("Empty response body"))
                }
            } else {
                Result.Error(Exception("Failed to get cart: ${response.code}"))
            }
        } catch (e: Exception) {
            Log.e("CartRepository", "Error getting cart", e)
            Result.Error(e)
        }
    }

    suspend fun addCartItem(cartItem: CartItem): Result<CartItem> {
        return try {
            val cartId = cartItem.cart?.cartId ?: return Result.Error(Exception("Cart is null"))

            val jsonObject = JSONObject().apply {
                put("quantity", cartItem.quantity)
                put("cart", JSONObject().apply {
                    put("cartId", cartId)
                })
                put("product", JSONObject().apply {
                    put("productID", cartItem.product.productID)
                })
            }

            val requestBody = jsonObject.toString().toRequestBody(JSON_MEDIA_TYPE)

            val request = Request.Builder()
                .url("https://it342-pawtopia-10.onrender.com/api/cartItem/postCartItem")
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
                        CartItem(
                            cartItemId = jsonResponse.getInt("cartItemId"),
                            quantity = jsonResponse.getInt("quantity"),
                            lastUpdated = null,
                            cart = cartItem.cart,
                            product = cartItem.product
                        )
                    )
                } else {
                    Result.Error(Exception("Empty response body"))
                }
            } else {
                Result.Error(Exception("Failed to add cart item: ${response.code}"))
            }
        } catch (e: Exception) {
            Log.e("CartRepository", "Error adding cart item", e)
            Result.Error(e)
        }
    }

    suspend fun updateCartItemQuantity(cartItemId: Int, newQuantity: Int): Result<Unit> {
        return try {
            val jsonObject = JSONObject().apply {
                put("quantity", newQuantity)
            }

            val requestBody = jsonObject.toString().toRequestBody(JSON_MEDIA_TYPE)

            val request = Request.Builder()
                .url("https://it342-pawtopia-10.onrender.com/api/cartItem/updateCartItem/$cartItemId")
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
                Result.Error(Exception("Failed to update quantity: ${response.code}"))
            }
        } catch (e: Exception) {
            Log.e("CartRepository", "Error updating cart item quantity", e)
            Result.Error(e)
        }
    }

    suspend fun deleteCartItem(cartItemId: Int): Result<Unit> {
        return try {
            val request = Request.Builder()
                .url("https://it342-pawtopia-10.onrender.com/api/cartItem/deleteCartItem/$cartItemId")
                .delete()
                .addHeader("Authorization", "Bearer ${sessionManager.getToken()}")
                .build()

            val response = withContext(Dispatchers.IO) {
                client.newCall(request).execute()
            }

            if (response.isSuccessful) {
                Result.Success(Unit)
            } else {
                Result.Error(Exception("Failed to delete cart item: ${response.code}"))
            }
        } catch (e: Exception) {
            Log.e("CartRepository", "Error deleting cart item", e)
            Result.Error(e)
        }
    }
}