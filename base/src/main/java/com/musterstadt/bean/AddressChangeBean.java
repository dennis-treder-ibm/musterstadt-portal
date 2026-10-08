package com.musterstadt.bean;

import com.musterstadt.model.Application;
import com.musterstadt.service.AddressChangeService;

import javax.ejb.EJB;
import javax.faces.application.FacesMessage;
import javax.faces.bean.ManagedBean;
import javax.faces.bean.ManagedProperty;
import javax.faces.bean.RequestScoped;
import javax.faces.context.FacesContext;
import java.io.Serializable;
import java.util.List;

/**
 * Address change backing bean.
 * Request-scoped — form re-initialises on every postback.
 * validateAndSubmit() does both validation AND the save — classic bean bloat.
 */
@ManagedBean(name = "addressChangeBean")
@RequestScoped
public class AddressChangeBean implements Serializable {

    private static final long serialVersionUID = 1L;

    @ManagedProperty(value = "#{loginBean}")
    private LoginBean loginBean;

    @EJB
    private AddressChangeService addressChangeService;

    private String street;
    private String houseNumber;
    private String postcode;
    private String city;
    private String successMessage;
    private String errorMessage;

    /**
     * Validates the form and submits the address change.
     * Does both things because "it's simpler that way" — intentional anti-pattern.
     */
    public String validateAndSubmit() {
        // Inline validation — same logic as in the service, duplicated
        if (street == null || street.trim().isEmpty()) {
            errorMessage = "Straße darf nicht leer sein.";
            FacesContext.getCurrentInstance().addMessage("addressForm:street",
                    new FacesMessage(FacesMessage.SEVERITY_ERROR, errorMessage, errorMessage));
            return null;
        }

        if (postcode == null || postcode.length() != 5) {
            errorMessage = "Postleitzahl ungültig";
            FacesContext.getCurrentInstance().addMessage("addressForm:postcode",
                    new FacesMessage(FacesMessage.SEVERITY_ERROR, errorMessage, errorMessage));
            return null;
        }

        if (city == null || city.trim().isEmpty()) {
            errorMessage = "Ort darf nicht leer sein.";
            FacesContext.getCurrentInstance().addMessage("addressForm:city",
                    new FacesMessage(FacesMessage.SEVERITY_ERROR, errorMessage, errorMessage));
            return null;
        }

        return submitChange();
    }

    public String submitChange() {
        try {
            Application app = addressChangeService.submitChange(
                    loginBean.getCitizenId(), street, houseNumber, postcode, city);
            successMessage = "Ihre Adressänderung wurde erfolgreich beantragt. Antragsnummer: "
                    + app.getId();
            errorMessage = null;
            return "addressSuccess";
        } catch (IllegalArgumentException e) {
            errorMessage = e.getMessage();
            FacesContext.getCurrentInstance().addMessage(null,
                    new FacesMessage(FacesMessage.SEVERITY_ERROR, errorMessage, errorMessage));
            return null;
        }
    }

    public List<Application> getAllApplications() {
        return addressChangeService.getAllAddressApplications(loginBean.getCitizenId());
    }

    // Required by JSF for @ManagedProperty injection
    public void setLoginBean(LoginBean loginBean) { this.loginBean = loginBean; }

    // Getters / setters
    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }

    public String getHouseNumber() { return houseNumber; }
    public void setHouseNumber(String houseNumber) { this.houseNumber = houseNumber; }

    public String getPostcode() { return postcode; }
    public void setPostcode(String postcode) { this.postcode = postcode; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getSuccessMessage() { return successMessage; }
    public void setSuccessMessage(String successMessage) { this.successMessage = successMessage; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
}
