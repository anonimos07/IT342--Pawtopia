package com.example.pawtopia.model

data class AppointmentResponse(
    val success: Boolean,
    val message: String,
    val appointmentId: Long?
)