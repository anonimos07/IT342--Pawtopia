package com.example.pawtopia

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import com.example.pawtopia.databinding.ActivityMainBinding
import com.example.pawtopia.fragments.AboutFragment
import com.example.pawtopia.fragments.HomeFragment
import com.example.pawtopia.fragments.ProductsFragment
import com.example.pawtopia.fragments.ServicesFragment
import com.example.pawtopia.util.SessionManager

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Fix: Use inflate method directly from the binding class
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)

        // Set up bottom navigation
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
                else -> false
            }
        }

        // Set up top navigation icons
        binding.tvLogo.setOnClickListener {
            binding.bottomNavigation.selectedItemId = R.id.nav_home
        }

        binding.ivHome.setOnClickListener {
            binding.bottomNavigation.selectedItemId = R.id.nav_home
        }

        binding.ivProducts.setOnClickListener {
            binding.bottomNavigation.selectedItemId = R.id.nav_products
        }

        binding.ivServices.setOnClickListener {
            binding.bottomNavigation.selectedItemId = R.id.nav_services
        }

        binding.ivAbout.setOnClickListener {
            binding.bottomNavigation.selectedItemId = R.id.nav_about
        }

        binding.ivCart.setOnClickListener {
            // TODO: Navigate to cart
            Toast.makeText(this, "Cart functionality coming soon", Toast.LENGTH_SHORT).show()
        }

        binding.btnLogin.setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
        }

        // Set home as default fragment
        if (savedInstanceState == null) {
            binding.bottomNavigation.selectedItemId = R.id.nav_home
        }
    }

    private fun loadFragment(fragment: Fragment) {
        supportFragmentManager.beginTransaction()
            .replace(R.id.fragment_container, fragment)
            .commit()
    }
}
