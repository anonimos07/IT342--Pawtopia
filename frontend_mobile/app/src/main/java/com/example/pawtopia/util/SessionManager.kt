package com.example.pawtopia.util

import android.content.Context
import android.content.SharedPreferences

class SessionManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("PawtopiaAuth", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_TOKEN = "auth_token"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_EMAIL = "email"
        private const val KEY_USERNAME = "username"
        private const val KEY_IS_LOGGED_IN = "is_logged_in"
        private const val KEY_AUTH_PROVIDER = "auth_provider" // New
        private const val KEY_GOOGLE_ID = "google_id" // New
    }

    // Enhanced save method
    fun saveAuthSession(
        token: String,
        userId: Long,
        email: String,
        username: String,
        authProvider: String? = null,
        googleId: String? = null
    ) {
        prefs.edit().apply {
            putString(KEY_TOKEN, token)
            putLong(KEY_USER_ID, userId)
            putString(KEY_EMAIL, email)
            putString(KEY_USERNAME, username)
            putBoolean(KEY_IS_LOGGED_IN, true)
            authProvider?.let { putString(KEY_AUTH_PROVIDER, it) }
            googleId?.let { putString(KEY_GOOGLE_ID, it) }
            apply()
        }
    }

    // Add these new getters
    fun getAuthProvider(): String? = prefs.getString(KEY_AUTH_PROVIDER, null)
    fun getGoogleId(): String? = prefs.getString(KEY_GOOGLE_ID, null)

    // Check if user is logged in
    fun isLoggedIn(): Boolean {
        return prefs.getBoolean(KEY_IS_LOGGED_IN, false) && getToken() != null
    }

    // Get stored token (for API requests)
    fun getToken(): String? {
        return prefs.getString(KEY_TOKEN, null)
    }

    // Clear session on logout

    fun logout() {
        prefs.edit().clear().apply()
    }

    fun getUserEmail(): String? {
        return prefs.getString(KEY_EMAIL, null)
    }

    // Add these helper methods if not already present
    fun getUsername(): String? = prefs.getString(KEY_USERNAME, null)
    fun getEmail(): String? = prefs.getString(KEY_EMAIL, null)
    fun getUserId(): Long = prefs.getLong(KEY_USER_ID, 0L)
}