package com.musterstadt.bean;

import javax.faces.bean.ManagedBean;
import javax.faces.bean.SessionScoped;
import javax.faces.context.FacesContext;
import javax.servlet.http.HttpSession;
import java.io.Serializable;

/**
 * Login backing bean — single hardcoded credential.
 * Session-scoped because the loggedIn flag must survive navigation.
 *
 * Security note: this is intentionally insecure for demo purposes.
 * Do not deploy to production.
 */
@ManagedBean(name = "loginBean")
@SessionScoped
public class LoginBean implements Serializable {

    private static final long serialVersionUID = 1L;

    private static final String VALID_USERNAME = "buerger";
    // ponytail: demo-only credential — replace with proper auth before production
    private static final String VALID_PASSWORD = "demo-password";
    // ponytail: single demo citizen — replace with citizen lookup when multi-user auth is added
    private static final long DEMO_CITIZEN_ID = 1L;

    private String username;
    private String password;
    private String errorMessage;
    private boolean loggedIn;
    private long citizenId;

    public String login() {
        if (VALID_USERNAME.equals(username) && VALID_PASSWORD.equals(password)) {
            loggedIn = true;
            citizenId = DEMO_CITIZEN_ID;
            errorMessage = null;
            HttpSession session = (HttpSession) FacesContext.getCurrentInstance()
                    .getExternalContext().getSession(true);
            session.setAttribute("loggedIn", Boolean.TRUE);
            session.setAttribute("loggedInUser", username);
            session.setAttribute("citizenId", citizenId);
            return "dashboard";
        }
        loggedIn = false;
        errorMessage = "Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.";
        return "loginFailed";
    }

    public String logout() {
        loggedIn = false;
        FacesContext.getCurrentInstance().getExternalContext().invalidateSession();
        return "logout";
    }

    // Getters / setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public boolean isLoggedIn() { return loggedIn; }
    public void setLoggedIn(boolean loggedIn) { this.loggedIn = loggedIn; }

    public long getCitizenId() { return citizenId; }
    public void setCitizenId(long citizenId) { this.citizenId = citizenId; }
}
