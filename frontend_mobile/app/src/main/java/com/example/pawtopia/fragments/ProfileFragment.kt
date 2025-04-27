package com.example.pawtopia.fragments

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.example.pawtopia.LoginActivity
import com.example.pawtopia.R
import com.example.pawtopia.databinding.FragmentProfileBinding
import com.example.pawtopia.util.SessionManager

class ProfileFragment : Fragment() {
    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!
    private lateinit var sessionManager: SessionManager

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProfileBinding.inflate(inflater, container, false)
        sessionManager = SessionManager(requireContext())

        setupUI()
        setupClickListeners()

        return binding.root
    }

    private fun setupUI() {
        // Display user information
        binding.tvUsername.text = sessionManager.getUsername() ?: "Guest"
        binding.tvEmail.text = sessionManager.getEmail() ?: "No email"
    }

    private fun setupClickListeners() {
        binding.btnLogout.setOnClickListener {
            sessionManager.logout()
            startActivity(Intent(requireActivity(), LoginActivity::class.java))
            requireActivity().finish()
        }

        binding.btnEditProfile.setOnClickListener {
            parentFragmentManager.beginTransaction()
                .replace(R.id.fragment_container, EditProfileFragment())
                .addToBackStack(null)
                .commit()
        }
    }


    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}