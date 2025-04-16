package com.example.pawtopia.pawtopia.ecommerce.Controller;

import com.example.pawtopia.pawtopia.ecommerce.Entity.Product;
import com.example.pawtopia.pawtopia.ecommerce.Service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product")
public class ProductController {
    @Autowired
    ProductService pserv;

    //create prod
    @PostMapping("/postProduct")
    public Product postProductRecord(@RequestBody Product product) {
        System.out.println("Received product data: " + product);
        return pserv.postProductRecord(product);
    }

    //fetch prod admin,user view
    @GetMapping("/getProduct")
    public List<Product> getAllProduct(){
        return pserv.getAllProduct();
    }

    //fetch id admin,user buy
    @GetMapping("/getProduct/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable("id") int productID) {
        Product product = pserv.getProductById(productID);
        if (product != null) {
            return ResponseEntity.ok(product);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    //update admin
    @PutMapping("/putProduct/{id}")
    public Product updateProduct(@PathVariable int id, @RequestBody Product productRecord) {
        return pserv.updateProduct(id,productRecord);
    }

    //admin
    @DeleteMapping("/deleteProduct/{id}")
    public String deleteProduct(@PathVariable int id) {
        return pserv.deleteProduct(id);
    }

    //admin
    @GetMapping("/getTotalQuantitySold")
    public int getTotalQuantitySold() {
        return pserv.calculateTotalQuantitySold();
    }

}
