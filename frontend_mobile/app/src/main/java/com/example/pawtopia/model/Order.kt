package com.example.pawtopia.model

import java.io.Serializable

data class Order(
    val orderID: Int,
    val orderDate: String,
    val paymentMethod: String,
    val paymentStatus: String,
    val orderStatus: String,
    val totalPrice: Double,
    val orderItems: List<OrderItem>?,
    val user: User?
) : Serializable