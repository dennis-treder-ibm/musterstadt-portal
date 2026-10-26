package com.musterstadt.model;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "DOG_REGISTRATION")
public class DogRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CITIZEN_ID", nullable = false)
    private Citizen citizen;

    @Column(name = "DOG_NAME", nullable = false, length = 100)
    private String dogName;

    @Column(name = "BREED", length = 100)
    private String breed;

    @Temporal(TemporalType.DATE)
    @Column(name = "REGISTRATION_DATE", nullable = false)
    private Date registrationDate;

    @Column(name = "CHIP_NUMBER", length = 50)
    private String chipNumber;

    // Default constructor required by JPA
    public DogRegistration() {
    }

    public DogRegistration(Citizen citizen, String dogName, String breed,
                           Date registrationDate, String chipNumber) {
        this.citizen = citizen;
        this.dogName = dogName;
        this.breed = breed;
        this.registrationDate = registrationDate;
        this.chipNumber = chipNumber;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Citizen getCitizen() { return citizen; }
    public void setCitizen(Citizen citizen) { this.citizen = citizen; }

    public String getDogName() { return dogName; }
    public void setDogName(String dogName) { this.dogName = dogName; }

    public String getBreed() { return breed; }
    public void setBreed(String breed) { this.breed = breed; }

    public Date getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(Date registrationDate) { this.registrationDate = registrationDate; }

    public String getChipNumber() { return chipNumber; }
    public void setChipNumber(String chipNumber) { this.chipNumber = chipNumber; }
}
