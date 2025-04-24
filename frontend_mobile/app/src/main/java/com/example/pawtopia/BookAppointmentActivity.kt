package com.example.pawtopia

import android.app.DatePickerDialog
import android.app.TimePickerDialog
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ArrayAdapter
import android.widget.PopupMenu
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.pawtopia.databinding.ActivityBookAppointmentBinding
import com.example.pawtopia.util.SessionManager
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

class BookAppointmentActivity : AppCompatActivity() {
    private lateinit var binding: ActivityBookAppointmentBinding
    private lateinit var sessionManager: SessionManager
    private val calendar = Calendar.getInstance()

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

        sessionManager = SessionManager(this)

        // Set up navigation icons
        binding.tvLogo.setOnClickListener {
            finish()
        }

        binding.ivHome.setOnClickListener {
            finish()
        }

        binding.ivCart.setOnClickListener {
            if (sessionManager.isLoggedIn()) {
                // TODO: Navigate to cart
                Toast.makeText(this, "Cart functionality coming soon", Toast.LENGTH_SHORT).show()
            } else {
                LoginRequiredActivity.startForCart(this)
            }
        }

        binding.ivPerson.setOnClickListener {
            if (!sessionManager.isLoggedIn()) {
                startActivity(Intent(this, LoginActivity::class.java))
            } else {
                // TODO: Navigate to profile
                Toast.makeText(this, "Profile functionality coming soon", Toast.LENGTH_SHORT).show()
            }
        }

        // Set up date picker
        binding.tvDate.setOnClickListener {
            showDatePicker()
        }

        // Set up time picker
        binding.layoutTime.setOnClickListener {
            showTimePicker()
        }

        // Set up service selection
        binding.layoutService.setOnClickListener {
            showServiceMenu(it)
        }

        // Set up payment method selection
        binding.layoutPayment.setOnClickListener {
            showPaymentMenu(it)
        }

        // Set up book appointment button
        binding.btnBookAppointment.setOnClickListener {
            if (validateInputs()) {
                // Check if user is logged in
                if (sessionManager.isLoggedIn()) {
                    // TODO: Process appointment booking
                    Toast.makeText(this, "Appointment booked successfully!", Toast.LENGTH_SHORT).show()
                    finish()
                } else {
                    LoginRequiredActivity.startForBookAppointment(this)
                }
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

    private fun showServiceMenu(view: View) {
        val popupMenu = PopupMenu(this, view)
        val services = arrayOf(
            "Basic Grooming - $30",
            "Premium Grooming - $50",
            "Deluxe Grooming - $70",
            "Bath Only - $20",
            "Nail Trimming - $15"
        )

        for (service in services) {
            popupMenu.menu.add(service)
        }

        popupMenu.setOnMenuItemClickListener { menuItem ->
            binding.tvService.text = menuItem.title
            true
        }

        popupMenu.show()
    }

    private fun showPaymentMenu(view: View) {
        val popupMenu = PopupMenu(this, view)
        val paymentMethods = arrayOf(
            "Credit Card",
            "Debit Card",
            "PayPal",
            "Cash on Appointment"
        )

        for (method in paymentMethods) {
            popupMenu.menu.add(method)
        }

        popupMenu.setOnMenuItemClickListener { menuItem ->
            binding.tvPayment.text = menuItem.title
            true
        }

        popupMenu.show()
    }

    private fun validateInputs(): Boolean {
        var isValid = true

        // Validate email
        if (binding.etEmail.text.toString().trim().isEmpty()) {
            binding.etEmail.error = "Email is required"
            isValid = false
        } else if (!android.util.Patterns.EMAIL_ADDRESS.matcher(binding.etEmail.text.toString().trim()).matches()) {
            binding.etEmail.error = "Invalid email format"
            isValid = false
        }

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
        if (binding.tvService.text.toString() == "Select service") {
            Toast.makeText(this, "Please select a grooming service", Toast.LENGTH_SHORT).show()
            isValid = false
        }

        // Validate payment method
        if (binding.tvPayment.text.toString() == "Select payment") {
            Toast.makeText(this, "Please select a payment method", Toast.LENGTH_SHORT).show()
            isValid = false
        }

        return isValid
    }
}
