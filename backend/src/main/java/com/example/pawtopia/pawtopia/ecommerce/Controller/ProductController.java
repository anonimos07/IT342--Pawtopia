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

    @PostMapping("/postProduct")
    public Product postProductRecord(@RequestBody Product product) {
        System.out.println("Received product data: " + product);
        return pserv.postProductRecord(product);
    }

    @GetMapping("/getProduct")
    public List<Product> getAllProduct(){
        return pserv.getAllProduct();
    }

    @GetMapping("/getProduct/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable("id") int productID) {
        Product product = pserv.getProductById(productID);
        if (product != null) {
            return ResponseEntity.ok(product);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }


    @PutMapping("/putProduct/{id}")
    public Product updateProduct(@PathVariable int id, @RequestBody Product productRecord) {
        return pserv.updateProduct(id,productRecord);
    }


    @DeleteMapping("/deleteProduct/{id}")
    public String deleteProduct(@PathVariable int id) {
        return pserv.deleteProduct(id);
    }

    @GetMapping("/getTotalQuantitySold")
    public int getTotalQuantitySold() {
        return pserv.calculateTotalQuantitySold();
    }

}
