package com.example.pawtopia.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.example.pawtopia.databinding.FragmentProductsBinding

class ProductsFragment : Fragment() {
    private var _binding: FragmentProductsBinding? = null
    private val binding get() = _binding!!

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

        // Set up add to cart buttons
        binding.btnAddToCart1.setOnClickListener {
            Toast.makeText(requireContext(), "Added to cart", Toast.LENGTH_SHORT).show()
        }

        binding.btnAddToCart2.setOnClickListener {
            Toast.makeText(requireContext(), "Added to cart", Toast.LENGTH_SHORT).show()
        }

        binding.btnAddToCart3.setOnClickListener {
            Toast.makeText(requireContext(), "Added to cart", Toast.LENGTH_SHORT).show()
        }

        binding.btnAddToCart4.setOnClickListener {
            Toast.makeText(requireContext(), "Added to cart", Toast.LENGTH_SHORT).show()
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
