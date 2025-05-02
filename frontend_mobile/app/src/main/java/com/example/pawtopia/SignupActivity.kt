package com.example.pawtopia

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

class SignupActivity : AppCompatActivity() {
    private lateinit var binding: ActivitySignupBinding
    private val TAG = "SignupActivity"
    private val client = OkHttpClient()
    private val JSON_MEDIA_TYPE = "application/json; charset=utf-8".toMediaTypeOrNull()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySignupBinding.inflate(layoutInflater)
        setContentView(binding.root)

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

        binding.btnGoogle.setOnClickListener {
            Toast.makeText(this, "Google signup not implemented yet", Toast.LENGTH_SHORT).show()
        }

        binding.tvTerms.setOnClickListener {
            Toast.makeText(this, "Terms of Service not implemented yet", Toast.LENGTH_SHORT).show()
        }

        binding.tvPrivacy.setOnClickListener {
            Toast.makeText(this, "Privacy Policy not implemented yet", Toast.LENGTH_SHORT).show()
        }
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