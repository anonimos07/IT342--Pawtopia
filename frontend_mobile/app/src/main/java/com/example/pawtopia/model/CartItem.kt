package com.example.pawtopia.model

import java.io.Serializable import java.time.LocalDateTime

data class CartItem(
    val cartItemId: Int,
    val quantity: Int,
    val lastUpdated: LocalDateTime?,
    val cart: Cart?,
    val product: Product )
    : Serializable