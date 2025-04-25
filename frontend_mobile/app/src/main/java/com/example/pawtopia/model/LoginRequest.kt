package com.example.pawtopia.model

data class LoginRequest(
    val usernameOrEmail: String,
    val password: String
)