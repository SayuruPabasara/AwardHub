package com.awardhub.user.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Nominee subtype — users who create profiles and submit nominations.
 * Contains extended profile fields: NIC/passport, demographics, professional info.
 */
@Entity
@Table(name = "nominees")
@DiscriminatorValue("NOMINEE")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Nominee extends User {

    @Column(unique = true)
    private String nicPassport;

    private String dateOfBirth;
    private String gender;

    // Composite address fields
    private String street;
    private String city;
    private String state;
    private String zip;

    private String organization;
    private String jobTitle;

    @Column(columnDefinition = "TEXT")
    private String biography;

    // Multivalued fields stored as delimited text (or normalized in a later phase)
    @Column(columnDefinition = "TEXT")
    private String education;

    @Column(columnDefinition = "TEXT")
    private String achievements;

    @Column(name = "nominee_references", columnDefinition = "TEXT")
    private String references;
}
