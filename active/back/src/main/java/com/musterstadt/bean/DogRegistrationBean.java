package com.musterstadt.bean;

import com.musterstadt.model.DogRegistration;
import com.musterstadt.service.DogRegistrationService;

import javax.ejb.EJB;
import javax.faces.application.FacesMessage;
import javax.faces.bean.ManagedBean;
import javax.faces.bean.ManagedProperty;
import javax.faces.bean.RequestScoped;
import javax.faces.context.FacesContext;
import java.io.Serializable;
import java.util.List;

/**
 * Dog registration backing bean.
 * View-scoped — search results survive within the same page but reset on navigation.
 *
 * TODO: Add environmental permit support for listed breeds (e.g. Kampfhunde per Gemeindeordnung)
 */
@ManagedBean(name = "dogRegistrationBean")
@RequestScoped
public class DogRegistrationBean implements Serializable {

    private static final long serialVersionUID = 1L;

    @ManagedProperty(value = "#{loginBean}")
    private LoginBean loginBean;

    @EJB
    private DogRegistrationService dogRegistrationService;

    // Registration form fields
    private String dogName;
    private String breed;
    private String chipNumber;
    private String successMessage;
    private String errorMessage;

    // Search
    private String searchQuery;
    private List<DogRegistration> results;

    public String registerDog() {
        if (dogName == null || dogName.trim().isEmpty()) {
            errorMessage = "Hundename darf nicht leer sein.";
            FacesContext.getCurrentInstance().addMessage(null,
                    new FacesMessage(FacesMessage.SEVERITY_ERROR, errorMessage, errorMessage));
            return null;
        }

        try {
            DogRegistration reg = dogRegistrationService.register(loginBean.getCitizenId(), dogName, breed, chipNumber);
            successMessage = "Hund erfolgreich angemeldet. Registrierungsnummer: " + reg.getId();
            errorMessage = null;
            dogName = null;
            breed = null;
            chipNumber = null;
            search(); // refresh list
            return "dogSuccess";
        } catch (Exception e) {
            errorMessage = "Fehler bei der Hundeanmeldung: " + e.getMessage();
            FacesContext.getCurrentInstance().addMessage(null,
                    new FacesMessage(FacesMessage.SEVERITY_ERROR, errorMessage, errorMessage));
            return null;
        }
    }

    public void search() {
        results = dogRegistrationService.search(loginBean.getCitizenId(), searchQuery);
    }

    public void clearSearch() {
        searchQuery = null;
        results = dogRegistrationService.getAllRegistrations(loginBean.getCitizenId());
    }

    public List<DogRegistration> getResults() {
        if (results == null) {
            results = dogRegistrationService.getAllRegistrations(loginBean.getCitizenId());
        }
        return results;
    }

    // Required by JSF for @ManagedProperty injection
    public void setLoginBean(LoginBean loginBean) { this.loginBean = loginBean; }

    // Getters / setters
    public String getDogName() { return dogName; }
    public void setDogName(String dogName) { this.dogName = dogName; }

    public String getBreed() { return breed; }
    public void setBreed(String breed) { this.breed = breed; }

    public String getChipNumber() { return chipNumber; }
    public void setChipNumber(String chipNumber) { this.chipNumber = chipNumber; }

    public String getSuccessMessage() { return successMessage; }
    public void setSuccessMessage(String successMessage) { this.successMessage = successMessage; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public String getSearchQuery() { return searchQuery; }
    public void setSearchQuery(String searchQuery) { this.searchQuery = searchQuery; }

    public void setResults(List<DogRegistration> results) { this.results = results; }
}
