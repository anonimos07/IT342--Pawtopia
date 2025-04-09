package com.example.pawtopia.fragments

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.example.pawtopia.LoginActivity
import com.example.pawtopia.databinding.FragmentHomeBinding

class HomeFragment : Fragment() {
    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

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

        // Set up click listeners for services
        binding.btnGroomingBook.setOnClickListener {
            // Navigate to services tab and scroll to grooming
            (requireActivity().supportFragmentManager.findFragmentById(com.example.pawtopia.R.id.fragment_container) as? ServicesFragment)?.scrollToGrooming()
                ?: run {
                    // If services fragment is not loaded, load it
                    requireActivity().supportFragmentManager.beginTransaction()
                        .replace(com.example.pawtopia.R.id.fragment_container, ServicesFragment())
                        .commit()
                }
        }

        binding.btnBoardingBook.setOnClickListener {
            // Navigate to services tab and scroll to boarding
            (requireActivity().supportFragmentManager.findFragmentById(com.example.pawtopia.R.id.fragment_container) as? ServicesFragment)?.scrollToBoarding()
                ?: run {
                    // If services fragment is not loaded, load it
                    requireActivity().supportFragmentManager.beginTransaction()
                        .replace(com.example.pawtopia.R.id.fragment_container, ServicesFragment())
                        .commit()
                }
        }

        // Set up view all products button
        binding.btnViewAllProducts.setOnClickListener {
            // Navigate to products tab
            requireActivity().supportFragmentManager.beginTransaction()
                .replace(com.example.pawtopia.R.id.fragment_container, ProductsFragment())
                .commit()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
