package com.example.pawtopia.fragments

import android.content.Intent
import android.graphics.Rect
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
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
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class ProductsFragment : Fragment() {
    private var _binding: FragmentProductsBinding? = null
    private val binding get() = _binding ?: throw IllegalStateException("Cannot access binding after onDestroyView")

    private lateinit var sessionManager: SessionManager
    private lateinit var productAdapter: ProductAdapter
    private var currentPage = 1
    private var selectedType: String? = null
    private var allProducts: List<Product> = emptyList()
    private var filteredProducts: List<Product> = emptyList()
    private var loadJob: Job? = null
    private var filterJob: Job? = null

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
        productAdapter = ProductAdapter(emptyList(), sessionManager) { product ->
            val intent = Intent(requireContext(), ProductDetailActivity::class.java).apply {
                putExtra("product", product)
                if (sessionManager.isLoggedIn().not()) {
                    putExtra("show_login_prompt", true)
                }
            }
            startActivity(intent)
        }

        binding.gridProducts.apply {
            val gridLayoutManager = GridLayoutManager(requireContext(), 2).apply {
                spanSizeLookup = object : GridLayoutManager.SpanSizeLookup() {
                    override fun getSpanSize(position: Int): Int = 1
                }
            }
            layoutManager = gridLayoutManager
            adapter = productAdapter
            setHasFixedSize(true)
            addItemDecoration(SpacingItemDecoration(8))
        }
    }


    private fun setupClickListeners() {
        binding.btnFilter.setOnClickListener {
            showFilterDialog()
        }

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
                filterJob?.cancel()
                filterJob = viewLifecycleOwner.lifecycleScope.launch {
                    s?.toString()?.let { query ->
                        filterProducts(query)
                    }
                }
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

    private fun loadProducts() {
        loadJob?.cancel()
        loadJob = viewLifecycleOwner.lifecycleScope.launch {
            try {
                binding.progressBar.visibility = View.VISIBLE

                val result = withContext(Dispatchers.IO) {
                    productRepository.getProducts()
                }

                if (!isAdded || _binding == null) return@launch

                when (result) {
                    is Result.Success -> {
                        allProducts = result.data
                        filterProducts(binding.etSearch.text.toString())
                    }
                    is Result.Error -> {
                        showToast("Error: ${result.exception.message}")
                    }
                }
            } catch (e: Exception) {
                showToast("Error: ${e.message}")
            } finally {
                if (isAdded && _binding != null) {
                    binding.progressBar.visibility = View.GONE
                }
            }
        }
    }

    private fun filterProducts(searchQuery: String) {
        if (!isAdded || _binding == null) return

        filteredProducts = allProducts.filter { product ->
            val matchesType = selectedType?.let {
                product.productType.equals(it, ignoreCase = true)
            } ?: true

            val matchesSearch = searchQuery.isEmpty() ||
                    product.productName.contains(searchQuery, ignoreCase = true) ||
                    product.description.contains(searchQuery, ignoreCase = true)

            matchesType && matchesSearch
        }

        updatePaginatedProducts()
    }

    private fun updatePaginatedProducts() {
        if (!isAdded || _binding == null) return

        val startIndex = (currentPage - 1) * 8
        val endIndex = minOf(startIndex + 8, filteredProducts.size)
        val paginatedProducts = filteredProducts.subList(startIndex, endIndex)
        productAdapter.updateProducts(paginatedProducts)
        updatePaginationUI(filteredProducts.size)
    }

    private fun updatePaginationUI(totalItems: Int) {
        if (!isAdded || _binding == null) return

        val totalPages = (totalItems + 7) / 8
        binding.page1.visibility = if (totalPages >= 1) View.VISIBLE else View.GONE
        binding.page2.visibility = if (totalPages >= 2) View.VISIBLE else View.GONE
        binding.page3.visibility = if (totalPages >= 3) View.VISIBLE else View.GONE
        binding.page4.visibility = if (totalPages >= 4) View.VISIBLE else View.GONE

        val selectedBg = R.drawable.selected_page_background
        val unselectedBg = R.drawable.unselected_page_background

        binding.page1.setBackgroundResource(if (currentPage == 1) selectedBg else unselectedBg)
        binding.page2.setBackgroundResource(if (currentPage == 2) selectedBg else unselectedBg)
        binding.page3.setBackgroundResource(if (currentPage == 3) selectedBg else unselectedBg)
        binding.page4.setBackgroundResource(if (currentPage == 4) selectedBg else unselectedBg)
    }

    private fun updatePagination(page: Int) {
        currentPage = page
        updatePaginatedProducts()
    }

    private fun showToast(message: String?) {
        if (isAdded && _binding != null) {
            Toast.makeText(requireContext(), message, Toast.LENGTH_SHORT).show()
        }
    }

    override fun onDestroyView() {
        loadJob?.cancel()
        filterJob?.cancel()
        _binding = null
        super.onDestroyView()
    }

    private class ProductAdapter(
        private var products: List<Product>,
        private val sessionManager: SessionManager,
        private val onItemClick: (Product) -> Unit
    ) : RecyclerView.Adapter<ProductAdapter.ProductViewHolder>() {

        inner class ProductViewHolder(val binding: ItemProductBinding) : RecyclerView.ViewHolder(binding.root) {
            init {
                binding.root.setOnClickListener {
                    val position = adapterPosition
                    if (position != RecyclerView.NO_POSITION) {
                        onItemClick(products[position])
                    }
                }
            }

            fun bind(product: Product) {
                binding.apply {
                    tvProductName.text = product.productName
                    tvProductPrice.text = "$${product.productPrice}"

                    Glide.with(root.context)
                        .load(product.productImage)
                        .placeholder(R.drawable.placeholder_product)
                        .into(ivProductImage)
                }
            }
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProductViewHolder {
            val binding = ItemProductBinding.inflate(
                LayoutInflater.from(parent.context),
                parent,
                false
            )
            return ProductViewHolder(binding)
        }

        override fun onBindViewHolder(holder: ProductViewHolder, position: Int) {
            holder.bind(products[position])
        }

        override fun getItemCount() = products.size

        fun updateProducts(newProducts: List<Product>) {
            products = newProducts
            notifyDataSetChanged()
        }
    }

    class SpacingItemDecoration(private val space: Int) : RecyclerView.ItemDecoration() {
        override fun getItemOffsets(outRect: Rect, view: View, parent: RecyclerView, state: RecyclerView.State) {
            with(outRect) {
                left = space
                right = space
                bottom = space
                top = space
            }
        }
    }
}