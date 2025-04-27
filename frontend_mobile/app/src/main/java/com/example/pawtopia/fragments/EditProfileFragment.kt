package com.example.pawtopia.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.example.pawtopia.R
import com.example.pawtopia.databinding.FragmentEditProfileBinding
import com.example.pawtopia.model.AddressRequest
import com.example.pawtopia.repository.UserRepository
import com.example.pawtopia.util.SessionManager
import kotlinx.coroutines.launch

class EditProfileFragment : Fragment() {
    private var _binding: FragmentEditProfileBinding? = null
    private val binding get() = _binding!!
    private lateinit var sessionManager: SessionManager
    private lateinit var userRepository: UserRepository

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentEditProfileBinding.inflate(inflater, container, false)
        sessionManager = SessionManager(requireContext())
        userRepository = UserRepository(sessionManager)

        setupUI()
        setupClickListeners()

        return binding.root
    }

    private fun setupUI() {
        // Load current user data if available
        // binding.etUsername.setText(sessionManager.getUsername() ?: "")
        // binding.etEmail.setText(sessionManager.getEmail() ?: "")

        // Fetch and display current address if available
        fetchCurrentAddress()
    }

    private fun fetchCurrentAddress() {
        lifecycleScope.launch {
            try {
                val userId = sessionManager.getUserId()
                val response = userRepository.getUserAddress(userId)

                if (response.isSuccess) {
                    response.getOrNull()?.let { address ->
                        binding.etRegion.setText(address.region)
                        binding.etProvince.setText(address.province)
                        binding.etCity.setText(address.city)
                        binding.etBarangay.setText(address.barangay)
                        binding.etPostalCode.setText(address.postalCode)
                        binding.etStreet.setText(address.streetBuildingHouseNo)
                    }
                }
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Failed to load address", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun setupClickListeners() {
        binding.btnSave.setOnClickListener {
            val address = AddressRequest(
                region = binding.etRegion.text.toString(),
                province = binding.etProvince.text.toString(),
                city = binding.etCity.text.toString(),
                barangay = binding.etBarangay.text.toString(),
                postalCode = binding.etPostalCode.text.toString(),
                streetBuildingHouseNo = binding.etStreet.text.toString()
            )

            updateAddress(address)
        }

        binding.btnBack.setOnClickListener {
            parentFragmentManager.popBackStack()
        }
    }

    private fun updateAddress(address: AddressRequest) {
        lifecycleScope.launch {
            try {
                binding.progressBar.visibility = View.VISIBLE
                val userId = sessionManager.getUserId()
                val response = userRepository.updateUserAddress(userId, address)

                if (response.isSuccess) {
                    Toast.makeText(requireContext(), "Address updated successfully", Toast.LENGTH_SHORT).show()
                    parentFragmentManager.popBackStack()
                } else {
                    Toast.makeText(requireContext(), "Failed to update address", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(requireContext(), "Error: ${e.message}", Toast.LENGTH_SHORT).show()
            } finally {
                binding.progressBar.visibility = View.GONE
            }
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}