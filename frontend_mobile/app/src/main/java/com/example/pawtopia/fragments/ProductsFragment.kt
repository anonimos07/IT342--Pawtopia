package com.example.pawtopia.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.example.pawtopia.LoginRequiredActivity
import com.example.pawtopia.MainActivity
import com.example.pawtopia.databinding.FragmentProductsBinding
import com.example.pawtopia.util.SessionManager

class ProductsFragment : Fragment() {
    private var _binding: FragmentProductsBinding? = null
    private val binding get() = _binding!!
    private lateinit var sessionManager: SessionManager

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

        // Set up add to cart buttons
        binding.btnAddToCart1.setOnClickListener {
            handleAddToCart()
        }

        binding.btnAddToCart2.setOnClickListener {
            handleAddToCart()
        }

        binding.btnAddToCart3.setOnClickListener {
            handleAddToCart()
        }

        binding.btnAddToCart4.setOnClickListener {
            handleAddToCart()
        }

        // Set up pagination
        binding.page1.setOnClickListener {
            // Highlight page 1
            updatePagination(1)
        }

        binding.page2.setOnClickListener {
            // Highlight page 2
            updatePagination(2)
        }

        binding.page3.setOnClickListener {
            // Highlight page 3
            updatePagination(3)
        }

        binding.page4.setOnClickListener {
            // Highlight page 4
            updatePagination(4)
        }
    }

    private fun handleAddToCart() {
        // Check if user is logged in
        if (sessionManager.isLoggedIn()) {
            Toast.makeText(requireContext(), "Added to cart", Toast.LENGTH_SHORT).show()
        } else {
            // Show login required screen
            LoginRequiredActivity.startForAddToCart(requireContext())
        }
    }

    private fun updatePagination(selectedPage: Int) {
        binding.page1.setBackgroundResource(if (selectedPage == 1) com.example.pawtopia.R.drawable.selected_page_background else com.example.pawtopia.R.drawable.unselected_page_background)
        binding.page2.setBackgroundResource(if (selectedPage == 2) com.example.pawtopia.R.drawable.selected_page_background else com.example.pawtopia.R.drawable.unselected_page_background)
        binding.page3.setBackgroundResource(if (selectedPage == 3) com.example.pawtopia.R.drawable.selected_page_background else com.example.pawtopia.R.drawable.unselected_page_background)
        binding.page4.setBackgroundResource(if (selectedPage == 4) com.example.pawtopia.R.drawable.selected_page_background else com.example.pawtopia.R.drawable.unselected_page_background)

        // TODO: Load products for the selected page
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
