package com.example.pawtopia

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.pawtopia.databinding.ActivityCheckoutBinding
import com.example.pawtopia.databinding.ItemOrderSummaryBinding  // Changed from ItemCartBinding
import com.example.pawtopia.fragments.EditProfileFragment
import com.example.pawtopia.model.CartItem
import com.example.pawtopia.model.Order
import com.example.pawtopia.model.OrderItem
import com.example.pawtopia.model.User
import com.example.pawtopia.repository.CartRepository
import com.example.pawtopia.repository.OrderRepository
import com.example.pawtopia.repository.UserRepository
import com.example.pawtopia.util.Result
import com.example.pawtopia.util.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.DecimalFormat

class CheckoutActivity : AppCompatActivity() {

    private lateinit var binding: ActivityCheckoutBinding
    private val sessionManager by lazy { SessionManager(this) }
    private val cartRepository by lazy { CartRepository(sessionManager) }
    private val userRepository by lazy { UserRepository(sessionManager) }
    private val orderRepository by lazy { OrderRepository(sessionManager) }

    private var cartItems: List<CartItem> = emptyList()
    private val SHIPPING_FEE = 30.0
    private var hasAddress = false
    private var selectedPaymentMethod = "Cash on Delivery"

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
        loadUserAddress() // Now safe to call
        updateOrderSummary()
    }

    private fun setupRecyclerView() {
        binding.rvOrderItems.apply {
            layoutManager = LinearLayoutManager(this@CheckoutActivity)
            adapter = OrderItemAdapter(cartItems) // Initialize with cartItems
            setHasFixedSize(true) // Improve performance if items have fixed size
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

            placeOrder()
        }

        // Handle payment method selection
        binding.radioGroupPayment.setOnCheckedChangeListener { group, checkedId ->
            selectedPaymentMethod = when (checkedId) {
                R.id.radio_cod -> "Cash on Delivery"
                R.id.radio_gcash -> "GCash"
                else -> "Cash on Delivery"
            }
        }
    }

    override fun onResume() {
        super.onResume()
        loadUserAddress()
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
        val orderItems = cartItems.map { cartItem ->
            OrderItem(
                orderItemID = 0,
                orderItemName = cartItem.product.productName,
                orderItemImage = cartItem.product.productImage,
                price = cartItem.product.productPrice,
                quantity = cartItem.quantity,
                productId = cartItem.product.productID.toString(),
                isRated = false, // Consider removing if not used in backend
                order = null
            )
        }

        val totalPrice = cartItems.sumOf { it.product.productPrice * it.quantity } + SHIPPING_FEE

        val order = Order(
            orderID = 0,
            orderDate = "",
            paymentMethod = selectedPaymentMethod,
            paymentStatus = "PENDING", // Match frontend
            orderStatus = "To Receive", // Match frontend
            totalPrice = totalPrice,
            orderItems = orderItems,
            user = User(
                userId = sessionManager.getUserId(),
                username = sessionManager.getUsername() ?: "", // Add username
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
                        // Enhanced cart clearance with better feedback
                        clearCartItemsAfterOrder(orderResult.data.orderID)
                    }
                    is Result.Error -> {
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
                        "Order placed successfully! Selected items have been removed from your cart."
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
