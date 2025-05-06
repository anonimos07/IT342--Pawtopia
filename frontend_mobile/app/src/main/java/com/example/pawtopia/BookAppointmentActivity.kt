package com.example.pawtopia

import android.app.DatePickerDialog
import android.app.TimePickerDialog
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.text.InputFilter
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.pawtopia.databinding.ActivityBookAppointmentBinding
import com.example.pawtopia.model.AppointmentRequest
import com.example.pawtopia.model.UserReference
import com.example.pawtopia.repository.AppointmentRepository
import com.example.pawtopia.util.SessionManager
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale
import com.example.pawtopia.util.Result


class BookAppointmentActivity : AppCompatActivity() {
    private lateinit var binding: ActivityBookAppointmentBinding
    private lateinit var sessionManager: SessionManager
    private lateinit var appointmentRepository: AppointmentRepository
    private val calendar = Calendar.getInstance()
    private var selectedService = ""
    private var selectedPrice = 0

    companion object {
        fun start(context: Context) {
            val intent = Intent(context, BookAppointmentActivity::class.java)
            context.startActivity(intent)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityBookAppointmentBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Add input filter to limit contact number to 11 digits
        binding.etContactNumber.filters = arrayOf<InputFilter>(InputFilter.LengthFilter(11))

        binding.btnBack.setOnClickListener {
            if (supportFragmentManager.backStackEntryCount > 0) {
                supportFragmentManager.popBackStack()
            } else {
                finish()
            }
        }

        sessionManager = SessionManager(this)
        appointmentRepository = AppointmentRepository(sessionManager)

        // Check if user is logged in, if not redirect to login
        if (!sessionManager.isLoggedIn()) {
            Toast.makeText(this, "Please login to book an appointment", Toast.LENGTH_SHORT).show()
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }

        // Set up date picker
        binding.tvDate.setOnClickListener {
            showDatePicker()
        }

        // Set up time picker
        binding.layoutTime.setOnClickListener {
            showTimePicker()
        }

        // Set up service radio buttons
        binding.radioGroupService.setOnCheckedChangeListener { _, checkedId ->
            when (checkedId) {
                R.id.radio_grooming -> {
                    selectedService = "Grooming"
                    binding.radioGroupPrice.visibility = View.VISIBLE
                    binding.textPriceTitle.visibility = View.VISIBLE
                }
                R.id.radio_boarding -> {
                    selectedService = "Boarding"
                    binding.radioGroupPrice.visibility = View.VISIBLE
                    binding.textPriceTitle.visibility = View.VISIBLE
                }
            }
        }

        // Set up price radio buttons
        binding.radioGroupPrice.setOnCheckedChangeListener { _, checkedId ->
            when (checkedId) {
                R.id.radio_500 -> selectedPrice = 500
                R.id.radio_1000 -> selectedPrice = 1000
            }
        }

        // Set up book appointment button
        binding.btnBookAppointment.setOnClickListener {
            if (validateInputs()) {
                bookAppointment()
            }
        }
    }

    private fun showDatePicker() {
        val datePickerDialog = DatePickerDialog(
            this,
            { _, year, month, dayOfMonth ->
                calendar.set(Calendar.YEAR, year)
                calendar.set(Calendar.MONTH, month)
                calendar.set(Calendar.DAY_OF_MONTH, dayOfMonth)
                updateDateInView()
            },
            calendar.get(Calendar.YEAR),
            calendar.get(Calendar.MONTH),
            calendar.get(Calendar.DAY_OF_MONTH)
        )

        // Set minimum date to today
        datePickerDialog.datePicker.minDate = System.currentTimeMillis() - 1000
        datePickerDialog.show()
    }

    private fun updateDateInView() {
        val myFormat = "MM/dd/yyyy"
        val sdf = SimpleDateFormat(myFormat, Locale.US)
        binding.tvDate.text = sdf.format(calendar.time)
    }

    private fun showTimePicker() {
        val timePickerDialog = TimePickerDialog(
            this,
            { _, hourOfDay, minute ->
                calendar.set(Calendar.HOUR_OF_DAY, hourOfDay)
                calendar.set(Calendar.MINUTE, minute)
                updateTimeInView()
            },
            calendar.get(Calendar.HOUR_OF_DAY),
            calendar.get(Calendar.MINUTE),
            false
        )
        timePickerDialog.show()
    }

    private fun updateTimeInView() {
        val myFormat = "hh:mm a"
        val sdf = SimpleDateFormat(myFormat, Locale.US)
        binding.tvTime.text = sdf.format(calendar.time)
    }

    private fun validateInputs(): Boolean {
        var isValid = true

        // Validate contact number
        if (binding.etContactNumber.text.toString().trim().isEmpty()) {
            binding.etContactNumber.error = "Contact number is required"
            isValid = false
        }

        // Validate date
        if (binding.tvDate.text.toString() == "Select date") {
            Toast.makeText(this, "Please select an appointment date", Toast.LENGTH_SHORT).show()
            isValid = false
        }

        // Validate time
        if (binding.tvTime.text.toString() == "Select time") {
            Toast.makeText(this, "Please select an appointment time", Toast.LENGTH_SHORT).show()
            isValid = false
        }

        // Validate service
        if (selectedService.isEmpty()) {
            Toast.makeText(this, "Please select a service", Toast.LENGTH_SHORT).show()
            isValid = false
        }

        // Validate price
        if (selectedPrice == 0) {
            Toast.makeText(this, "Please select a price", Toast.LENGTH_SHORT).show()
            isValid = false
        }

        return isValid
    }

    private fun bookAppointment() {
        val userId = sessionManager.getUserId().takeIf { it != 0L } ?: run {
            Toast.makeText(this, "User not found", Toast.LENGTH_SHORT).show()
            return
        }

        val userEmail = sessionManager.getUserEmail() ?: run {
            Toast.makeText(this, "User email not found", Toast.LENGTH_SHORT).show()
            return
        }

        val contactNumber = binding.etContactNumber.text.toString().trim()
        val date = SimpleDateFormat("MM/dd/yyyy", Locale.US).parse(binding.tvDate.text.toString())
        val time = SimpleDateFormat("hh:mm a", Locale.US).parse(binding.tvTime.text.toString())

        val appointmentRequest = AppointmentRequest(
            email = userEmail,
            contactNo = contactNumber,
            date = date?.time,
            time = SimpleDateFormat("HH:mm", Locale.US).format(time!!),
            groomService = selectedService,
            price = selectedPrice,
            user = UserReference(userId)  // This creates the nested user object with userId
        )

        lifecycleScope.launch {
            binding.progressBar.visibility = View.VISIBLE
            when (val result = appointmentRepository.bookAppointment(appointmentRequest)) {
                is Result.Success -> {
                    Toast.makeText(
                        this@BookAppointmentActivity,
                        "Appointment booked! ${result.data.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                    finish()
                }
                is Result.Error -> {
                    Toast.makeText(
                        this@BookAppointmentActivity,
                        "Error: ${result.exception.message}",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
            binding.progressBar.visibility = View.GONE
        }
    }
}