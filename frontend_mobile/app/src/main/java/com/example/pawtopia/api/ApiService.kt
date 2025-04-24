package com.example.pawtopia.api

import android.util.Log
import com.example.pawtopia.model.LoginRequest
import com.example.pawtopia.model.SignupRequest
import com.example.pawtopia.model.UserProfile
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

class ApiService {
    companion object {
        private const val BASE_URL = "http://10.0.2.2:8080" // Use your actual backend URL
        private const val TAG = "ApiService"
    }

    // Login API call
    suspend fun login(loginRequest: LoginRequest): Result<String> {
        return try {
            val url = URL("$BASE_URL/users/login")
            val connection = url.openConnection() as HttpURLConnection

            // Set up the connection
            connection.requestMethod = "POST"
            connection.setRequestProperty("Content-Type", "application/json")
            connection.setRequestProperty("Accept", "application/json")
            connection.doOutput = true

            // Create JSON request body
            val jsonBody = JSONObject().apply {
                put("username", loginRequest.username)
                put("password", loginRequest.password)
            }

            // Write request body
            val outputStream = OutputStreamWriter(connection.outputStream)
            outputStream.write(jsonBody.toString())
            outputStream.flush()

            // Get response
            val responseCode = connection.responseCode
            if (responseCode == HttpURLConnection.HTTP_OK) {
                val inputStream = connection.inputStream
                val bufferedReader = BufferedReader(InputStreamReader(inputStream))
                val response = bufferedReader.readText()

                bufferedReader.close()
                inputStream.close()

                Result.success(response)
            } else {
                val errorStream = connection.errorStream
                val bufferedReader = BufferedReader(InputStreamReader(errorStream))
                val errorResponse = bufferedReader.readText()

                bufferedReader.close()
                errorStream.close()

                Result.failure(Exception("HTTP Error: $responseCode - $errorResponse"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Login error: ${e.message}", e)
            Result.failure(e)
        }
    }

    // Signup API call
    suspend fun signup(signupRequest: SignupRequest): Result<String> {
        return try {
            val url = URL("$BASE_URL/users/signup")
            val connection = url.openConnection() as HttpURLConnection

            // Set up the connection
            connection.requestMethod = "POST"
            connection.setRequestProperty("Content-Type", "application/json")
            connection.setRequestProperty("Accept", "application/json")
            connection.doOutput = true

            // Create JSON request body
            val jsonBody = JSONObject().apply {
                put("username", signupRequest.username)
                put("password", signupRequest.password)
                put("firstName", signupRequest.firstName)
                put("lastName", signupRequest.lastName)
                put("email", signupRequest.email)
                put("role", signupRequest.role)
            }

            // Write request body
            val outputStream = OutputStreamWriter(connection.outputStream)
            outputStream.write(jsonBody.toString())
            outputStream.flush()

            // Get response
            val responseCode = connection.responseCode
            if (responseCode == HttpURLConnection.HTTP_OK) {
                val inputStream = connection.inputStream
                val bufferedReader = BufferedReader(InputStreamReader(inputStream))
                val response = bufferedReader.readText()

                bufferedReader.close()
                inputStream.close()

                Result.success(response)
            } else {
                val errorStream = connection.errorStream
                val bufferedReader = BufferedReader(InputStreamReader(errorStream))
                val errorResponse = bufferedReader.readText()

                bufferedReader.close()
                errorStream.close()

                Result.failure(Exception("HTTP Error: $responseCode - $errorResponse"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Signup error: ${e.message}", e)
            Result.failure(e)
        }
    }

    // Get user profile API call
    suspend fun getUserProfile(userId: String, token: String): Result<UserProfile> {
        return try {
            val url = URL("$BASE_URL/users/user/$userId")
            val connection = url.openConnection() as HttpURLConnection

            // Set up the connection
            connection.requestMethod = "GET"
            connection.setRequestProperty("Content-Type", "application/json")
            connection.setRequestProperty("Accept", "application/json")
            connection.setRequestProperty("Authorization", "Bearer $token")

            // Get response
            val responseCode = connection.responseCode
            if (responseCode == HttpURLConnection.HTTP_OK) {
                val inputStream = connection.inputStream
                val bufferedReader = BufferedReader(InputStreamReader(inputStream))
                val response = bufferedReader.readText()

                bufferedReader.close()
                inputStream.close()

                // Parse JSON response
                val jsonObject = JSONObject(response)
                val userProfile = UserProfile(
                    username = jsonObject.getString("username"),
                    firstName = jsonObject.getString("firstName"),
                    lastName = jsonObject.getString("lastName"),
                    email = jsonObject.getString("email"),
                    role = jsonObject.getString("role")
                )

                Result.success(userProfile)
            } else {
                val errorStream = connection.errorStream
                val bufferedReader = BufferedReader(InputStreamReader(errorStream))
                val errorResponse = bufferedReader.readText()

                bufferedReader.close()
                errorStream.close()

                Result.failure(Exception("HTTP Error: $responseCode - $errorResponse"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Get user profile error: ${e.message}", e)
            Result.failure(e)
        }
    }
}
