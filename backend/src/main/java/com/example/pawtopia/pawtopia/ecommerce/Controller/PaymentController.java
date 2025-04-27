package com.example.pawtopia.pawtopia.ecommerce.Controller;

import com.example.pawtopia.pawtopia.ecommerce.Entity.Order;
import com.example.pawtopia.pawtopia.ecommerce.Service.OrderService;
import kong.unirest.HttpResponse;
import kong.unirest.Unirest;
import org.apache.commons.codec.binary.Base64;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private OrderService orderService;

    @Value("${PAYMONGO_SECRET}")
    private String paymongoSecretKey;

    @Value("${PAYMONGO_URL}")
    private String paymongoUrl;

    @PostMapping("/create-payment")
    public ResponseEntity<?> payOrder(@RequestBody Order order) {
        try {
            String secret = Base64.encodeBase64String((paymongoSecretKey + ":").getBytes());

            String bodyJson = "{ \"data\": { \"attributes\": { " +
                    "\"amount\": " + (int) (order.getTotalPrice() * 100) + "," +
                    "\"description\": \"" + order.getDescription() + "\"," +
                    "\"remarks\": \"" + order.getRemarks() + "\"," +
                    "\"redirect\": { " +
                    "\"success\": \"http://localhost:5173\"," +
                    "\"failed\": \"http://localhost:5173\"" +
                    " }" +
                    "} } }";

            HttpResponse<String> response = Unirest.post(paymongoUrl)
                    .header("Accept", "application/json")
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Basic " + secret)
                    .body(bodyJson)
                    .asString();

            if (response.getStatus() >= 200 && response.getStatus() < 300) {
                String responseBody = response.getBody();

                JSONObject jsonResponse = new JSONObject(responseBody);
                String checkoutUrl = jsonResponse
                        .getJSONObject("data")
                        .getJSONObject("attributes")
                        .getString("checkout_url");

                return ResponseEntity.ok(Map.of("checkoutUrl", checkoutUrl));

            } else {
                return ResponseEntity.status(response.getStatus())
                        .body("PayMongo API Error: " + response.getBody());
            }

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body("Internal Server Error: " + e.getMessage());
        }
    }


}
