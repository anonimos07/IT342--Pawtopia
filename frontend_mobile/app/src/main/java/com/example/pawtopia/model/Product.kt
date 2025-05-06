package com.example.pawtopia.model

import java.io.Serializable

data class Product(
    val productID: Int,
    val description: String,
    val productPrice: Double,
    val productName: String,
    val productType: String,
    val quantity: Int,
    val quantitySold: Int,
    val productImage: String
) : Serializable