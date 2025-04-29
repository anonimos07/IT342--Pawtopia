package com.example.pawtopia

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.pawtopia.databinding.ActivityLoginBinding
import com.example.pawtopia.util.SessionManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class LoginActivity : AppCompatActivity() {
    private lateinit var binding: ActivityLoginBinding
    private lateinit var sessionManager: SessionManager
    private val client = OkHttpClient.Builder()
        .connectTimeout(3600, TimeUnit.SECONDS)
        .readTimeout(3600, TimeUnit.SECONDS)
        .writeTimeout(3600, TimeUnit.SECONDS)
        .build()
    private val JSON_MEDIA_TYPE = "application/json; charset=utf-8".toMediaTypeOrNull()
    private val TAG = "LoginActivity"
    private var redirectAction = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)
        redirectAction = intent.getStringExtra(LoginRequiredActivity.EXTRA_REDIRECT_ACTION) ?: ""

        if (sessionManager.isLoggedIn()) {
            navigateToMainActivity()
            return
        }

        setupListeners()
    }

    private fun setupListeners() {
        binding.btnLogin.setOnClickListener {
            val usernameOrEmail = binding.etEmail.text.toString().trim()
            val password = binding.etPassword.text.toString().trim()

            if (validateInputs(usernameOrEmail, password)) {
                performLogin(usernameOrEmail, password)
            }
        }

        binding.tvSignUp.setOnClickListener {
            val intent = Intent(this, SignupActivity::class.java)
            if (redirectAction.isNotEmpty()) {
                intent.putExtra(LoginRequiredActivity.EXTRA_REDIRECT_ACTION, redirectAction)
            }
            startActivity(intent)
        }

        binding.btnGoogle.setOnClickListener {
            Toast.makeText(this, "Google login not implemented yet", Toast.LENGTH_SHORT).show()
        }

        binding.tvForgotPassword.setOnClickListener {
            Toast.makeText(this, "Forgot password not implemented yet", Toast.LENGTH_SHORT).show()
        }
    }

    private fun validateInputs(usernameOrEmail: String, password: String): Boolean {
        if (usernameOrEmail.isEmpty()) {
            binding.etEmail.error = "Username/Email cannot be empty"
            return false
        }

        if (password.isEmpty()) {
            binding.etPassword.error = "Password cannot be empty"
            return false
        }

        return true
    }

    private fun performLogin(usernameOrEmail: String, password: String) {
        // Create JSON request body matching your backend User entity
        val jsonObject = JSONObject().apply {
            put("username", usernameOrEmail) // Your backend expects "username" field
            put("password", password)
        }

        val requestBody = jsonObject.toString().toRequestBody(JSON_MEDIA_TYPE)

        // For emulator to connect to localhost (use your actual backend URL in production)
        val request = Request.Builder()
            .url("https://it342-pawtopia-10.onrender.com/users/login") // Same base URL as signup
            .post(requestBody)
            .addHeader("Content-Type", "application/json")
            .build()

        // Show loading state by disabling the button
        binding.btnLogin.isEnabled = false
        binding.btnLogin.text = "Logging in..."

        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val response = client.newCall(request).execute()
                val responseBody = response.body?.string()

                withContext(Dispatchers.Main) {
                    // Restore UI state
                    binding.btnLogin.isEnabled = true
                    binding.btnLogin.text = "Login"

                    if (response.isSuccessful) {
                        responseBody?.let { body ->
                            val jsonResponse = JSONObject(body)
                            if (jsonResponse.has("error")) {
                                // Handle error from backend
                                val error = jsonResponse.getString("error")
                                Toast.makeText(
                                    this@LoginActivity,
                                    "Login failed: $error",
                                    Toast.LENGTH_LONG
                                ).show()
                            } else {
                                // Successful login - parse response
                                handleLoginResponse(jsonResponse)
                            }
                        } ?: run {
                            Toast.makeText(
                                this@LoginActivity,
                                "Login failed: Empty response",
                                Toast.LENGTH_SHORT
                            ).show()
                        }
                    } else {
                        val errorMessage = parseLoginErrorMessage(responseBody)
                        Toast.makeText(
                            this@LoginActivity,
                            errorMessage,
                            Toast.LENGTH_LONG
                        ).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Log.e(TAG, "Full error: ${e.stackTraceToString()}") // Add this line
                    binding.btnLogin.isEnabled = true
                    binding.btnLogin.text = "Login"
                    Toast.makeText(
                        this@LoginActivity,
                        "Network error: ${e.message}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
        }
    }

    private fun handleLoginResponse(jsonResponse: JSONObject) {
        try {
            val token = jsonResponse.getString("token")
            val userId = jsonResponse.getLong("userId")
            val email = jsonResponse.getString("email")
            val username = jsonResponse.getString("username")

            // Save session
            sessionManager.saveAuthSession(token, userId, email, username)

            // Redirect to MainActivity
            startActivity(Intent(this, MainActivity::class.java))
            finish()
        } catch (e: Exception) {
            Toast.makeText(this, "Login failed: Invalid response", Toast.LENGTH_SHORT).show()
        }
    }

    private fun parseLoginErrorMessage(responseBody: String?): String {
        return try {
            when {
                responseBody == null -> "Login failed"
                responseBody.contains("Invalid credentials") -> "Invalid username or password"
                else -> JSONObject(responseBody).optString("error", "Login failed")
            }
        } catch (e: Exception) {
            "Login failed"
        }
    }

    private fun navigateToMainActivity() {
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            if (redirectAction.isNotEmpty()) {
                putExtra(LoginRequiredActivity.EXTRA_REDIRECT_ACTION, redirectAction)
            }
        }
        startActivity(intent)
        finish()
    }
}