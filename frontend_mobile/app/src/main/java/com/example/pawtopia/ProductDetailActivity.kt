package com.example.pawtopia

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.ViewGroup
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.pawtopia.databinding.ActivityProductDetailBinding
import com.example.pawtopia.databinding.ItemProductSimpleBinding
import com.example.pawtopia.model.Cart
import com.example.pawtopia.model.CartItem
import com.example.pawtopia.model.Product
import com.example.pawtopia.repository.CartRepository
import com.example.pawtopia.util.Result
import com.example.pawtopia.util.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import java.util.concurrent.TimeUnit

class ProductDetailActivity : AppCompatActivity() {

    private lateinit var binding: ActivityProductDetailBinding
    private lateinit var sessionManager: SessionManager
    private lateinit var cartRepository: CartRepository
    private var product: Product? = null
    private var quantity = 1
    private var maxQuantity = Int.MAX_VALUE // Will be set based on product stock
    private var allProducts: List<Product> = emptyList()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityProductDetailBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)
        cartRepository = CartRepository(sessionManager)
        product = intent.getSerializableExtra("product") as? Product

        if (product == null) {
            Toast.makeText(this, "Product information not available", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        maxQuantity = product?.quantity ?: 0
        setupViews()
        setupClickListeners()
        loadAllProducts()
    }

    private fun setupViews() {
        product?.let {
            binding.apply {
                tvProductName.text = it.productName
                tvProductPrice.text = "₱${it.productPrice}"
                tvProductDescription.text = it.description
                tvProductType.text = "Category: ${it.productType}"
                tvQuantity.text = quantity.toString()

                Glide.with(this@ProductDetailActivity)
                    .load(it.productImage)
                    .placeholder(R.drawable.placeholder_product)
                    .into(ivProductImage)
            }
        }
    }

    private fun setupClickListeners() {
        binding.btnAddToCart.setOnClickListener {
            product?.let { product ->
                if (sessionManager.isLoggedIn()) {
                    if (quantity > maxQuantity) {
                        Toast.makeText(
                            this,
                            "Only $maxQuantity items available",
                            Toast.LENGTH_SHORT
                        ).show()
                        return@setOnClickListener
                    }

                    addToCart(product, quantity)
                } else {
                    LoginRequiredActivity.startForAddToCart(this)
                }
            }
        }

        binding.btnBack.setOnClickListener {
            finish()
        }

        binding.btnIncrease.setOnClickListener {
            if (quantity < maxQuantity) {
                quantity++
                binding.tvQuantity.text = quantity.toString()
            } else {
                Toast.makeText(
                    this,
                    "Maximum quantity reached (only $maxQuantity available)",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }

        binding.btnDecrease.setOnClickListener {
            if (quantity > 1) {
                quantity--
                binding.tvQuantity.text = quantity.toString()
            }
        }
    }

    private fun addToCart(product: Product, quantity: Int) {
        CoroutineScope(Dispatchers.IO).launch {
            val userId = sessionManager.getUserId()
            val cartResult = cartRepository.getCartByUserId(userId)
            withContext(Dispatchers.Main) {
                when (cartResult) {
                    is Result.Success -> {
                        val cart = cartResult.data
                        val cartItem = CartItem(
                            cartItemId = 0, // Will be set by backend
                            quantity = quantity,
                            lastUpdated = null,
                            cart = cart,
                            product = product
                        )
                        addCartItem(cartItem)
                    }

                    is Result.Error -> {
                        Toast.makeText(
                            this@ProductDetailActivity,
                            "Error accessing cart: ${cartResult.exception.message}",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            }
        }
    }

    private fun addCartItem(cartItem: CartItem) {
        CoroutineScope(Dispatchers.IO).launch {
            val result = cartRepository.addCartItem(cartItem)
            withContext(Dispatchers.Main) {
                when (result) {
                    is Result.Success -> {
                        Toast.makeText(
                            this@ProductDetailActivity,
                            "${quantity} ${cartItem.product.productName} added to cart",
                            Toast.LENGTH_SHORT
                        ).show()
                        // Remove the CartActivity.start() line
                    }
                    is Result.Error -> {
                        Toast.makeText(
                            this@ProductDetailActivity,
                            "Error adding to cart: ${result.exception.message}",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            }
        }
    }

    private fun loadAllProducts() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val client = OkHttpClient.Builder()
                    .connectTimeout(30, TimeUnit.SECONDS)
                    .readTimeout(30, TimeUnit.SECONDS)
                    .build()

                val requestBuilder = Request.Builder()
                    .url("https://it342-pawtopia-10.onrender.com/api/product/getProduct")
                    .get()

                sessionManager.getToken()?.let { token ->
                    requestBuilder.addHeader("Authorization", "Bearer $token")
                }

                val request = requestBuilder.build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string()

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful && !responseBody.isNullOrEmpty()) {
                        val jsonArray = JSONArray(responseBody)
                        val productsList = mutableListOf<Product>()

                        for (i in 0 until jsonArray.length()) {
                            val jsonObject = jsonArray.getJSONObject(i)
                            productsList.add(
                                Product(
                                    productID = jsonObject.getInt("productID"),
                                    description = jsonObject.getString("description"),
                                    productPrice = jsonObject.getDouble("productPrice"),
                                    productName = jsonObject.getString("productName"),
                                    productType = jsonObject.getString("productType"),
                                    quantity = jsonObject.getInt("quantity"),
                                    quantitySold = jsonObject.getInt("quantitySold"),
                                    productImage = jsonObject.getString("productImage")
                                )
                            )
                        }

                        allProducts = productsList
                        setupRelatedProducts()
                    } else {
                        Toast.makeText(
                            this@ProductDetailActivity,
                            "Error loading related products",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(
                        this@ProductDetailActivity,
                        "Error loading related products: ${e.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }
    }

    private fun setupRelatedProducts() {
        val relatedProducts = allProducts
            .filter { it.productID != product?.productID }
            .shuffled()
            .take(5)

        binding.rvRelatedProducts.apply {
            layoutManager = LinearLayoutManager(
                this@ProductDetailActivity,
                LinearLayoutManager.HORIZONTAL,
                false
            )
            adapter = RelatedProductsAdapter(relatedProducts)
        }
    }

    private inner class RelatedProductsAdapter(
        private val products: List<Product>
    ) : RecyclerView.Adapter<RelatedProductsAdapter.RelatedProductViewHolder>() {

        inner class RelatedProductViewHolder(val binding: ItemProductSimpleBinding) :
            RecyclerView.ViewHolder(binding.root)

        override fun onCreateViewHolder(
            parent: ViewGroup,
            viewType: Int
        ): RelatedProductViewHolder {
            val binding = ItemProductSimpleBinding.inflate(
                LayoutInflater.from(parent.context),
                parent,
                false
            )
            return RelatedProductViewHolder(binding)
        }

        override fun onBindViewHolder(holder: RelatedProductViewHolder, position: Int) {
            val product = products[position]
            holder.binding.apply {
                tvProductName.text = product.productName
                tvProductPrice.text = "₱${product.productPrice}"

                Glide.with(root.context)
                    .load(product.productImage)
                    .placeholder(R.drawable.placeholder_product)
                    .into(ivProductImage)

                root.setOnClickListener {
                    val intent = Intent(root.context, ProductDetailActivity::class.java).apply {
                        putExtra("product", product)
                    }
                    startActivity(intent)
                }
            }
        }

        override fun getItemCount() = products.size
    }
}
