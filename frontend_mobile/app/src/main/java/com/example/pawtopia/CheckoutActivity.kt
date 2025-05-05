package com.example.pawtopia

import android.annotation.SuppressLint
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.RadioButton
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.browser.customtabs.CustomTabsIntent
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.pawtopia.databinding.ActivityCheckoutBinding
import com.example.pawtopia.databinding.ItemOrderSummaryBinding
import com.example.pawtopia.fragments.EditProfileFragment
import com.example.pawtopia.model.CartItem
import com.example.pawtopia.model.Order
import com.example.pawtopia.model.OrderItem
import com.example.pawtopia.model.User
import com.example.pawtopia.repository.CartRepository
import com.example.pawtopia.repository.OrderRepository
import com.example.pawtopia.repository.PaymentRepository
import com.example.pawtopia.repository.UserRepository
import com.example.pawtopia.util.Result
import com.example.pawtopia.util.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.DecimalFormat
import android.os.Handler
import android.os.Looper

class CheckoutActivity : AppCompatActivity() {

    private lateinit var binding: ActivityCheckoutBinding
    private val sessionManager by lazy { SessionManager(this) }
    private val cartRepository by lazy { CartRepository(sessionManager) }
    private val userRepository by lazy { UserRepository(sessionManager) }
    private val orderRepository by lazy { OrderRepository(sessionManager) }
    private val paymentRepository by lazy { PaymentRepository(sessionManager) }

    private var cartItems: List<CartItem> = emptyList()
    private val SHIPPING_FEE = 30.0
    private var hasAddress = false
    private var selectedPaymentMethod = "Cash on Delivery"
    private var isProcessingPayment = false

