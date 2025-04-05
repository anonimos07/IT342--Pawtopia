package com.example.pawtopia.pawtopia.ecommerce.Entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
@Entity
@Table(name= "admin")
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long adminId;
    private String username;
    private String password;
    private String role;

    public Admin(String username, String password, String role){
        this.username = username;
        this.password = password;
        this.role = role;
    }

    public Admin(){

    }
}
