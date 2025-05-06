package com.example.pawtopia

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.LayoutInflater
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.pawtopia.databinding.ActivityOrdersBinding
import com.example.pawtopia.databinding.ItemOrderBinding
import com.example.pawtopia.model.Order
import com.example.pawtopia.repository.OrderRepository
import com.example.pawtopia.util.Result
import com.example.pawtopia.util.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class OrdersActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOrdersBinding
    private val sessionManager by lazy { SessionManager(this) }
    private val orderRepository by lazy { OrderRepository(sessionManager) }
    private lateinit var ordersAdapter: OrdersAdapter

    companion object {
        fun start(context: Context) {
            val intent = Intent(context, OrdersActivity::class.java)
            context.startActivity(intent)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOrdersBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupRecyclerView()
        setupClickListeners()
        loadUserOrders()
    }

    private fun setupRecyclerView() {
        ordersAdapter = OrdersAdapter(emptyList()) { order ->
            OrderConfirmationActivity.start(this, order.orderID, "Order details")
        }

        binding.rvOrders.apply {
            layoutManager = LinearLayoutManager(this@OrdersActivity)
            adapter = ordersAdapter
        }
    }

    private fun setupClickListeners() {
        // Handle back button click
        binding.btnBack.setOnClickListener {
            onBackPressedDispatcher.onBackPressed()
        }
    }

    private fun loadUserOrders() {
        CoroutineScope(Dispatchers.IO).launch {
            val userId = sessionManager.getUserId()
            val result = orderRepository.getOrdersByUserId(userId)
            withContext(Dispatchers.Main) {
                when (result) {
                    is Result.Success -> {
                        ordersAdapter.updateOrders(result.data)
                        if (result.data.isEmpty()) {
                            binding.tvEmpty.visibility = View.VISIBLE
                            binding.rvOrders.visibility = View.GONE
                        } else {
                            binding.tvEmpty.visibility = View.GONE
                            binding.rvOrders.visibility = View.VISIBLE
                        }
                    }
                    is Result.Error -> {
                        Toast.makeText(
                            this@OrdersActivity,
                            "Error loading orders: ${result.exception.message}",
                            Toast.LENGTH_SHORT
                        ).show()
                        Log.e("OrdersActivity", "Error loading orders", result.exception)
                        binding.tvEmpty.visibility = View.VISIBLE
                        binding.rvOrders.visibility = View.GONE
                    }
                }
            }
        }
    }

    private inner class OrdersAdapter(
        private var orders: List<Order>,
        private val onOrderClick: (Order) -> Unit
    ) : RecyclerView.Adapter<OrdersAdapter.OrderViewHolder>() {

        inner class OrderViewHolder(val binding: ItemOrderBinding) :
            RecyclerView.ViewHolder(binding.root)

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): OrderViewHolder {
            val binding = ItemOrderBinding.inflate(
                LayoutInflater.from(parent.context),
                parent,
                false
            )
            return OrderViewHolder(binding)
        }

        override fun onBindViewHolder(holder: OrderViewHolder, position: Int) {
            val order = orders[position]
            holder.binding.apply {
                tvOrderId.text = "Order #${order.orderID}"
                tvOrderDate.text = formatDate(order.orderDate)
                tvOrderStatus.text = order.orderStatus
                tvTotalAmount.text = formatPrice(order.totalPrice)

                root.setOnClickListener { onOrderClick(order) }
            }
        }

        override fun getItemCount() = orders.size

        fun updateOrders(newOrders: List<Order>) {
            orders = newOrders
            notifyDataSetChanged()
        }

        private fun formatDate(dateString: String): String {
            return try {
                val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
                val outputFormat = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
                val date = inputFormat.parse(dateString) ?: return dateString
                outputFormat.format(date)
            } catch (e: Exception) {
                dateString
            }
        }

        private fun formatPrice(price: Double): String {
            return "₱${String.format("%,.2f", price)}"
        }
    }
}