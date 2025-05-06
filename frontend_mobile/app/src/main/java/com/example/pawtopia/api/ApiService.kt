package com.example.pawtopia.api

import com.example.pawtopia.model.LoginRequest
import com.example.pawtopia.model.LoginResponse
import com.example.pawtopia.util.SessionManager
import com.example.pawtopia.AuthInterceptor
import com.example.pawtopia.model.AddressRequest
import com.example.pawtopia.model.AddressResponse
import com.example.pawtopia.model.AppointmentRequest
import com.example.pawtopia.model.AppointmentResponse
import com.example.pawtopia.model.Product
import com.example.pawtopia.model.SignupRequest
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query
import java.util.concurrent.TimeUnit

object ApiClient {
    private const val BASE_URL = "https://it342-pawtopia-10.onrender.com/"

//    private val httpLogger = HttpLoggingInterceptor().apply {
//        level = HttpLoggingInterceptor.Level.BODY
//    }

    interface ApiService {
        @POST("/users/login")
        suspend fun login(@Body request: LoginRequest): Response<LoginResponse>
        @POST("/users/signup")
        suspend fun signup(@Body request: SignupRequest): Response<Unit>
        @GET("/adresses/get-users/{userId}")
        suspend fun getUserAddress(@Path("userId") userId: Long): Response<AddressResponse>
        @PUT("/adresses/users/{userId}")
        suspend fun updateUserAddress(
            @Path("userId") userId: Long,
            @Body address: AddressRequest
        ): Response<Unit>
        @POST("/appointments/postAppointment")
        suspend fun bookAppointment(@Body request: AppointmentRequest): Response<AppointmentResponse>
        @GET("/api/product/getProduct")
        suspend fun getProducts(): Response<List<Product>>
        @GET("/api/product/getProduct")
        suspend fun getProducts(@Query("type") type: String? = null): Response<List<Product>>
    }

    fun createApiService(sessionManager: SessionManager): ApiService {
        val okHttpClient = OkHttpClient.Builder()
            .connectTimeout(3600, TimeUnit.SECONDS)
            .readTimeout(3600, TimeUnit.SECONDS)
            .writeTimeout(3600, TimeUnit.SECONDS)
            .addInterceptor { chain ->
                val request = chain.request().newBuilder()
            .addHeader("Authorization", "Bearer ${sessionManager.getToken()}")
            .build()
        chain.proceed(request)
    }
            .addInterceptor(AuthInterceptor(sessionManager))
    .build()

    return Retrofit.Builder()
    .baseUrl(BASE_URL)
    .client(okHttpClient)
    .addConverterFactory(GsonConverterFactory.create())
    .build()
    .create(ApiService::class.java)
    }
}