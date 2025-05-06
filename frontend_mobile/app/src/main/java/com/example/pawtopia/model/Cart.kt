package com.example.pawtopia.model

import java.io.Serializable
import java.time.LocalDateTime

data class Cart(
    val cartId: Long,
    val cartItems: List<CartItem>?,
    val lastUpdated: LocalDateTime?
) : Serializable