package com.example.pawtopia

import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.example.pawtopia.databinding.ActivityLoginRequiredBinding

class LoginRequiredActivity : AppCompatActivity() {
    private lateinit var binding: ActivityLoginRequiredBinding

    companion object {
        const val EXTRA_REDIRECT_ACTION = "redirect_action"
        private const val ACTION_CART = "cart"
        private const val ACTION_BOOK_SERVICE = "book_service"
        private const val ACTION_ADD_TO_CART = "add_to_cart"

        fun start(context: Context, action: String = "") {
            val intent = Intent(context, LoginRequiredActivity::class.java)
            if (action.isNotEmpty()) {
                intent.putExtra(EXTRA_REDIRECT_ACTION, action)
            }
            context.startActivity(intent)
        }

        fun startForCart(context: Context) {
            start(context, ACTION_CART)
        }

        fun startForBooking(context: Context) {
            start(context, ACTION_BOOK_SERVICE)
        }

        fun startForAddToCart(context: Context) {
            start(context, ACTION_ADD_TO_CART)
        }

        fun startForBookAppointment(bookAppointmentActivity: BookAppointmentActivity) {

        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginRequiredBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val redirectAction = intent.getStringExtra(EXTRA_REDIRECT_ACTION) ?: ""

        // Set up login button
        binding.btnLogin.setOnClickListener {
            val intent = Intent(this, LoginActivity::class.java)
            if (redirectAction.isNotEmpty()) {
                intent.putExtra(EXTRA_REDIRECT_ACTION, redirectAction)
            }
            startActivity(intent)
            finish()
        }

        // Set up create account button
        binding.btnCreateAccount.setOnClickListener {
            val intent = Intent(this, SignupActivity::class.java)
            if (redirectAction.isNotEmpty()) {
                intent.putExtra(EXTRA_REDIRECT_ACTION, redirectAction)
            }
            startActivity(intent)
            finish()
        }
    }
}
