package com.example.pawtopia

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.pawtopia.databinding.ActivityOrderConfirmationBinding
import com.example.pawtopia.databinding.ItemOrderSummaryBinding
import com.example.pawtopia.model.Order
import com.example.pawtopia.model.OrderItem
import com.example.pawtopia.repository.OrderRepository
import com.example.pawtopia.util.Result
import com.example.pawtopia.util.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.DecimalFormat

class OrderConfirmationActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOrderConfirmationBinding
    private val sessionManager by lazy { SessionManager(this) }
    private val orderRepository by lazy { OrderRepository(sessionManager) }

    private var orderId: Int = 0
    private var message: String = ""

    companion object {
        private const val EXTRA_ORDER_ID = "extra_order_id"
        private const val EXTRA_MESSAGE = "extra_message"

        fun start(context: Context, orderId: Int, message: String) {
            val intent = Intent(context, OrderConfirmationActivity::class.java).apply {
                putExtra(EXTRA_ORDER_ID, orderId)
                putExtra(EXTRA_MESSAGE, message)
            }
            context.startActivity(intent)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOrderConfirmationBinding.inflate(layoutInflater)
        setContentView(binding.root)

        orderId = intent.getIntExtra(EXTRA_ORDER_ID, 0)
        message = intent.getStringExtra(EXTRA_MESSAGE) ?: ""

        // Show initial message
        binding.tvStatusMessage.text = message

        setupClickListeners()
        loadOrderDetails()
    }

    private fun setupClickListeners() {
        binding.btnBackToHome.setOnClickListener {
            // Navigate to MainActivity which should show HomeFragment
            val intent = Intent(this, MainActivity::class.java).apply {
                // Clear back stack and set Home as the default
                flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK
                // You can add extras if your MainActivity needs to know to show HomeFragment
                putExtra("NAVIGATE_TO", "HOME")
            }
            startActivity(intent)
            finish() // Finish current activity
        }

//        // Keep your existing view orders button if needed
//        binding.btnViewOrders.setOnClickListener {
//            OrdersActivity.start(this)
//            finish()
//        }
    }

    private fun loadOrderDetails() {
        CoroutineScope(Dispatchers.IO).launch {
            val result = orderRepository.getOrderById(orderId)
            withContext(Dispatchers.Main) {
                when (result) {
                    is Result.Success -> {
                        // Verify the order belongs to current user
                        if (result.data.user?.userId == sessionManager.getUserId()) {
                            displayOrderDetails(result.data)
                        } else {
                            showError("You don't have permission to view this order")
                        }
                    }
                    is Result.Error -> {
                        when {
                            result.exception.message?.contains("Unauthorized") == true -> {
                                // Token expired or invalid
                                sessionManager.logout()
                                showError("Session expired. Please login again") {
                                    // Redirect to login
                                    startActivity(Intent(this@OrderConfirmationActivity, LoginActivity::class.java))
                                    finish()
                                }
                            }
                            else -> {
                                showError(result.exception.message ?: "Error loading order details")
                            }
                        }
                    }
                }
            }
        }
    }

    private fun showError(message: String, action: (() -> Unit)? = null) {
        binding.tvStatusMessage.text = message
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
        action?.invoke()
    }

    private fun displayOrderDetails(order: Order) {
        val decimalFormat = DecimalFormat("₱#,##0.00")

        binding.apply {
            tvOrderId.text = "Order #${order.orderID}"
            tvOrderDate.text = order.orderDate
            tvOrderStatus.text = order.orderStatus
            tvPaymentStatus.text = order.paymentStatus
            tvPaymentMethod.text = order.paymentMethod
            tvTotalAmount.text = decimalFormat.format(order.totalPrice)

            // Setup order items recycler view
            rvOrderItems.layoutManager = LinearLayoutManager(this@OrderConfirmationActivity)
            rvOrderItems.adapter = OrderItemAdapter(order.orderItems ?: emptyList())
        }
    }

    private inner class OrderItemAdapter(
        private val orderItems: List<OrderItem>
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
                tvProductName.text = orderItem.orderItemName
                tvQuantity.text = "Qty: ${orderItem.quantity}"
                tvPrice.text = DecimalFormat("₱#,##0.00").format(orderItem.price * orderItem.quantity)

                Glide.with(root.context)
                    .load(orderItem.orderItemImage)
                    .placeholder(R.drawable.placeholder_product)
                    .error(R.drawable.placeholder_product)
                    .into(ivProductImage)
            }
        }

        override fun getItemCount() = orderItems.size
    }
}