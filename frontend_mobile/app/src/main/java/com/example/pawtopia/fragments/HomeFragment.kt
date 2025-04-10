package com.example.pawtopia.fragments

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.example.pawtopia.LoginActivity
import com.example.pawtopia.LoginRequiredActivity
import com.example.pawtopia.R
import com.example.pawtopia.databinding.FragmentHomeBinding
import com.example.pawtopia.util.SessionManager

class HomeFragment : Fragment() {
    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!
    private lateinit var sessionManager: SessionManager

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

        // Set up click listeners for services
        binding.btnGroomingBook.setOnClickListener {
            if (sessionManager.isLoggedIn()) {
                // Navigate to services tab and scroll to grooming
                (requireActivity().supportFragmentManager.findFragmentById(R.id.fragment_container) as? ServicesFragment)?.scrollToGrooming()
                    ?: run {
                        // If services fragment is not loaded, load it
                        requireActivity().supportFragmentManager.beginTransaction()
                            .replace(R.id.fragment_container, ServicesFragment())
                            .commit()
                    }
            } else {
                // Show login required screen
                LoginRequiredActivity.start(requireContext())
            }
        }

        binding.btnBoardingBook.setOnClickListener {
            if (sessionManager.isLoggedIn()) {
                // Navigate to services tab and scroll to boarding
                (requireActivity().supportFragmentManager.findFragmentById(R.id.fragment_container) as? ServicesFragment)?.scrollToBoarding()
                    ?: run {
                        // If services fragment is not loaded, load it
                        requireActivity().supportFragmentManager.beginTransaction()
                            .replace(R.id.fragment_container, ServicesFragment())
                            .commit()
                    }
            } else {
                // Show login required screen
                LoginRequiredActivity.start(requireContext())
            }
        }

        // Set up view all products button
        binding.btnViewAllProducts.setOnClickListener {
            // Navigate to products tab
            requireActivity().supportFragmentManager.beginTransaction()
                .replace(R.id.fragment_container, ProductsFragment())
                .commit()
        }

        // Add to cart buttons in the featured products section
        val productButtons = view.findViewWithTag<View>("add_to_cart_button")
        productButtons?.setOnClickListener {
            if (sessionManager.isLoggedIn()) {
                Toast.makeText(requireContext(), "Added to cart", Toast.LENGTH_SHORT).show()
            } else {
                LoginRequiredActivity.start(requireContext())
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
