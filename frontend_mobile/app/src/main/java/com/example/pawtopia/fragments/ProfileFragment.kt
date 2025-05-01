package com.example.pawtopia.fragments

import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PorterDuff
import android.graphics.drawable.Animatable
import android.graphics.drawable.AnimationDrawable
import android.os.Bundle
import android.util.TypedValue
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.Toast
import androidx.core.content.ContextCompat
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
        binding.tvUsername.text = sessionManager.getUsername() ?: "Guest"
        binding.tvEmail.text = sessionManager.getEmail() ?: "No email"
    }

    private fun setupClickListeners() {
        binding.btnLogout.setOnClickListener {
            showLoading(binding.progressLogout, binding.btnLogout, true)
            binding.root.postDelayed({
                showLoading(binding.progressLogout, binding.btnLogout, false)
                sessionManager.logout()
                startActivity(Intent(requireActivity(), LoginActivity::class.java))
                requireActivity().finish()
            }, 1500)
        }

        binding.btnEditProfile.setOnClickListener {
            showLoading(binding.progressEditProfile, binding.btnEditProfile, true)
            binding.root.postDelayed({
                showLoading(binding.progressEditProfile, binding.btnEditProfile, false)
                parentFragmentManager.beginTransaction()
                    .replace(R.id.fragment_container, EditProfileFragment())
                    .addToBackStack(null)
                    .commit()
            }, 1500)
        }

        binding.btnOrders.setOnClickListener {
            showLoading(binding.progressOrders, binding.btnOrders, true)
            binding.root.postDelayed({
                showLoading(binding.progressOrders, binding.btnOrders, false)
                // Handle orders action
            }, 1500)
        }

        binding.btnAppointments.setOnClickListener {
            showLoading(binding.progressAppointments, binding.btnAppointments, true)
            binding.root.postDelayed({
                showLoading(binding.progressAppointments, binding.btnAppointments, false)
                // Handle appointments action
            }, 1500)
        }
    }

    private fun showLoading(progressBar: ProgressBar, button: Button, show: Boolean) {
        if (show) {
            button.text = ""
            button.isEnabled = false
            progressBar.visibility = View.VISIBLE
        } else {
            button.text = when (button.id) {
                R.id.btnEditProfile -> "Edit Profile"
                R.id.btnOrders -> "Orders"
                R.id.btnAppointments -> "Appointments"
                R.id.btnLogout -> "Logout"
                else -> ""
            }
            button.isEnabled = true
            progressBar.visibility = View.GONE
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}