package com.example.pawtopia.model

data class AddressRequest(
    val region: String,
    val province: String,
    val city: String,
    val barangay: String,
    val postalCode: String,
    val streetBuildingHouseNo: String?
)