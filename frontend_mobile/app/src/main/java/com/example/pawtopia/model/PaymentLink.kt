package com.example.pawtopia.model

data class PaymentLink(
    val checkoutUrl: String,
    val referenceNumber: String = "",
    val isSuccess: Boolean = false
) : java.io.Serializable