    companion object {
        fun start(context: Context, selectedItems: List<CartItem>) {
            val intent = Intent(context, CheckoutActivity::class.java)
            intent.putExtra("selected_items", ArrayList(selectedItems))
            context.startActivity(intent)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCheckoutBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Initialize cart items from intent
        @Suppress("UNCHECKED_CAST")
        cartItems = (intent.getSerializableExtra("selected_items") as? ArrayList<CartItem>) ?: emptyList()

        setupRecyclerView()
        setupClickListeners()
        setupPaymentOptions()
        loadUserAddress()
        updateOrderSummary()
    }

    private fun setupRecyclerView() {
        binding.rvOrderItems.apply {
            layoutManager = LinearLayoutManager(this@CheckoutActivity)
            adapter = OrderItemAdapter(cartItems)
            setHasFixedSize(true)
        }
    }

    private fun setupClickListeners() {
        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.btnEditAddress.setOnClickListener {
            val fragment = EditProfileFragment()
            supportFragmentManager.beginTransaction()
                .replace(android.R.id.content, fragment)
                .addToBackStack(null)
                .commit()
        }

        binding.btnPlaceOrder.setOnClickListener {
            if (!hasAddress) {
                Toast.makeText(this, "Please add your address before placing an order", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (isProcessingPayment) {
                Toast.makeText(this, "Payment is being processed, please wait", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            placeOrder()
        }
    }

    private fun setupPaymentOptions() {
        // Handle payment method selection
        binding.radioGroupPayment.setOnCheckedChangeListener { _, checkedId ->
            selectedPaymentMethod = when (checkedId) {
                R.id.radio_cod -> "Cash on Delivery"
                R.id.radio_gcash -> "GCash"
                else -> "Cash on Delivery"
            }

            // Update visibility of payment info text if needed
            binding.tvPaymentInfo.visibility = if (selectedPaymentMethod == "GCash") {
                View.VISIBLE
            } else {
                View.GONE
            }
        }

        // Make sure Cash on Delivery is selected by default
        binding.radioCod.isChecked = true
        binding.tvPaymentInfo.visibility = View.GONE
    }

    override fun onResume() {
        super.onResume()
        loadUserAddress()
        isProcessingPayment = false
    }

    private fun loadUserAddress() {
        CoroutineScope(Dispatchers.IO).launch {
            val userId = sessionManager.getUserId()
            val result = userRepository.getUserAddress(userId)
            withContext(Dispatchers.Main) {
                when (result) {
                    is Result.Success -> {
                        val address = result.data
                        binding.tvAddress.text = buildString {
                            append(address.streetBuildingHouseNo?.let { "$it, " } ?: "")
                            append("${address.barangay}, ${address.city}, ")
                            append("${address.province}, ${address.region} ")
                            append(address.postalCode)
                        }
                        hasAddress = true
                    }
                    is Result.Error -> {
                        binding.tvAddress.text = "Please add your address"
                        hasAddress = false
                    }
                }
            }
        }
    }

    private fun updateOrderSummary() {
        val decimalFormat = DecimalFormat("₱#,##0.00")
        val subtotal = cartItems.sumOf { it.product.productPrice * it.quantity }
        val total = subtotal + SHIPPING_FEE

        binding.tvSubtotal.text = decimalFormat.format(subtotal)
        binding.tvShipping.text = decimalFormat.format(SHIPPING_FEE)
        binding.tvTotal.text = decimalFormat.format(total)
    }

    private fun placeOrder() {
        binding.btnPlaceOrder.isEnabled = false
        binding.loadingProgressBar.visibility = View.VISIBLE

        val orderItems = cartItems.map { cartItem ->
            OrderItem(
                orderItemID = 0,
                orderItemName = cartItem.product.productName,
                orderItemImage = cartItem.product.productImage,
                price = cartItem.product.productPrice,
                quantity = cartItem.quantity,
                productId = cartItem.product.productID.toString(),
                isRated = false,
                order = null
            )
        }

        val totalPrice = cartItems.sumOf { it.product.productPrice * it.quantity } + SHIPPING_FEE

        val order = Order(
            orderID = 0,
            orderDate = "",
            paymentMethod = selectedPaymentMethod,
            paymentStatus = "PENDING",
            orderStatus = "To Receive",
            totalPrice = totalPrice,
            orderItems = orderItems,
            user = User(
                userId = sessionManager.getUserId(),
                username = sessionManager.getUsername() ?: "",
                password = "",
                firstName = "",
                lastName = "",
                email = sessionManager.getEmail() ?: "",
                role = "",
                googleId = null,
                authProvider = null,
                address = null,
                cart = null
            )
        )

        CoroutineScope(Dispatchers.IO).launch {
            val orderResult = orderRepository.placeOrder(order)

            withContext(Dispatchers.Main) {
                when (orderResult) {
                    is Result.Success -> {
                        val createdOrder = orderResult.data

                        if (selectedPaymentMethod == "GCash") {
                            processGCashPayment(createdOrder)
                        } else {
                            // Regular COD flow
                            clearCartItemsAfterOrder(createdOrder.orderID)
                        }
                    }
                    is Result.Error -> {
                        binding.btnPlaceOrder.isEnabled = true
                        binding.loadingProgressBar.visibility = View.GONE

                        Toast.makeText(
                            this@CheckoutActivity,
                            "Error placing order: ${orderResult.exception.message}",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            }
        }
    }

    private fun processGCashPayment(order: Order) {
        isProcessingPayment = true

        CoroutineScope(Dispatchers.IO).launch {
            val paymentResult = paymentRepository.createPaymentLink(order)

            withContext(Dispatchers.Main) {
                binding.btnPlaceOrder.isEnabled = true
                binding.loadingProgressBar.visibility = View.GONE

                when (paymentResult) {
                    is Result.Success -> {
                        val paymentLink = paymentResult.data

                        // Save payment info to preferences for later verification
                        savePaymentInfo(order.orderID, paymentLink.referenceNumber)

                        // Clear cart items first
                        clearCartItemsForGCashPayment(order.orderID, paymentLink.checkoutUrl)
                    }
                    is Result.Error -> {
                        isProcessingPayment = false
                        Toast.makeText(
                            this@CheckoutActivity,
                            "Error creating payment: ${paymentResult.exception.message}",
                            Toast.LENGTH_LONG
                        ).show()

                        // Still navigate to confirmation but show error
                        OrderConfirmationActivity.start(
                            this@CheckoutActivity,
                            order.orderID,
                            "Order placed successfully, but payment link creation failed. Please contact support."
                        )
                        finish()
                    }
                }
            }
        }
    }

    private fun savePaymentInfo(orderId: Int, referenceNumber: String) {
        val sharedPrefs = getSharedPreferences("pawtopia_payments", Context.MODE_PRIVATE)
        with(sharedPrefs.edit()) {
            putInt("pending_order_id", orderId)
            putString("reference_number", referenceNumber)
            putLong("timestamp", System.currentTimeMillis())
            apply()
        }
    }

    @SuppressLint("UnspecifiedRegisterReceiverFlag")
    private fun clearCartItemsForGCashPayment(orderId: Int, checkoutUrl: String) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                // Remove items from cart
                cartItems.forEach { cartItem ->
                    val result = cartRepository.deleteCartItem(cartItem.cartItemId)
                    if (result is Result.Error) {
                        Log.e("CheckoutActivity", "Failed to delete cart item ${cartItem.cartItemId}")
                    }
                }

                withContext(Dispatchers.Main) {
                    // Create an intent to open the GCash payment URL in a custom tab or browser
                    val customTabsIntent = CustomTabsIntent.Builder()
                        .setToolbarColor(ContextCompat.getColor(this@CheckoutActivity, R.color.purple))
                        .setShowTitle(true)
                        .build()

                    try {
                        // Try to open in Chrome Custom Tab first
                        customTabsIntent.launchUrl(this@CheckoutActivity, Uri.parse(checkoutUrl))
                    } catch (e: Exception) {
                        // Fallback to regular browser if custom tabs not available
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(checkoutUrl))
                        startActivity(intent)
                    }

                    // Set up a broadcast receiver to detect when the user returns to the app
                    val filter = IntentFilter().apply {
                        addAction(Intent.ACTION_MAIN)
                        addCategory(Intent.CATEGORY_LAUNCHER)
                    }

                    val paymentCompleteReceiver = object : BroadcastReceiver() {
                        override fun onReceive(context: Context?, intent: Intent?) {
                            // When user returns to app, navigate to confirmation
                            navigateToOrderConfirmation(orderId)
                            unregisterReceiver(this)
                        }
                    }

                    registerReceiver(paymentCompleteReceiver, filter)

                    // Also navigate after 30 seconds in case broadcast isn't received
                    Handler(Looper.getMainLooper()).postDelayed({
                        try {
                            unregisterReceiver(paymentCompleteReceiver)
                        } catch (e: IllegalArgumentException) {
                            // Receiver was already unregistered
                        }
                        navigateToOrderConfirmation(orderId)
                    }, 30000)
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    isProcessingPayment = false
                    navigateToOrderConfirmation(orderId, "Order placed successfully!")
                }
            }
        }
    }

    private fun navigateToOrderConfirmation(orderId: Int, message: String? = null) {
        OrderConfirmationActivity.start(
            this@CheckoutActivity,
            orderId,
            message ?: "Order placed successfully! Please complete your GCash payment."
        )
        finish()
    }

    private fun clearCartItemsAfterOrder(orderId: Int) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                // Only remove the cart items that were part of this order
                cartItems.forEach { cartItem ->
                    val result = cartRepository.deleteCartItem(cartItem.cartItemId)
                    if (result is Result.Error) {
                        Log.e("CheckoutActivity", "Failed to delete cart item ${cartItem.cartItemId}")
                    }
                }

                withContext(Dispatchers.Main) {
                    // Navigate to order confirmation
                    OrderConfirmationActivity.start(
                        this@CheckoutActivity,
                        orderId,
                        "Order placed successfully!"
                    )
                    finish()
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    OrderConfirmationActivity.start(
                        this@CheckoutActivity,
                        orderId,
                        "Order placed, but encountered error clearing cart items: ${e.message}"
                    )
                    finish()
                }
            }
        }
    }

    private inner class OrderItemAdapter(
        private var orderItems: List<CartItem>
    ) : RecyclerView.Adapter<OrderItemAdapter.OrderItemViewHolder>() {

        inner class OrderItemViewHolder(val binding: ItemOrderSummaryBinding) :
            RecyclerView.ViewHolder(binding.root)

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): OrderItemViewHolder {
            val binding = ItemOrderSummaryBinding.inflate(
                LayoutInflater.from(parent.context),
                parent,
                false
            )
            return OrderItemViewHolder(binding)
        }

        override fun onBindViewHolder(holder: OrderItemViewHolder, position: Int) {
            val orderItem = orderItems[position]
            holder.binding.apply {
                tvProductName.text = orderItem.product.productName
                tvQuantity.text = "Qty: ${orderItem.quantity}"
                tvPrice.text = DecimalFormat("₱#,##0.00").format(orderItem.product.productPrice * orderItem.quantity)

                // Load image with Glide
                Glide.with(root.context)
                    .load(orderItem.product.productImage)
                    .placeholder(R.drawable.placeholder_product)
                    .error(R.drawable.placeholder_product)
                    .into(ivProductImage)
            }
        }

        override fun getItemCount() = orderItems.size

        fun updateOrderItems(newOrderItems: List<CartItem>) {
            orderItems = newOrderItems
            notifyDataSetChanged()
        }
    }
}