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
import com.example.pawtopia.ProductDetailActivity
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
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import retrofit2.Response
import java.util.concurrent.TimeUnit

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
                val client = OkHttpClient.Builder()
                    .connectTimeout(30, TimeUnit.SECONDS)
                    .readTimeout(30, TimeUnit.SECONDS)
                    .build()

                val requestBuilder = Request.Builder()
                    .url("https://it342-pawtopia-10.onrender.com/api/product/getProduct")
                    .get()

                // Only add authorization if logged in
                sessionManager.getToken()?.let { token ->
                    requestBuilder.addHeader("Authorization", "Bearer $token")
                }

                val request = requestBuilder.build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string()

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful && !responseBody.isNullOrEmpty()) {
                        val jsonArray = JSONArray(responseBody)
                        val products = mutableListOf<Product>()

                        for (i in 0 until jsonArray.length()) {
                            val jsonObject = jsonArray.getJSONObject(i)
                            products.add(
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

                        // Take first 3 products as featured
                        productAdapter.updateProducts(products.take(3))
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

        inner class ProductViewHolder(val binding: ItemProductBinding) : RecyclerView.ViewHolder(binding.root) {
            init {
                binding.btnAddToCart.text = "View Details" // Change button text
            }
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProductViewHolder {
            val binding = ItemProductBinding.inflate(LayoutInflater.from(parent.context), parent, false)
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

                // In your ProductAdapter's onBindViewHolder:
                btnAddToCart.setOnClickListener {
                    val intent = Intent(root.context, ProductDetailActivity::class.java).apply {
                        putExtra("product", product) // Make sure 'product' is not null here
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