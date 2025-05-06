package com.example.pawtopia

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.DividerItemDecoration
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.pawtopia.databinding.ActivityCartBinding
import com.example.pawtopia.databinding.ItemCartBinding
import com.example.pawtopia.model.CartItem
import com.example.pawtopia.repository.CartRepository
import com.example.pawtopia.util.Result
import com.example.pawtopia.util.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.DecimalFormat

class CartActivity : AppCompatActivity() {

    private lateinit var binding: ActivityCartBinding
    private lateinit var sessionManager: SessionManager
    private lateinit var cartRepository: CartRepository
    private lateinit var cartAdapter: CartAdapter
    private var cartItems: List<CartItem> = emptyList()
    private val SHIPPING_FEE = 30.0

    companion object {
        fun start(context: android.content.Context) {
            val intent = Intent(context, CartActivity::class.java)
            context.startActivity(intent)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCartBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)
        cartRepository = CartRepository(sessionManager)

        if (!sessionManager.isLoggedIn()) {
            LoginRequiredActivity.startForCart(this)
            finish()
            return
        }

        setupRecyclerView()
        setupClickListeners()
        loadCartItems()
    }

    private fun setupRecyclerView() {
        cartAdapter = CartAdapter(
            emptyList(),
            { cartItemId, newQuantity -> updateCartItemQuantity(cartItemId, newQuantity) },
            { cartItemId -> removeCartItem(cartItemId) }
        )
        binding.rvCartItems.apply {
            layoutManager = LinearLayoutManager(this@CartActivity)
            adapter = cartAdapter
            addItemDecoration(DividerItemDecoration(this@CartActivity, DividerItemDecoration.VERTICAL))
        }
    }

    private fun updateCartItemQuantity(cartItemId: Int, newQuantity: Int) {
        CoroutineScope(Dispatchers.IO).launch {
            val result = cartRepository.updateCartItemQuantity(cartItemId, newQuantity)
            withContext(Dispatchers.Main) {
                when (result) {
                    is Result.Success -> loadCartItems()
                    is Result.Error -> Toast.makeText(
                        this@CartActivity,
                        "Error updating quantity: ${result.exception.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }
    }

    private fun updateOrderSummary() {
        val decimalFormat = DecimalFormat("₱#,##0.00")
        val selectedItems = cartAdapter.getSelectedItems()
        val subtotal = selectedItems.sumOf { it.product.productPrice * it.quantity }
        val total = subtotal + SHIPPING_FEE

        binding.tvSubtotal.text = decimalFormat.format(subtotal)
        binding.tvShipping.text = decimalFormat.format(SHIPPING_FEE)
        binding.tvTotal.text = decimalFormat.format(total)

        // Update checkout button state
        binding.btnCheckout.isEnabled = selectedItems.isNotEmpty()
    }

    private fun setupClickListeners() {
        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.btnCheckout.setOnClickListener {
            val selectedItems = cartAdapter.getSelectedItems()

            if (selectedItems.isEmpty()) {
                Toast.makeText(this, "Please select at least one item to checkout", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (cartItems.isEmpty()) {
                Toast.makeText(this, "Your cart is empty", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // Pass only the selected items to CheckoutActivity
            CheckoutActivity.start(this, selectedItems)
        }
    }

    private fun loadCartItems() {
        CoroutineScope(Dispatchers.IO).launch {
            val userId = sessionManager.getUserId()
            val result = cartRepository.getCartByUserId(userId)
            withContext(Dispatchers.Main) {
                when (result) {
                    is Result.Success -> {
                        cartItems = result.data.cartItems ?: emptyList()
                        cartAdapter.updateCartItems(cartItems)
                        updateOrderSummary()
                    }

                    is Result.Error -> {
                        Toast.makeText(
                            this@CartActivity,
                            "Error loading cart: ${result.exception.message}",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            }
        }
    }

    private fun removeCartItem(cartItemId: Int) {
        CoroutineScope(Dispatchers.IO).launch {
            val result = cartRepository.deleteCartItem(cartItemId)
            withContext(Dispatchers.Main) {
                when (result) {
                    is Result.Success -> {
                        loadCartItems() // Refresh cart
                        Toast.makeText(
                            this@CartActivity,
                            "Item removed from cart",
                            Toast.LENGTH_SHORT
                        ).show()
                    }

                    is Result.Error -> {
                        Toast.makeText(
                            this@CartActivity,
                            "Error removing item: ${result.exception.message}",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            }
        }
    }

    private inner class CartAdapter(
        private var cartItems: List<CartItem>,
        private val onQuantityChanged: (Int, Int) -> Unit,
        private val onRemoveClick: (Int) -> Unit
    ) : RecyclerView.Adapter<CartAdapter.CartViewHolder>() {

        private val selectedItems = mutableSetOf<Int>()

        // Get context from parent
        private val context: Context
            get() = binding.root.context

        inner class CartViewHolder(val binding: ItemCartBinding) :
            RecyclerView.ViewHolder(binding.root)

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CartViewHolder {
            val binding = ItemCartBinding.inflate(
                LayoutInflater.from(parent.context),
                parent,
                false
            )
            return CartViewHolder(binding)
        }

        override fun onBindViewHolder(holder: CartViewHolder, position: Int) {
            val cartItem = cartItems[position]
            holder.binding.apply {
                tvProductName.text = cartItem.product.productName
                tvQuantity.text = cartItem.quantity.toString()
                tvPrice.text = "₱${DecimalFormat("#,##0.00").format(cartItem.product.productPrice * cartItem.quantity)}"

                cbSelect.isChecked = selectedItems.contains(cartItem.cartItemId)
                cbSelect.setOnCheckedChangeListener { _, isChecked ->
                    if (isChecked) {
                        selectedItems.add(cartItem.cartItemId)
                    } else {
                        selectedItems.remove(cartItem.cartItemId)
                    }
                    updateOrderSummary()
                    updateCheckoutButton()
                }

                Glide.with(root.context)
                    .load(cartItem.product.productImage)
                    .placeholder(R.drawable.placeholder_product)
                    .into(ivProductImage)

                btnRemove.setOnClickListener {
                    // Remove from selected items if it was selected
                    selectedItems.remove(cartItem.cartItemId)
                    onRemoveClick(cartItem.cartItemId)
                }

                btnIncrease.setOnClickListener {
                    val newQuantity = cartItem.quantity + 1
                    onQuantityChanged(cartItem.cartItemId, newQuantity)
                }

                btnDecrease.setOnClickListener {
                    if (cartItem.quantity > 1) {
                        val newQuantity = cartItem.quantity - 1
                        onQuantityChanged(cartItem.cartItemId, newQuantity)
                    }
                }
            }
        }

        override fun getItemCount() = cartItems.size

        fun updateCartItems(newCartItems: List<CartItem>) {
            cartItems = newCartItems
            notifyDataSetChanged()
        }

        fun getSelectedItems(): List<CartItem> {
            return cartItems.filter { selectedItems.contains(it.cartItemId) }
        }

        private fun updateCheckoutButton() {
            val activity = context as? CartActivity
            activity?.binding?.btnCheckout?.isEnabled = selectedItems.isNotEmpty()
        }
    }
}