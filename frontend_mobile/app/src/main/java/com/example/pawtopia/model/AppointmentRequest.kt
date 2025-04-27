package com.example.pawtopia.model

data class AppointmentRequest(
    val userId: Long,  // This must be present
    val email: String,
    val contactNo: String,
    val date: Long?,
    val time: String,
    val groomService: String,
    val price: Int
)