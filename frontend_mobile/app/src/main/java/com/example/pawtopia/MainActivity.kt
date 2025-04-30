package com.example.pawtopia

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import com.example.pawtopia.databinding.ActivityMainBinding
import com.example.pawtopia.fragments.*
import com.example.pawtopia.util.SessionManager

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var sessionManager: SessionManager

    // Activity result launcher for login
    private val loginLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK) {
            updateProfileMenuItem()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)
        setupBottomNavigation()
        setupClickListeners()

        // Set default fragment if this is first launch
        if (savedInstanceState == null) {
            binding.bottomNavigation.selectedItemId = R.id.nav_home
        }
    }

    private fun setupBottomNavigation() {
        // Initialize the menu item state
        updateProfileMenuItem()

        binding.bottomNavigation.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_home -> {
                    loadFragment(HomeFragment())
                    true
                }
                R.id.nav_products -> {
                    loadFragment(ProductsFragment())
                    true
                }
                R.id.nav_services -> {
                    loadFragment(ServicesFragment())
                    true
                }
                R.id.nav_about -> {
                    loadFragment(AboutFragment())
                    true
                }
                R.id.nav_profile -> {
                    if (sessionManager.isLoggedIn()) {
                        loadFragment(ProfileFragment())
                    } else {
                        // Launch login activity using the launcher
                        loginLauncher.launch(Intent(this, LoginActivity::class.java))
                    }
                    true
                }
                else -> false
            }
        }
    }

    private fun setupClickListeners() {
        // Logo click takes you home
        binding.logoContainer.setOnClickListener {
            binding.bottomNavigation.selectedItemId = R.id.nav_home
        }

        // Cart icon click
        binding.ivCart.setOnClickListener {
            if (sessionManager.isLoggedIn()) {
                startActivity(Intent(this, CartActivity::class.java))
            } else {
                LoginRequiredActivity.startForCart(this)
            }
        }
    }

    private fun updateProfileMenuItem() {
        val menu = binding.bottomNavigation.menu
        val profileItem = menu.findItem(R.id.nav_profile)

        if (sessionManager.isLoggedIn()) {
            profileItem.title = "Profile"
            profileItem.icon = ContextCompat.getDrawable(this, R.drawable.ic_person_filled)
        } else {
            profileItem.title = "Login"
            profileItem.icon = ContextCompat.getDrawable(this, R.drawable.ic_login)
        }
    }

    override fun onResume() {
        super.onResume()
        // Update the profile/login menu item when returning to activity
        updateProfileMenuItem()
    }

    private fun loadFragment(fragment: Fragment) {
        supportFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, fragment)
            .commit()
    }

    fun checkLoginRequired(): Boolean {
        if (!sessionManager.isLoggedIn()) {
            LoginRequiredActivity.start(this)
            return true
        }
        return false
    }
}