package com.example.pawtopia.model

data class SignupRequest(
    val username: String,
    val password: String,
    val firstName: String,
    val lastName: String,
    val email: String,
    val role: String = "CUSTOMER"
)
