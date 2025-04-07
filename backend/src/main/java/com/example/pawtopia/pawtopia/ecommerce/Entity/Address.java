package com.example.pawtopia.pawtopia.ecommerce.Entity;


import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter @Setter
@Entity
@RequiredArgsConstructor
@Table(name = "address")
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long addressId;

    @Column(name = "region", nullable = false)
    private String region;

    @Column(name = "province", nullable = false)
    private String province;

    @Column(name = "city", nullable = false)
    private String city;

    @Column(name = "barangay", nullable = false)
    private String barangay;

    @Column(name = "postalCode", nullable = false)
    private String postalCode;

    @Column(name = "streetBuildingHouseNo", nullable = true)
    private String streetBuildingHouseNo;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference("user-address")
    private User user; // User that owns this address
}
