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
import com.example.pawtopia.api.ApiClient
import com.example.pawtopia.databinding.ActivityProductDetailBinding
import com.example.pawtopia.databinding.ItemProductSimpleBinding
import com.example.pawtopia.model.Product
import com.example.pawtopia.util.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Collections

class ProductDetailActivity : AppCompatActivity() {
    private lateinit var binding: ActivityProductDetailBinding
    private lateinit var sessionManager: SessionManager
    private var product: Product? = null
    private var quantity = 1
    private var maxQuantity = Int.MAX_VALUE // Will be set based on product stock
    private var allProducts: List<Product> = emptyList()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityProductDetailBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)
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
                tvProductPrice.text = "$${it.productPrice}"
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

                    // TODO: Implement add to cart functionality with quantity
                    Toast.makeText(
                        this,
                        "${quantity} ${product.productName} added to cart",
                        Toast.LENGTH_SHORT
                    ).show()
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

    private fun loadAllProducts() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val apiService = ApiClient.createApiService(sessionManager)
                val response = apiService.getProducts()

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful) {
                        allProducts = response.body() ?: emptyList()
                        setupRelatedProducts()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(
                        this@ProductDetailActivity,
                        "Error loading related products",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }
    }

    private fun setupRelatedProducts() {
        // Filter out current product and get random 5 products
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

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RelatedProductViewHolder {
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
                tvProductPrice.text = "$${product.productPrice}"

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