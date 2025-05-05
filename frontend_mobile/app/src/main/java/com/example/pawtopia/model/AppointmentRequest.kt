package com.example.pawtopia.model

data class AppointmentRequest(
    val email: String,
    val contactNo: String,
    val date: Long?,
    val time: String,
    val groomService: String,
    val price: Int,
    val confirmed: Boolean = false,
    val canceled: Boolean = false,
    val user: UserReference  // Change to match backend expectation
)