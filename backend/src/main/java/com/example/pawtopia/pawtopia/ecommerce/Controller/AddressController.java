package com.example.pawtopia.pawtopia.ecommerce.Controller;

import com.example.pawtopia.pawtopia.ecommerce.Entity.Address;
import com.example.pawtopia.pawtopia.ecommerce.Service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/adresses")
public class AddressController {
    @Autowired
    private AddressService addressService;

    // Add or update an address for a user
    @PostMapping("/users/{userId}")
    public ResponseEntity<Address> addOrUpdateAddress(@PathVariable Long userId, @RequestBody Address address) {
        Address createdOrUpdatedAddress = addressService.addOrUpdateAddressForUser(userId, address);
        return new ResponseEntity<>(createdOrUpdatedAddress, HttpStatus.OK);
    }

    // Get the address for a user
    @GetMapping("/get-users/{userId}")
    public ResponseEntity<Address> getAddress(@PathVariable Long userId) {
        Address address = addressService.getAddressByUserId(userId);
        if (address != null) {
            return ResponseEntity.ok(address);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // Update an address for a user (alternative to POST)
    @PutMapping("/users/{userId}")
    public ResponseEntity<Address> updateAddress(@PathVariable Long userId, @RequestBody Address address) {
        Address updatedAddress = addressService.addOrUpdateAddressForUser(userId, address);
        return new ResponseEntity<>(updatedAddress, HttpStatus.OK);
    }

    // Get all addresses in the database regardless of user
    @GetMapping("/getAllAddress")
    public List<Address> getAllAddress(){
        return addressService.getAllAddress();
    }

    // Delete the address for a user
    @DeleteMapping("/del-users/{userId}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long userId) {
        addressService.deleteAddressForUser(userId);
        return ResponseEntity.noContent().build();
    }
}
