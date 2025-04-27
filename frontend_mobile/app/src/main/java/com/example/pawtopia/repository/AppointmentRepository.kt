package com.example.pawtopia.repository

import com.example.pawtopia.api.ApiClient
import com.example.pawtopia.model.AppointmentRequest
import com.example.pawtopia.model.AppointmentResponse
import com.example.pawtopia.util.Result
import com.example.pawtopia.util.SessionManager
import retrofit2.HttpException
import java.io.IOException

class AppointmentRepository(private val sessionManager: SessionManager) {
    private val apiService = ApiClient.createApiService(sessionManager)

    suspend fun bookAppointment(request: AppointmentRequest): Result<AppointmentResponse> {
        return try {
            val response = apiService.bookAppointment(request)
            if (response.isSuccessful) {
                response.body()?.let {
                    Result.Success(it)
                } ?: Result.Error(Exception("Empty response body"))
            } else {
                Result.Error(Exception("Failed to book appointment: ${response.code()} ${response.message()}"))
            }
        } catch (e: IOException) {
            Result.Error(Exception("Network error: ${e.message}"))
        } catch (e: HttpException) {
            Result.Error(Exception("HTTP error: ${e.message}"))
        } catch (e: Exception) {
            Result.Error(Exception("Unexpected error: ${e.message}"))
        }
    }
}