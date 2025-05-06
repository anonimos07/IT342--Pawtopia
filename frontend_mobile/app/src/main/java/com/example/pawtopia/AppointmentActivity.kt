// AppointmentActivity.kt
package com.example.pawtopia

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.pawtopia.databinding.ActivityAppointmentBinding
import com.example.pawtopia.model.Appointment
import com.example.pawtopia.repository.AppointmentRepository
import com.example.pawtopia.util.Result
import com.example.pawtopia.util.SessionManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Locale

class AppointmentActivity : AppCompatActivity() {
    private lateinit var binding: ActivityAppointmentBinding
    private lateinit var sessionManager: SessionManager
    private lateinit var appointmentRepository: AppointmentRepository
    private lateinit var appointmentAdapter: AppointmentAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAppointmentBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)
        appointmentRepository = AppointmentRepository(sessionManager)

        binding.backButton.setOnClickListener {
            finish()
            overridePendingTransition(R.anim.slide_in_left, R.anim.slide_out_right)
        }

        setupRecyclerView()
        loadAppointments()
    }

    private fun setupRecyclerView() {
        appointmentAdapter = AppointmentAdapter()
        binding.appointmentsRecyclerView.apply {
            layoutManager = LinearLayoutManager(this@AppointmentActivity)
            adapter = appointmentAdapter
        }
    }

    private fun loadAppointments() {
        val userEmail = sessionManager.getUserEmail()
        if (userEmail.isNullOrEmpty()) {
            showErrorState("User email not found")
            return
        }

        binding.progressBar.visibility = View.VISIBLE
        binding.emptyState.visibility = View.GONE
        binding.appointmentsRecyclerView.visibility = View.GONE

        CoroutineScope(Dispatchers.IO).launch {
            try {
                when (val result = appointmentRepository.getAppointmentsByEmail(userEmail)) {
                    is Result.Success -> {
                        withContext(Dispatchers.Main) {
                            binding.progressBar.visibility = View.GONE
                            if (result.data.isEmpty()) {
                                showEmptyState("No appointments found")
                            } else {
                                showAppointments(result.data)
                            }
                        }
                    }
                    is Result.Error -> {
                        withContext(Dispatchers.Main) {
                            showErrorState("Error: ${result.exception.message}")
                        }
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    showErrorState("Unexpected error: ${e.message}")
                }
            }
        }
    }

    private fun showAppointments(appointments: List<Appointment>) {
        binding.progressBar.visibility = View.GONE
        binding.emptyState.visibility = View.GONE
        binding.appointmentsRecyclerView.visibility = View.VISIBLE
        appointmentAdapter.submitList(appointments)
    }

    private fun showEmptyState(message: String) {
        binding.progressBar.visibility = View.GONE
        binding.appointmentsRecyclerView.visibility = View.GONE
        binding.emptyState.visibility = View.VISIBLE
        binding.emptyState.text = message
    }

    private fun showErrorState(message: String) {
        binding.progressBar.visibility = View.GONE
        binding.appointmentsRecyclerView.visibility = View.GONE
        binding.emptyState.visibility = View.VISIBLE
        binding.emptyState.text = message
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
    }
}