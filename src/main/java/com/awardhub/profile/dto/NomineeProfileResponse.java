package com.awardhub.awardhub.profile.dto;

import com.awardhub.awardhub.user.entity.AccountStatus;
import com.awardhub.awardhub.user.entity.Nominee;

public class NomineeProfileResponse {

    private Long userId;
    private String email;
    private String contactNumber;
    private AccountStatus accountStatus;
    private String nicPassport;
    private String dateOfBirth;
    private String gender;
    private String street;
    private String city;
    private String state;
    private String zip;
    private String organization;
    private String jobTitle;
    private String biography;
    private String education;
    private String achievements;
    private String references;

    public NomineeProfileResponse() {}

    public static NomineeProfileResponse fromEntity(Nominee n) {
        NomineeProfileResponse dto = new NomineeProfileResponse();
        dto.setUserId(n.getUserID());
        dto.setEmail(n.getEmail());
        dto.setContactNumber(n.getContactNumber());
        dto.setAccountStatus(n.getAccountStatus());
        dto.setNicPassport(n.getNicPassport());
        dto.setDateOfBirth(n.getDateOfBirth());
        dto.setGender(n.getGender());
        dto.setStreet(n.getStreet());
        dto.setCity(n.getCity());
        dto.setState(n.getState());
        dto.setZip(n.getZip());
        dto.setOrganization(n.getOrganization());
        dto.setJobTitle(n.getJobTitle());
        dto.setBiography(n.getBiography());
        dto.setEducation(n.getEducation());
        dto.setAchievements(n.getAchievements());
        dto.setReferences(n.getReferences());
        return dto;
    }

    // Getters and Setters

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public AccountStatus getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(AccountStatus accountStatus) {
        this.accountStatus = accountStatus;
    }

    public String getNicPassport() {
        return nicPassport;
    }

    public void setNicPassport(String nicPassport) {
        this.nicPassport = nicPassport;
    }

    public String getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getZip() {
        return zip;
    }

    public void setZip(String zip) {
        this.zip = zip;
    }

    public String getOrganization() {
        return organization;
    }

    public void setOrganization(String organization) {
        this.organization = organization;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getBiography() {
        return biography;
    }

    public void setBiography(String biography) {
        this.biography = biography;
    }

    public String getEducation() {
        return education;
    }

    public void setEducation(String education) {
        this.education = education;
    }

    public String getAchievements() {
        return achievements;
    }

    public void setAchievements(String achievements) {
        this.achievements = achievements;
    }

    public String getReferences() {
        return references;
    }

    public void setReferences(String references) {
        this.references = references;
    }
}
