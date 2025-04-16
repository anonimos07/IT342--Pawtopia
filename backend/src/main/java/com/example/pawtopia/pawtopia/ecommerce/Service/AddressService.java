package com.example.pawtopia.pawtopia.ecommerce.Service;

import com.example.pawtopia.pawtopia.ecommerce.Entity.Address;
import com.example.pawtopia.pawtopia.ecommerce.Entity.User;
import com.example.pawtopia.pawtopia.ecommerce.Repository.AddressRepo;
import com.example.pawtopia.pawtopia.ecommerce.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AddressService {
    @Autowired
    private AddressRepo addressRepo;

    @Autowired
    private UserRepo userRepo;

    // Add or update the address for a user
    public Address addOrUpdateAddressForUser(Long userId, Address address) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        // If user already has an address, update it
        Address existingAddress = user.getAddress();
        if (existingAddress != null) {
            existingAddress.setRegion(address.getRegion());
            existingAddress.setProvince(address.getProvince());
            existingAddress.setCity(address.getCity());
            existingAddress.setBarangay(address.getBarangay());
            existingAddress.setPostalCode(address.getPostalCode());
            existingAddress.setStreetBuildingHouseNo(address.getStreetBuildingHouseNo());
            return addressRepo.save(existingAddress);
        }

        // Otherwise, create a new address and associate it with the user
        address.setUser(user);
        user.setAddress(address);
        userRepo.save(user); // Cascade ensures address is saved
        return address;
    }

    // Get the address for a user
    public Address getAddressByUserId(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        return user.getAddress();
    }

    // Delete the address for a user
    public void deleteAddressForUser(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        Address address = user.getAddress();
        if (address != null) {
            user.setAddress(null); // Unlink the address from the user
            userRepo.save(user); // Save changes to the user
            addressRepo.delete(address); // Delete the address
        }
    }

    // Get all addresses from every user
    public List<Address> getAllAddress() {
        return addressRepo.findAll();
    }
}
