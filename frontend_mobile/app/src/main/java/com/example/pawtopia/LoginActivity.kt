package com.example.pawtopia

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.pawtopia.databinding.ActivityLoginBinding
import com.example.pawtopia.repository.UserRepository
import com.example.pawtopia.util.SessionManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class LoginActivity : AppCompatActivity() {
    private lateinit var binding: ActivityLoginBinding
    private lateinit var sessionManager: SessionManager
    private val userRepository = UserRepository()
    private val TAG = "LoginActivity"
    private var redirectAction = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)

        // Get redirect action if any
        redirectAction = intent.getStringExtra(LoginRequiredActivity.EXTRA_REDIRECT_ACTION) ?: ""

        // Check if user is already logged in
        if (sessionManager.isLoggedIn()) {
            navigateToMainActivity()
        }

        // Login button click listener
        binding.btnLogin.setOnClickListener {
            val username = binding.etEmail.text.toString().trim()
            val password = binding.etPassword.text.toString().trim()

            if (validateInputs(username, password)) {
                performLogin(username, password)
            }
        }

        // Sign up text click listener
        binding.tvSignUp.setOnClickListener {
            val intent = Intent(this, SignupActivity::class.java)
            if (redirectAction.isNotEmpty()) {
                intent.putExtra(LoginRequiredActivity.EXTRA_REDIRECT_ACTION, redirectAction)
            }
            startActivity(intent)
        }

        // Google login button click listener
        binding.btnGoogle.setOnClickListener {
            Toast.makeText(this, "Google login not implemented yet", Toast.LENGTH_SHORT).show()
        }

        // Facebook login button click listener
        binding.btnFacebook.setOnClickListener {
            Toast.makeText(this, "Facebook login not implemented yet", Toast.LENGTH_SHORT).show()
        }

        // Forgot password click listener
        binding.tvForgotPassword.setOnClickListener {
            Toast.makeText(this, "Forgot password not implemented yet", Toast.LENGTH_SHORT).show()
        }
    }

    private fun validateInputs(username: String, password: String): Boolean {
        if (username.isEmpty()) {
            binding.etEmail.error = "Username cannot be empty"
            return false
        }

        if (password.isEmpty()) {
            binding.etPassword.error = "Password cannot be empty"
            return false
        }

        return true
    }

    private fun performLogin(username: String, password: String) {
        // Show loading indicator
        binding.btnLogin.isEnabled = false

        lifecycleScope.launch(Dispatchers.IO) {
            try {
                val result = userRepository.login(username, password)

                withContext(Dispatchers.Main) {
                    // Hide loading indicator
                    binding.btnLogin.isEnabled = true

                    result.fold(
                        onSuccess = { token ->
                            if (token != "failed") {
                                // Save token to shared preferences
                                sessionManager.saveAuthToken(token)

                                // Extract user ID from token if needed or make another API call
                                // For now, we'll just navigate to the main activity
                                navigateToMainActivity()
                            } else {
                                Toast.makeText(this@LoginActivity, "Invalid credentials", Toast.LENGTH_SHORT).show()
                            }
                        },
                        onFailure = { exception ->
                            Log.e(TAG, "Login error: ${exception.message}", exception)
                            Toast.makeText(this@LoginActivity, "Login failed: ${exception.message}", Toast.LENGTH_SHORT).show()
                        }
                    )
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    // Hide loading indicator
                    binding.btnLogin.isEnabled = true

                    Log.e(TAG, "Login error: ${e.message}", e)
                    Toast.makeText(this@LoginActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun navigateToMainActivity() {
        val intent = Intent(this, MainActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}
