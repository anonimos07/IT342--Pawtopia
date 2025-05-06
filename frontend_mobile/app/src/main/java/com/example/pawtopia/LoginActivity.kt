package com.example.pawtopia

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.pawtopia.databinding.ActivityLoginBinding
import com.example.pawtopia.util.GoogleSignInHelper
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

    private lateinit var googleSignInHelper: GoogleSignInHelper
    private val googleSignInLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            handleGoogleSignInResult(result.data)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)
        googleSignInHelper = GoogleSignInHelper(this)

        sessionManager = SessionManager(this)
        redirectAction = intent.getStringExtra(LoginRequiredActivity.EXTRA_REDIRECT_ACTION) ?: ""

        binding.ivBackButton.setOnClickListener {
            startActivity(Intent(this, MainActivity::class.java))
            finish()
        }


        if (sessionManager.isLoggedIn()) {
            navigateToMainActivity()
            return
        }

        setupListeners()
    }

    private fun handleGoogleSignInResult(data: Intent?) {
        lifecycleScope.launch {
            try {
                val account = googleSignInHelper.handleSignInResult(data)
                if (account != null) {
                    authenticateWithBackend(account.idToken)
                } else {
                    Toast.makeText(this@LoginActivity, "Google sign in failed", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@LoginActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    // Update the authenticateWithBackend function in LoginActivity.kt
    private fun authenticateWithBackend(idToken: String?) {
        if (idToken == null) {
            Toast.makeText(this, "Authentication error: No token received", Toast.LENGTH_SHORT).show()
            return
        }

        binding.btnGoogle.isEnabled = false

        val jsonObject = JSONObject().apply {
            put("token", idToken)
            // Add platform identifier
            put("platform", "android")
        }

        val requestBody = jsonObject.toString().toRequestBody(JSON_MEDIA_TYPE)
        val request = Request.Builder()
            .url("https://it342-pawtopia-10.onrender.com/auth/google") // Make sure this matches your backend
            .post(requestBody)
            .addHeader("Content-Type", "application/json")
            .build()

        lifecycleScope.launch(Dispatchers.IO) {
            try {
                Log.d("GoogleAuth", "Sending token to backend: ${idToken.take(10)}...")
                val response = client.newCall(request).execute()
                val responseBody = response.body?.string()
                Log.d("GoogleAuth", "Response code: ${response.code}, body: $responseBody")

                withContext(Dispatchers.Main) {
                    binding.btnGoogle.isEnabled = true

                    if (response.isSuccessful) {
                        responseBody?.let { body ->
                            try {
                                val jsonResponse = JSONObject(body)
                                if (jsonResponse.has("token")) {
                                    Log.d("GoogleAuth", "Authentication successful")

                                    // Enhanced error handling for missing fields
                                    try {
                                        sessionManager.saveAuthSession(
                                            token = jsonResponse.getString("token"),
                                            userId = jsonResponse.getLong("userId"),
                                            email = jsonResponse.getString("email"),
                                            username = jsonResponse.getString("username"),
                                            authProvider = "google",
                                            googleId = jsonResponse.optString("googleId", "")
                                        )

                                        navigateToMainActivity()
                                    } catch (e: Exception) {
                                        Log.e("GoogleAuth", "Missing required field in response", e)
                                        Toast.makeText(
                                            this@LoginActivity,
                                            "Authentication failed: Invalid response format",
                                            Toast.LENGTH_LONG
                                        ).show()
                                    }
                                } else {
                                    val errorMsg = jsonResponse.optString("message", "Authentication failed")
                                    Log.e("GoogleAuth", errorMsg)
                                    Toast.makeText(
                                        this@LoginActivity,
                                        errorMsg,
                                        Toast.LENGTH_LONG
                                    ).show()
                                }
                            } catch (e: Exception) {
                                Log.e("GoogleAuth", "Error parsing response", e)
                                Toast.makeText(
                                    this@LoginActivity,
                                    "Error: ${e.message ?: "Invalid response from server"}",
                                    Toast.LENGTH_LONG
                                ).show()
                            }
                        }
                    } else {
                        val errorMessage = try {
                            JSONObject(responseBody).getString("message")
                        } catch (e: Exception) {
                            "Authentication failed: ${response.code}"
                        }
                        Log.e("GoogleAuth", errorMessage)
                        Toast.makeText(this@LoginActivity, errorMessage, Toast.LENGTH_LONG).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Log.e("GoogleAuth", "Network error", e)
                    binding.btnGoogle.isEnabled = true
                    Toast.makeText(
                        this@LoginActivity,
                        "Network error: ${e.message ?: "Please check your connection"}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
        }
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
            val signInIntent = googleSignInHelper.getSignInIntent()
            googleSignInLauncher.launch(signInIntent)
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