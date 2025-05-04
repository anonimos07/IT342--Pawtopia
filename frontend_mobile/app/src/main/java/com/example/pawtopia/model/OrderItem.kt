package com.example.pawtopia.model

import java.io.Serializable

data class OrderItem(
    val orderItemID: Int,
    val orderItemName: String,
    val orderItemImage: String,
    val price: Double,
    val quantity: Int,
    val productId: String,  
    val isRated: Boolean,
    val order: Order? )
    : Serializable