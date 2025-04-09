package com.example.pawtopia.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.example.pawtopia.databinding.FragmentServicesBinding

class ServicesFragment : Fragment() {
    private var _binding: FragmentServicesBinding? = null
    private val binding get() = _binding!!

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

        // Set up book appointment button
        binding.btnBookAppointment.setOnClickListener {
            Toast.makeText(requireContext(), "Booking appointment...", Toast.LENGTH_SHORT).show()
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
