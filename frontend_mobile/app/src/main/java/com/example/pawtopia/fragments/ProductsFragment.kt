package com.example.pawtopia.fragments

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.pawtopia.LoginRequiredActivity
import com.example.pawtopia.ProductDetailActivity
import com.example.pawtopia.R
import com.example.pawtopia.api.ApiClient
import com.example.pawtopia.databinding.FragmentProductsBinding
import com.example.pawtopia.databinding.ItemProductBinding
import com.example.pawtopia.model.Product
import com.example.pawtopia.util.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.Response
import kotlin.jvm.java

class ProductsFragment : Fragment() {
    private var _binding: FragmentProductsBinding? = null
    private val binding get() = _binding!!
    private lateinit var sessionManager: SessionManager
    private lateinit var productAdapter: ProductAdapter
    private var currentPage = 1
    private var selectedType: String? = null

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProductsBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        sessionManager = SessionManager(requireContext())
        setupRecyclerView()
        setupClickListeners()
        loadProducts()
    }

    private fun setupRecyclerView() {
        productAdapter = ProductAdapter(emptyList(), sessionManager)
        binding.gridProducts.apply {
            layoutManager = GridLayoutManager(requireContext(), 2)
            adapter = productAdapter
        }
    }

    private fun setupClickListeners() {
        binding.btnFilter.setOnClickListener {
            showFilterDialog()
        }

        // Pagination
        binding.page1.setOnClickListener { updatePagination(1) }
        binding.page2.setOnClickListener { updatePagination(2) }
        binding.page3.setOnClickListener { updatePagination(3) }
        binding.page4.setOnClickListener { updatePagination(4) }
    }

    private fun showFilterDialog() {
        val types = arrayOf("All", "Fur Clothing", "Toys", "Food", "Care Products")
        androidx.appcompat.app.AlertDialog.Builder(requireContext())
            .setTitle("Filter by Type")
            .setItems(types) { _, which ->
                selectedType = if (which == 0) null else types[which]
                currentPage = 1
                loadProducts()
            }
            .show()
    }

    private fun loadProducts() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val apiService = ApiClient.createApiService(sessionManager)
                val response: Response<List<Product>> = apiService.getProducts()

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful) {
                        val allProducts = response.body() ?: emptyList()
                        val filteredProducts = if (selectedType != null) {
                            allProducts.filter { it.productType == selectedType }
                        } else {
                            allProducts
                        }

                        // Paginate the results
                        val startIndex = (currentPage - 1) * 8
                        val endIndex = minOf(startIndex + 8, filteredProducts.size)
                        val paginatedProducts = filteredProducts.subList(startIndex, endIndex)

                        productAdapter.updateProducts(paginatedProducts)
                        updatePaginationUI(filteredProducts.size)
                    } else {
                        Toast.makeText(
                            requireContext(),
                            "Failed to load products",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(
                        requireContext(),
                        "Error: ${e.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        }
    }

    private fun updatePaginationUI(totalItems: Int) {
        val totalPages = (totalItems + 7) / 8 // Round up division
        binding.page1.visibility = if (totalPages >= 1) View.VISIBLE else View.GONE
        binding.page2.visibility = if (totalPages >= 2) View.VISIBLE else View.GONE
        binding.page3.visibility = if (totalPages >= 3) View.VISIBLE else View.GONE
        binding.page4.visibility = if (totalPages >= 4) View.VISIBLE else View.GONE

        binding.page1.setBackgroundResource(if (currentPage == 1) R.drawable.selected_page_background else R.drawable.unselected_page_background)
        binding.page2.setBackgroundResource(if (currentPage == 2) R.drawable.selected_page_background else R.drawable.unselected_page_background)
        binding.page3.setBackgroundResource(if (currentPage == 3) R.drawable.selected_page_background else R.drawable.unselected_page_background)
        binding.page4.setBackgroundResource(if (currentPage == 4) R.drawable.selected_page_background else R.drawable.unselected_page_background)
    }

    private fun updatePagination(page: Int) {
        currentPage = page
        loadProducts()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private inner class ProductAdapter(
        private var products: List<Product>,
        private val sessionManager: SessionManager
    ) : RecyclerView.Adapter<ProductAdapter.ProductViewHolder>() {

        inner class ProductViewHolder(val binding: ItemProductBinding) : RecyclerView.ViewHolder(binding.root)

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProductViewHolder {
            val binding = ItemProductBinding.inflate(
                LayoutInflater.from(parent.context),
                parent,
                false
            )
            return ProductViewHolder(binding)
        }

        override fun onBindViewHolder(holder: ProductViewHolder, position: Int) {
            val product = products[position]
            holder.binding.apply {
                tvProductName.text = product.productName
                tvProductPrice.text = "$${product.productPrice}"

                Glide.with(root.context)
                    .load(product.productImage)
                    .placeholder(R.drawable.placeholder_product)
                    .into(ivProductImage)

                btnAddToCart.setOnClickListener {
                    val intent = Intent(root.context, ProductDetailActivity::class.java).apply {
                        putExtra("product", product)
                    }
                    startActivity(intent)
                }
            }
        }

        override fun getItemCount() = products.size

        fun updateProducts(newProducts: List<Product>) {
            products = newProducts
            notifyDataSetChanged()
        }
    }
}