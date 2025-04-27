package com.example.pawtopia.model

data class AddressResponse(
    val addressId: Long,
    val region: String,
    val province: String,
    val city: String,
    val barangay: String,
    val postalCode: String,
    val streetBuildingHouseNo: String?
)