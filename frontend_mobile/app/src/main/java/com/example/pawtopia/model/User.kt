package com.example.pawtopia.model

import java.io.Serializable

data class User(
    val userId: Long,
    val username: String,
    val password: String,
    val firstName: String,
    val lastName: String,
    val email: String,
    val role: String,
    val googleId: String?,
    val authProvider: String?,
    val address: AddressResponse?,
    val cart: Cart? )
    : Serializable