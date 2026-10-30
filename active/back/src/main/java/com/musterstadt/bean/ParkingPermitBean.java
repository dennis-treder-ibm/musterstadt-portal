package com.musterstadt.bean;

import com.musterstadt.model.Application;
import com.musterstadt.model.Application.ApplicationStatus;
import com.musterstadt.model.ParkingPermit;
import com.musterstadt.service.ParkingPermitService;

import javax.ejb.EJB;
import javax.faces.application.FacesMessage;
import javax.faces.bean.ManagedBean;
import javax.faces.bean.ManagedProperty;
import javax.faces.bean.SessionScoped;
import javax.faces.context.FacesContext;
import java.io.Serializable;
import java.util.List;

/**
 * Parking permit backing bean.
 * SESSION-SCOPED — intentional legacy problem: if you open two tabs, form state bleeds.
 *
 * TODO: Support mobile users — form is completely unusable below 960px
 * TODO: Replace JSF wizard with modern multi-step flow (e.g. React form wizard)
 */
@ManagedBean(name = "parkingPermitBean")
@SessionScoped
public class ParkingPermitBean implements Serializable {

    private static final long serialVersionUID = 1L;

    @ManagedProperty(value = "#{loginBean}")
    private LoginBean loginBean;

    @EJB
    private ParkingPermitService parkingPermitService;

    // Form fields
    private String vehicleRegistration;
    private String zone;
    private String proofDocumentPath;
    private String successMessage;
    private String errorMessage;

    // Loaded application after submit
    private Application currentApplication;
    private ParkingPermit currentPermit;

    public String submitApplication() {
        // Inline validation — business logic leaking into the bean (deliberate anti-pattern)
        if (vehicleRegistration == null || vehicleRegistration.trim().length() < 5) {
            errorMessage = "Fahrzeugkennzeichen muss mindestens 5 Zeichen lang sein.";
            FacesContext.getCurrentInstance().addMessage(null,
                    new FacesMessage(FacesMessage.SEVERITY_ERROR, errorMessage, errorMessage));
            return null;
        }

        if (zone == null || zone.trim().isEmpty()) {
            errorMessage = "Bitte wählen Sie eine Parkzone aus.";
            FacesContext.getCurrentInstance().addMessage(null,
                    new FacesMessage(FacesMessage.SEVERITY_ERROR, errorMessage, errorMessage));
            return null;
        }

        try {
            currentApplication = parkingPermitService.createApplication(
                    loginBean.getCitizenId(), vehicleRegistration, zone, proofDocumentPath);
            currentPermit = parkingPermitService.getPermitForApplication(currentApplication.getId());
            successMessage = "Ihr Parkausweis-Antrag wurde erfolgreich eingereicht. Antragsnummer: "
                    + currentApplication.getId();
            errorMessage = null;
            return "parkingSuccess";
        } catch (Exception e) {
            errorMessage = "Fehler beim Einreichen des Antrags: " + e.getMessage();
            FacesContext.getCurrentInstance().addMessage(null,
                    new FacesMessage(FacesMessage.SEVERITY_ERROR, errorMessage, errorMessage));
            return null;
        }
    }

    public void loadApplication() {
        // TODO: Load by application ID from request param — currently always loads demo citizen
        if (currentApplication != null) {
            currentPermit = parkingPermitService.getPermitForApplication(currentApplication.getId());
        }
    }

    public void clearForm() {
        vehicleRegistration = null;
        zone = null;
        proofDocumentPath = null;
        successMessage = null;
        errorMessage = null;
        currentApplication = null;
        currentPermit = null;
    }

    public List<String> getAvailableZones() {
        return parkingPermitService.getZones();
    }

    public List<Application> getAllApplications() {
        return parkingPermitService.getAllParkingApplications(loginBean.getCitizenId());
    }

    public String getStatusStyleClass(ApplicationStatus status) {
        if (status == null) return "";
        switch (status) {
            case APPROVED: return "status-approved";
            case REJECTED: return "status-rejected";
            case PENDING:  return "status-pending";
            default:       return "";
        }
    }

    // Required by JSF for @ManagedProperty injection
    public void setLoginBean(LoginBean loginBean) { this.loginBean = loginBean; }

    // Getters / setters
    public String getVehicleRegistration() { return vehicleRegistration; }
    public void setVehicleRegistration(String vehicleRegistration) {
        this.vehicleRegistration = vehicleRegistration;
    }

    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }

    public String getProofDocumentPath() { return proofDocumentPath; }
    public void setProofDocumentPath(String proofDocumentPath) {
        this.proofDocumentPath = proofDocumentPath;
    }

    public String getSuccessMessage() { return successMessage; }
    public void setSuccessMessage(String successMessage) { this.successMessage = successMessage; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public Application getCurrentApplication() { return currentApplication; }
    public void setCurrentApplication(Application currentApplication) {
        this.currentApplication = currentApplication;
    }

    public ParkingPermit getCurrentPermit() { return currentPermit; }
    public void setCurrentPermit(ParkingPermit currentPermit) { this.currentPermit = currentPermit; }
}
