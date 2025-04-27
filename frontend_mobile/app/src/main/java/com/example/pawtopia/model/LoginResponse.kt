package com.example.pawtopia.model

data class LoginResponse(
    val token: String,
    val userId: Long,
    val username: String,
    val email: String,
    val firstName: String?,
    val lastName: String?,
    val role: String
)