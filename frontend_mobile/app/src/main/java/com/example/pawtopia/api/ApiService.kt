package com.example.pawtopia.api

import com.example.pawtopia.model.LoginRequest
import com.example.pawtopia.model.LoginResponse
import com.example.pawtopia.util.SessionManager
import com.example.pawtopia.AuthInterceptor
import com.example.pawtopia.model.SignupRequest
import okhttp3.OkHttpClient
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST

object ApiClient {  // Renamed from ApiService for clarity
    private const val BASE_URL = "http://10.0.2.2:8080/"  // Update with your backend URL

    // Define your API endpoints in an interface
    interface ApiService {
        @POST("/users/login")
        suspend fun login(@Body request: LoginRequest): Response<LoginResponse>
        @POST("/users/signup")
        suspend fun signup(@Body request: SignupRequest): Response<Unit>
    }

    fun createApiService(sessionManager: SessionManager): ApiService {
        val client = OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor(sessionManager))  // Attach token to requests
            .build()

        return Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}