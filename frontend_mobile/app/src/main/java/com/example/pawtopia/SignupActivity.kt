package com.example.pawtopia

import android.app.Activity
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.pawtopia.databinding.ActivitySignupBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import android.content.Intent
import androidx.activity.result.contract.ActivityResultContracts
import com.example.pawtopia.LoginActivity
import com.example.pawtopia.util.GoogleSignInHelper
import com.example.pawtopia.util.SessionManager

class SignupActivity : AppCompatActivity() {
    private lateinit var binding: ActivitySignupBinding
    private val TAG = "SignupActivity"
    private val client = OkHttpClient()
    private val JSON_MEDIA_TYPE = "application/json; charset=utf-8".toMediaTypeOrNull()

    // Add these for Google Sign-In
    private lateinit var googleSignInHelper: GoogleSignInHelper
    private lateinit var sessionManager: SessionManager
    private val googleSignInLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            handleGoogleSignInResult(result.data)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySignupBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Initialize Google Sign-In and SessionManager
        googleSignInHelper = GoogleSignInHelper(this)
        sessionManager = SessionManager(this)

        binding.ivBackButton.setOnClickListener {
            startActivity(Intent(this, MainActivity::class.java))
            finish()
        }

        setupClickListeners()
    }

    private fun setupClickListeners() {
        binding.btnSignUp.setOnClickListener {
            if (validateInputs()) {
                performSignup()
            }
        }

        binding.tvLogin.setOnClickListener {
            finish() // Close this activity and return to login
        }

        // Updated Google Sign-Up button
        binding.btnGoogle.setOnClickListener {
            val signInIntent = googleSignInHelper.getSignInIntent()
            googleSignInLauncher.launch(signInIntent)
        }

        binding.tvTerms.setOnClickListener {
            Toast.makeText(this, "Terms of Service not implemented yet", Toast.LENGTH_SHORT).show()
        }

        binding.tvPrivacy.setOnClickListener {
            Toast.makeText(this, "Privacy Policy not implemented yet", Toast.LENGTH_SHORT).show()
        }
    }

    private fun handleGoogleSignInResult(data: Intent?) {
        lifecycleScope.launch {
            try {
                val account = googleSignInHelper.handleSignInResult(data)
                if (account != null) {
                    authenticateWithBackend(account.idToken)
                } else {
                    Toast.makeText(this@SignupActivity, "Google sign in failed", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@SignupActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    // Update the authenticateWithBackend function in SignupActivity.kt
    private fun authenticateWithBackend(idToken: String?) {
        Log.d("GoogleAuth", "Starting authentication with token: ${idToken?.take(10)}...")
        if (idToken == null) {
            Log.e("GoogleAuth", "ID token is null")
            Toast.makeText(this, "Authentication error: No token received", Toast.LENGTH_LONG).show()
            return
        }

        binding.btnGoogle.isEnabled = false

        val jsonObject = JSONObject().apply {
            put("token", idToken)
            put("platform", "android") // Add platform identifier
        }

        val requestBody = jsonObject.toString().toRequestBody(JSON_MEDIA_TYPE)
        val request = Request.Builder()
            .url("https://it342-pawtopia-10.onrender.com/auth/google")
            .post(requestBody)
            .addHeader("Content-Type", "application/json")
            .build()

        lifecycleScope.launch(Dispatchers.IO) {
            try {
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
                                    try {
                                        // Save all user data including auth provider info
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
                                            this@SignupActivity,
                                            "Authentication failed: Invalid response format",
                                            Toast.LENGTH_LONG
                                        ).show()
                                    }
                                } else {
                                    val errorMsg = jsonResponse.optString("message", "Authentication failed")
                                    Toast.makeText(
                                        this@SignupActivity,
                                        errorMsg,
                                        Toast.LENGTH_LONG
                                    ).show()
                                }
                            } catch (e: Exception) {
                                Toast.makeText(
                                    this@SignupActivity,
                                    "Error parsing response: ${e.message}",
                                    Toast.LENGTH_LONG
                                ).show()
                            }
                        }
                    } else {
                        // Handle error response with more detail
                        val errorMessage = try {
                            val errorJson = JSONObject(responseBody)
                            errorJson.getString("message")
                        } catch (e: Exception) {
                            "Authentication failed: ${response.code}"
                        }
                        Toast.makeText(
                            this@SignupActivity,
                            errorMessage,
                            Toast.LENGTH_LONG
                        ).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    binding.btnGoogle.isEnabled = true
                    Toast.makeText(
                        this@SignupActivity,
                        "Network error: ${e.message ?: "Please check your connection"}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
        }
    }

    private fun navigateToMainActivity() {
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        startActivity(intent)
        finish()
    }

    private fun validateInputs(): Boolean {
        val username = binding.etUsername.text.toString().trim()
        val firstName = binding.etFirstName.text.toString().trim()
        val lastName = binding.etLastName.text.toString().trim()
        val email = binding.etEmail.text.toString().trim()
        val password = binding.etPassword.text.toString().trim()
        val confirmPassword = binding.etConfirmPassword.text.toString().trim()
        val agreedToTerms = binding.cbAgreeTerms.isChecked

        if (username.isEmpty()) {
            binding.etUsername.error = "Username is required"
            return false
        }

        if (firstName.isEmpty()) {
            binding.etFirstName.error = "First name is required"
            return false
        }

        if (lastName.isEmpty()) {
            binding.etLastName.error = "Last name is required"
            return false
        }

        if (email.isEmpty()) {
            binding.etEmail.error = "Email is required"
            return false
        }

        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            binding.etEmail.error = "Please enter a valid email"
            return false
        }

        if (password.isEmpty()) {
            binding.etPassword.error = "Password is required"
            return false
        }

        if (password.length < 6) {
            binding.etPassword.error = "Password must be at least 6 characters"
            return false
        }

        if (confirmPassword.isEmpty()) {
            binding.etConfirmPassword.error = "Please confirm your password"
            return false
        }

        if (password != confirmPassword) {
            binding.etConfirmPassword.error = "Passwords don't match"
            return false
        }

        if (!agreedToTerms) {
            Toast.makeText(this, "You must agree to the terms and conditions", Toast.LENGTH_SHORT).show()
            return false
        }

        return true
    }

    private fun performSignup() {
        val username = binding.etUsername.text.toString().trim()
        val firstName = binding.etFirstName.text.toString().trim()
        val lastName = binding.etLastName.text.toString().trim()
        val email = binding.etEmail.text.toString().trim()
        val password = binding.etPassword.text.toString().trim()

        // Show loading state (animation)
        binding.btnSignUp.text = "" // Clear button text temporarily
        binding.btnSignUp.isEnabled = false
        binding.signupProgressBar.visibility = View.VISIBLE

        // Create JSON request body
        val jsonObject = JSONObject().apply {
            put("username", username)
            put("password", password)
            put("firstName", firstName)
            put("lastName", lastName)
            put("email", email)
            put("role", "CUSTOMER")
            put("googleId", JSONObject.NULL)
            put("authProvider", JSONObject.NULL)
        }

        val requestBody = jsonObject.toString().toRequestBody(JSON_MEDIA_TYPE)
        val request = Request.Builder()
            .url("https://it342-pawtopia-10.onrender.com/users/signup")
            .post(requestBody)
            .addHeader("Content-Type", "application/json")
            .build()

        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val response = client.newCall(request).execute()
                val responseBody = response.body?.string()

                withContext(Dispatchers.Main) {
                    // Hide loading state (animation)
                    binding.btnSignUp.text = "Sign Up" // Restore button text
                    binding.btnSignUp.isEnabled = true
                    binding.signupProgressBar.visibility = View.GONE

                    if (response.isSuccessful) {
                        Toast.makeText(
                            this@SignupActivity,
                            "Registration successful! Please login.",
                            Toast.LENGTH_LONG
                        ).show()
                        finish()
                    } else {
                        val errorMessage = parseErrorMessage(responseBody)
                        Toast.makeText(
                            this@SignupActivity,
                            errorMessage,
                            Toast.LENGTH_LONG
                        ).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    // Hide loading state on error
                    binding.btnSignUp.text = "Sign Up"
                    binding.btnSignUp.isEnabled = true
                    binding.signupProgressBar.visibility = View.GONE

                    Log.e(TAG, "Signup error: ${e.message}", e)
                    Toast.makeText(
                        this@SignupActivity,
                        "Network error: Please check your connection",
                        Toast.LENGTH_LONG
                    ).show()
                }
            }
        }
    }

    private fun parseErrorMessage(responseBody: String?): String {
        return try {
            when {
                responseBody == null -> "Registration failed"
                responseBody.contains("Username already registered") -> "Username is already taken"
                responseBody.contains("Email already registered") -> "Email is already registered"
                else -> JSONObject(responseBody).optString("message", "Registration failed")
            }
        } catch (e: Exception) {
            "Registration failed"
        }
    }
}