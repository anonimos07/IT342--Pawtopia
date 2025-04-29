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
import com.example.pawtopia.fragments.ProfileFragment
import com.example.pawtopia.fragments.ServicesFragment
import com.example.pawtopia.util.SessionManager

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)

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
                        true
                    } else {
                        LoginRequiredActivity.start(this)
                        false
                    }
                }
                else -> false
            }
        }

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
            if (sessionManager.isLoggedIn()) {
                CartActivity.start(this)
            } else {
                LoginRequiredActivity.startForCart(this)
            }
        }

        binding.btnLogin.setOnClickListener {
            if (sessionManager.isLoggedIn()) {
                loadFragment(ProfileFragment())
            } else {
                startActivity(Intent(this, LoginActivity::class.java))
            }
        }

        if (savedInstanceState == null) {
            binding.bottomNavigation.selectedItemId = R.id.nav_home
        }

        updateLoginButtonState()
    }

    override fun onResume() {
        super.onResume()
        updateLoginButtonState()
    }

    private fun updateLoginButtonState() {
        if (sessionManager.isLoggedIn()) {
            binding.btnLogin.text = "Profile"
        } else {
            binding.btnLogin.text = "Login"
        }
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
