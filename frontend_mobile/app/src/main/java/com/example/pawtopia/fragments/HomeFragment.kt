package com.example.pawtopia.fragments

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.pawtopia.LoginActivity
import com.example.pawtopia.LoginRequiredActivity
import com.example.pawtopia.R
import com.example.pawtopia.api.ApiClient
import com.example.pawtopia.databinding.FragmentHomeBinding
import com.example.pawtopia.databinding.ItemProductBinding
import com.example.pawtopia.model.Product
import com.example.pawtopia.util.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.Response

class HomeFragment : Fragment() {
    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!
    private lateinit var sessionManager: SessionManager
    private lateinit var productAdapter: ProductAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        sessionManager = SessionManager(requireContext())
        setupRecyclerView()
        setupClickListeners()
        loadFeaturedProducts()
    }

    private fun setupRecyclerView() {
        productAdapter = ProductAdapter(emptyList(), sessionManager)
        binding.rvFeaturedProducts.apply {
            layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false)
            adapter = productAdapter
        }
    }

    private fun setupClickListeners() {
        binding.btnGroomingBook.setOnClickListener {
            if (sessionManager.isLoggedIn()) {
                navigateToServicesFragment(true)
            } else {
                LoginRequiredActivity.start(requireContext())
            }
        }

        binding.btnBoardingBook.setOnClickListener {
            if (sessionManager.isLoggedIn()) {
                navigateToServicesFragment(false)
            } else {
                LoginRequiredActivity.start(requireContext())
            }
        }

        binding.btnViewAllProducts.setOnClickListener {
            parentFragmentManager.beginTransaction()
                .replace(R.id.fragment_container, ProductsFragment())
                .addToBackStack(null)
                .commit()
        }
    }

    private fun navigateToServicesFragment(scrollToGrooming: Boolean) {
        val servicesFragment = ServicesFragment().apply {
            arguments = Bundle().apply {
                putBoolean("scrollToGrooming", scrollToGrooming)
            }
        }

        parentFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, servicesFragment)
            .addToBackStack(null)
            .commit()
    }

    private fun loadFeaturedProducts() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val apiService = ApiClient.createApiService(sessionManager)
                val response: Response<List<Product>> = apiService.getProducts()

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful) {
                        val products = response.body()?.take(3) ?: emptyList()
                        productAdapter.updateProducts(products)
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

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private inner class ProductAdapter(
        private var products: List<Product>,
        private val sessionManager: SessionManager
    ) : RecyclerView.Adapter<ProductAdapter.ProductViewHolder>() {

        inner class ProductViewHolder(val binding: ItemProductBinding) :
            RecyclerView.ViewHolder(binding.root)

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
                        // TODO: Implement add to cart functionality
                        Toast.makeText(
                            root.context,
                            "${product.productName} added to cart",
                            Toast.LENGTH_SHORT
                        ).show()
                    } else {
                        LoginRequiredActivity.start(root.context)
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