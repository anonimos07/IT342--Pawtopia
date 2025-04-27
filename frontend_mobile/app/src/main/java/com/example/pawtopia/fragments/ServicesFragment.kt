package com.example.pawtopia.fragments

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.example.pawtopia.LoginRequiredActivity
import com.example.pawtopia.BookAppointmentActivity // Add this import
import com.example.pawtopia.databinding.FragmentServicesBinding
import com.example.pawtopia.util.SessionManager

class ServicesFragment : Fragment() {
    private var _binding: FragmentServicesBinding? = null
    private val binding get() = _binding!!
    private lateinit var sessionManager: SessionManager

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentServicesBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        sessionManager = SessionManager(requireContext())

        // Set up book appointment button
        binding.btnBookAppointment.setOnClickListener {
            if (sessionManager.isLoggedIn()) {
                // Redirect to BookAppointmentActivity
                startActivity(Intent(requireContext(), BookAppointmentActivity::class.java))
            } else {
                // Show login required screen
                LoginRequiredActivity.startForBooking(requireContext())
            }
        }
    }

    fun scrollToGrooming() {
        binding.scrollView.post {
            binding.scrollView.smoothScrollTo(0, binding.cardGrooming.top)
        }
    }

    fun scrollToBoarding() {
        binding.scrollView.post {
            binding.scrollView.smoothScrollTo(0, binding.cardBoarding.top)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}