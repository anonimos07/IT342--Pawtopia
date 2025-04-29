package com.example.pawtopia.fragments

import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
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
import com.example.pawtopia.databinding.FragmentProductsBinding
import com.example.pawtopia.databinding.ItemProductBinding
import com.example.pawtopia.model.Product
import com.example.pawtopia.repository.ProductRepository
import com.example.pawtopia.util.Result
import com.example.pawtopia.util.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class ProductsFragment : Fragment() {
    private var _binding: FragmentProductsBinding? = null
    private val binding get() = _binding!!
    private lateinit var sessionManager: SessionManager
    private lateinit var productAdapter: ProductAdapter
    private var currentPage = 1
    private var selectedType: String? = null
    private var allProducts: List<Product> = emptyList()
    private var filteredProducts: List<Product> = emptyList()

    private val productRepository by lazy { ProductRepository(sessionManager) }

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
        setupSearch()
        loadProducts()
    }

    private fun setupRecyclerView() {
        productAdapter = ProductAdapter(emptyList(), sessionManager)
        binding.gridProducts.apply {
            // Center the products in the grid
            val gridLayoutManager = GridLayoutManager(requireContext(), 2)
            gridLayoutManager.spanSizeLookup = object : GridLayoutManager.SpanSizeLookup() {
                override fun getSpanSize(position: Int): Int {
                    // Make items span full width if there's only one item in the last row
                    return if (productAdapter.itemCount % 2 != 0 && position == productAdapter.itemCount - 1) {
                        2
                    } else {
                        1
                    }
                }
            }
            layoutManager = gridLayoutManager
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

    private fun setupSearch() {
        binding.etSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}

            override fun afterTextChanged(s: Editable?) {
                filterProducts(s.toString())
            }
        })
    }

    private fun showFilterDialog() {
        val types = arrayOf("All", "Fur Clothing", "Toys", "Food", "Care Products")
        androidx.appcompat.app.AlertDialog.Builder(requireContext())
            .setTitle("Filter by Type")
            .setItems(types) { _, which ->
                selectedType = if (which == 0) null else types[which]
                currentPage = 1
                filterProducts(binding.etSearch.text.toString())
            }
            .show()
    }

    private fun filterProducts(searchQuery: String) {
        filteredProducts = allProducts.filter { product ->
            // Filter by type if selected
            val matchesType = selectedType?.let {
                product.productType.equals(it, ignoreCase = true)
            } ?: true

            // Filter by search query if not empty
            val matchesSearch = searchQuery.isEmpty() ||
                    product.productName.contains(searchQuery, ignoreCase = true) ||
                    product.description.contains(searchQuery, ignoreCase = true)

            matchesType && matchesSearch
        }

        updatePaginatedProducts()
    }

    private fun loadProducts() {
        CoroutineScope(Dispatchers.IO).launch {
            val result = productRepository.getProducts()
            withContext(Dispatchers.Main) {
                when (result) {
                    is Result.Success -> {
                        allProducts = result.data
                        filterProducts(binding.etSearch.text.toString())
                    }
                    is Result.Error -> {
                        Toast.makeText(
                            requireContext(),
                            "Error: ${result.exception.message}",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            }
        }
    }

    private fun updatePaginatedProducts() {
        val startIndex = (currentPage - 1) * 8
        val endIndex = minOf(startIndex + 8, filteredProducts.size)
        val paginatedProducts = filteredProducts.subList(startIndex, endIndex)
        productAdapter.updateProducts(paginatedProducts)
        updatePaginationUI(filteredProducts.size)
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
        updatePaginatedProducts()
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
                    if (sessionManager.isLoggedIn()) {
                        val intent = Intent(root.context, ProductDetailActivity::class.java).apply {
                            putExtra("product", product)
                        }
                        startActivity(intent)
                    } else {
                        val intent = Intent(root.context, LoginRequiredActivity::class.java)
                        startActivity(intent)
                    }
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