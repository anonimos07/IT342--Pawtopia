package com.example.pawtopia

import com.example.pawtopia.util.SessionManager  // Import added
import okhttp3.Interceptor
import okhttp3.Response

class AuthInterceptor(private val sessionManager: SessionManager) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val newRequest = request.newBuilder().apply {
            sessionManager.getToken()?.let { token ->
                addHeader("Authorization", "Bearer $token")
            }
        }.build()
        return chain.proceed(newRequest)
    }
}