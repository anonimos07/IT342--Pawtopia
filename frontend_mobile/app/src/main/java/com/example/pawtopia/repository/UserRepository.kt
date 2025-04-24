package com.example.pawtopia.repository

import com.example.pawtopia.api.ApiService
import com.example.pawtopia.model.LoginRequest
import com.example.pawtopia.model.SignupRequest
import com.example.pawtopia.model.UserProfile

class UserRepository {
    private val apiService = ApiService()

    suspend fun login(username: String, password: String): Result<String> {
        return apiService.login(LoginRequest(username, password))
    }

    suspend fun signup(
        username: String,
        password: String,
        firstName: String,
        lastName: String,
        email: String
    ): Result<String> {
        return apiService.signup(
            SignupRequest(
                username = username,
                password = password,
                firstName = firstName,
                lastName = lastName,
                email = email
            )
        )
    }

    suspend fun getUserProfile(userId: String, token: String): Result<UserProfile> {
        return apiService.getUserProfile(userId, token)
    }
}
