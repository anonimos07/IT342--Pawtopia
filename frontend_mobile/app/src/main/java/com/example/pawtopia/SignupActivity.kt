package com.example.pawtopia

import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.pawtopia.databinding.ActivitySignupBinding
import com.example.pawtopia.repository.UserRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class SignupActivity : AppCompatActivity() {
    private lateinit var binding: ActivitySignupBinding
    private val userRepository = UserRepository()
    private val TAG = "SignupActivity"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySignupBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Sign up button click listener
        binding.btnSignUp.setOnClickListener {
            if (validateInputs()) {
                performSignup()
            }
        }

        // Login text click listener
        binding.tvLogin.setOnClickListener {
            finish() // Go back to login activity
        }

        // Google sign up button click listener
        binding.btnGoogle.setOnClickListener {
            Toast.makeText(this, "Google signup not implemented yet", Toast.LENGTH_SHORT).show()
        }

        // Facebook sign up button click listener
        binding.btnFacebook.setOnClickListener {
            Toast.makeText(this, "Facebook signup not implemented yet", Toast.LENGTH_SHORT).show()
        }

        // Terms of Service click listener
        binding.tvTerms.setOnClickListener {
            Toast.makeText(this, "Terms of Service not implemented yet", Toast.LENGTH_SHORT).show()
        }

        // Privacy Policy click listener
        binding.tvPrivacy.setOnClickListener {
            Toast.makeText(this, "Privacy Policy not implemented yet", Toast.LENGTH_SHORT).show()
        }
    }

    private fun validateInputs(): Boolean {
        val firstName = binding.etFirstName.text.toString().trim()
        val lastName = binding.etLastName.text.toString().trim()
        val email = binding.etEmail.text.toString().trim()
        val password = binding.etPassword.text.toString().trim()
        val confirmPassword = binding.etConfirmPassword.text.toString().trim()

        if (firstName.isEmpty()) {
            binding.etFirstName.error = "First name cannot be empty"
            return false
        }

        if (lastName.isEmpty()) {
            binding.etLastName.error = "Last name cannot be empty"
            return false
        }

        if (email.isEmpty()) {
            binding.etEmail.error = "Email cannot be empty"
            return false
        }

        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            binding.etEmail.error = "Invalid email format"
            return false
        }

        if (password.isEmpty()) {
            binding.etPassword.error = "Password cannot be empty"
            return false
        }

        if (password.length < 6) {
            binding.etPassword.error = "Password must be at least 6 characters"
            return false
        }

        if (confirmPassword.isEmpty()) {
            binding.etConfirmPassword.error = "Confirm password cannot be empty"
            return false
        }

        if (password != confirmPassword) {
            binding.etConfirmPassword.error = "Passwords do not match"
            return false
        }

        if (!binding.cbAgreeTerms.isChecked) {
            Toast.makeText(this, "Please agree to the Terms of Service and Privacy Policy", Toast.LENGTH_SHORT).show()
            return false
        }

        return true
    }

    private fun performSignup() {
        val firstName = binding.etFirstName.text.toString().trim()
        val lastName = binding.etLastName.text.toString().trim()
        val email = binding.etEmail.text.toString().trim()
        val password = binding.etPassword.text.toString().trim()
        // Using email as username for simplicity, but you can add a separate username field if needed
        val username = email

        // Show loading indicator
        binding.btnSignUp.isEnabled = false

        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val result = userRepository.signup(
                    username = username,
                    password = password,
                    firstName = firstName,
                    lastName = lastName,
                    email = email
                )

                withContext(Dispatchers.Main) {
                    // Hide loading indicator
                    binding.btnSignUp.isEnabled = true

                    result.fold(
                        onSuccess = { message ->
                            if (message == "User registered successfully!") {
                                Toast.makeText(this@SignupActivity, "Registration successful! Please login.", Toast.LENGTH_LONG).show()
                                finish() // Go back to login activity
                            } else {
                                Toast.makeText(this@SignupActivity, message, Toast.LENGTH_SHORT).show()
                            }
                        },
                        onFailure = { exception ->
                            Log.e(TAG, "Signup error: ${exception.message}", exception)
                            Toast.makeText(this@SignupActivity, "Registration failed: ${exception.message}", Toast.LENGTH_SHORT).show()
                        }
                    )
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    // Hide loading indicator
                    binding.btnSignUp.isEnabled = true

                    Log.e(TAG, "Signup error: ${e.message}", e)
                    Toast.makeText(this@SignupActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
}
