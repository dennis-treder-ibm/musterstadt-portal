package com.musterstadt.model;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "CITIZEN")
public class Citizen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "FIRST_NAME", nullable = false, length = 100)
    private String firstName;

    @Column(name = "LAST_NAME", nullable = false, length = 100)
    private String lastName;

    @Column(name = "STREET", length = 200)
    private String street;

    @Column(name = "HOUSE_NUMBER", length = 20)
    private String houseNumber;

    @Column(name = "POSTCODE", length = 10)
    private String postcode;

    @Column(name = "CITY", length = 100)
    private String city;

    @Column(name = "EMAIL", length = 200)
    private String email;

    @Column(name = "PHONE", length = 50)
    private String phone;

    @Temporal(TemporalType.DATE)
    @Column(name = "REGISTERED_DATE")
    private Date registeredDate;

    // Default constructor required by JPA
    public Citizen() {
    }

    public Citizen(String firstName, String lastName, String street, String houseNumber,
                   String postcode, String city, String email, String phone, Date registeredDate) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.street = street;
        this.houseNumber = houseNumber;
        this.postcode = postcode;
        this.city = city;
        this.email = email;
        this.phone = phone;
        this.registeredDate = registeredDate;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }

    public String getHouseNumber() { return houseNumber; }
    public void setHouseNumber(String houseNumber) { this.houseNumber = houseNumber; }

    public String getPostcode() { return postcode; }
    public void setPostcode(String postcode) { this.postcode = postcode; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Date getRegisteredDate() { return registeredDate; }
    public void setRegisteredDate(Date registeredDate) { this.registeredDate = registeredDate; }

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
