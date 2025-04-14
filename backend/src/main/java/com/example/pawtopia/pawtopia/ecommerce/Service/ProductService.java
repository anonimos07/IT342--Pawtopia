package com.example.pawtopia.pawtopia.ecommerce.Service;

import com.example.pawtopia.pawtopia.ecommerce.Entity.Product;
import com.example.pawtopia.pawtopia.ecommerce.Repository.ProductRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class ProductService {
    @Autowired

    ProductRepo prepo;

    public Product postProductRecord(Product product) {
        return prepo.save(product);
    }

    public List<Product> getAllProduct() {
        return prepo.findAll();
    }

    public Product getProductById(int productID) {
        return prepo.findById(productID).orElse(null);
    }


    public Product updateProduct(int id, Product productRecord) {
        Product existingProduct = prepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Product with id " + id + " not found."));

        existingProduct.setProductName(productRecord.getProductName());
        existingProduct.setProductPrice(productRecord.getProductPrice());
        existingProduct.setDescription(productRecord.getDescription());
        existingProduct.setProductType(productRecord.getProductType());
        existingProduct.setQuantity(productRecord.getQuantity());

        if (productRecord.getProductImage() != null) {
            existingProduct.setProductImage(productRecord.getProductImage());
        }

        return prepo.save(existingProduct);
    }

    public String deleteProduct(int id) {
        String msg;
        if (prepo.existsById(id)) {
            prepo.deleteById(id);
            msg = "Product record successfully deleted.";
        } else {
            msg = "Product with id " + id + " not found.";
        }
        return msg;
    }

    public int calculateTotalQuantitySold() {
        // Fetch all products
        List<Product> products = prepo.findAll();

        // Calculate total quantitySold
        int totalQuantitySold = 0;
        for (Product product : products) {
            totalQuantitySold += product.getQuantitySold();
        }

        return totalQuantitySold;
    }
}