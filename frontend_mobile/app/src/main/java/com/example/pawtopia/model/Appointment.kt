package com.example.pawtopia.model

import java.time.LocalTime
import java.util.Date

data class Appointment(
    val appId: Long,
    val date: Date,
    val email: String,
    val contactNo: String,
    val time: LocalTime,
    val canceled: Boolean,
    val confirmed: Boolean,
    val groomService: String,
    val price: Int
)