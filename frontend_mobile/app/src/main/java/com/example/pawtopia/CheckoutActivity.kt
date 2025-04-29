package com.example.pawtopia

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.pawtopia.databinding.ActivityCheckoutBinding
import com.example.pawtopia.databinding.ItemCartBinding
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
    private lateinit var sessionManager: SessionManager
    private lateinit var cartRepository: CartRepository
    private lateinit var userRepository: UserRepository
    private lateinit var orderRepository: OrderRepository
    private var cartItems: List<CartItem> = emptyList()
    private val SHIPPING_FEE = 30.0
    private var hasAddress = false

    companion object {
        fun start(context: android.content.Context) {
            val intent = Intent(context, CheckoutActivity::class.java)
            context.startActivity(intent)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCheckoutBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)
        cartRepository = CartRepository(sessionManager)
        userRepository = UserRepository(sessionManager)
        orderRepository = OrderRepository(sessionManager)

        setupRecyclerView()
        setupClickListeners()
        loadCartItems()
        loadUserAddress()
    }

    private fun setupRecyclerView() {
        binding.rvOrderItems.apply {
            layoutManager = LinearLayoutManager(this@CheckoutActivity)
            adapter = OrderItemAdapter(emptyList())
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
    }

    override fun onResume() {
        super.onResume()
        loadUserAddress()
    }

    private fun loadCartItems() {
        CoroutineScope(Dispatchers.IO).launch {
            val userId = sessionManager.getUserId()
            val result = cartRepository.getCartByUserId(userId)
            withContext(Dispatchers.Main) {
                when (result) {
                    is Result.Success -> {
                        cartItems = result.data.cartItems ?: emptyList()
                        (binding.rvOrderItems.adapter as OrderItemAdapter).updateOrderItems(cartItems)
                        updateOrderSummary()
                    }
                    is Result.Error -> {
                        Toast.makeText(
                            this@CheckoutActivity,
                            "Error loading cart: ${result.exception.message}",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            }
        }
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
                isRated = false,
                order = null
            )
        }

        val totalPrice = cartItems.sumOf { it.product.productPrice * it.quantity } + SHIPPING_FEE

        val order = Order(
            orderID = 0,
            orderDate = "",
            paymentMethod = "Cash on Delivery",
            paymentStatus = "Pending",
            orderStatus = "Pending",
            totalPrice = totalPrice,
            orderItems = orderItems,
            user = User(userId = sessionManager.getUserId(), username = "", password = "", firstName = "", lastName = "", email = "", role = "", googleId = null, authProvider = null, address = null, cart = null)
        )

        CoroutineScope(Dispatchers.IO).launch {
            // 1. First, place the order
            val orderResult = orderRepository.placeOrder(order)

            withContext(Dispatchers.Main) {
                when (orderResult) {
                    is Result.Success -> {
                        // 2. If order succeeds, set all cart item quantities to 0
                        CoroutineScope(Dispatchers.IO).launch {
                            var allUpdatesSuccessful = true
                            val errorMessages = mutableListOf<String>()

                            cartItems.forEach { cartItem ->
                                val updateResult = cartRepository.updateCartItemQuantity(
                                    cartItem.cartItemId,
                                    0 // Set quantity to 0
                                )
                                if (updateResult is Result.Error) {
                                    allUpdatesSuccessful = false
                                    errorMessages.add("Failed to update item ${cartItem.product.productName}")
                                }
                            }

                            withContext(Dispatchers.Main) {
                                if (allUpdatesSuccessful) {
                                    Toast.makeText(
                                        this@CheckoutActivity,
                                        "Order placed successfully! Cart cleared.",
                                        Toast.LENGTH_SHORT
                                    ).show()
                                    finish()
                                } else {
                                    Toast.makeText(
                                        this@CheckoutActivity,
                                        "Order placed, but some items couldn't be cleared: ${errorMessages.joinToString()}",
                                        Toast.LENGTH_LONG
                                    ).show()
                                }
                            }
                        }
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

    private inner class OrderItemAdapter(
        private var orderItems: List<CartItem>
    ) : RecyclerView.Adapter<OrderItemAdapter.OrderItemViewHolder>() {

        inner class OrderItemViewHolder(val binding: ItemCartBinding) : RecyclerView.ViewHolder(binding.root)

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): OrderItemViewHolder {
            val binding = ItemCartBinding.inflate(LayoutInflater.from(parent.context), parent, false)
            return OrderItemViewHolder(binding)
        }

        override fun onBindViewHolder(holder: OrderItemViewHolder, position: Int) {
            val orderItem = orderItems[position]
            holder.binding.apply {
                tvProductName.text = orderItem.product.productName
                tvQuantity.text = "Qty: ${orderItem.quantity}"
                tvPrice.text = DecimalFormat("₱#,##0.00").format(orderItem.product.productPrice * orderItem.quantity)

                Glide.with(root.context)
                    .load(orderItem.product.productImage)
                    .placeholder(R.drawable.placeholder_product)
                    .into(ivProductImage)

                btnRemove.visibility = View.GONE
            }
        }

        override fun getItemCount() = orderItems.size

        fun updateOrderItems(newOrderItems: List<CartItem>) {
            orderItems = newOrderItems
            notifyDataSetChanged()
        }
    }
}
