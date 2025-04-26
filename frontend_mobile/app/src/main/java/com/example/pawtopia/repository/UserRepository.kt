package com.example.pawtopia.repository

import com.example.pawtopia.api.ApiClient
import com.example.pawtopia.model.AddressRequest
import com.example.pawtopia.model.AddressResponse
import com.example.pawtopia.model.LoginRequest
import com.example.pawtopia.model.LoginResponse
import com.example.pawtopia.model.SignupRequest
import com.example.pawtopia.util.SessionManager
import retrofit2.Response

class UserRepository(private val sessionManager: SessionManager) {
    // Initialize ApiService through ApiClient
    private val apiService: ApiClient.ApiService by lazy {
        ApiClient.createApiService(sessionManager)
    }

    suspend fun login(loginRequest: LoginRequest): Result<LoginResponse> {
        return try {
            val response = apiService.login(loginRequest)
            if (response.isSuccessful) {
                response.body()?.let {
                    Result.success(it)
                } ?: Result.failure(Exception("Empty response body"))
            } else {
                Result.failure(Exception("Login failed: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun signup(
        username: String,
        password: String,
        firstName: String,
        lastName: String,
        email: String
    ): Result<Unit> {
        return try {
            val response = apiService.signup(
                SignupRequest(
                    username = username,
                    password = password,
                    firstName = firstName,
                    lastName = lastName,
                    email = email
                )
            )
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Signup failed: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getUserAddress(userId: Long): Result<AddressResponse> {
        return try {
            val response = apiService.getUserAddress(userId)
            if (response.isSuccessful) {
                response.body()?.let {
                    Result.success(it)
                } ?: Result.failure(Exception("Empty response body"))
            } else {
                Result.failure(Exception("Failed to get address: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateUserAddress(userId: Long, address: AddressRequest): Result<Unit> {
        return try {
            val response = apiService.updateUserAddress(userId, address)
            if (response.isSuccessful) {
                Result.success(Unit)
            } else {
                Result.failure(Exception("Failed to update address: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}