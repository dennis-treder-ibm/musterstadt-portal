package com.musterstadt.bean;

import com.musterstadt.dao.ApplicationDao;
import com.musterstadt.dao.DogRegistrationDao;
import com.musterstadt.dao.ParkingPermitDao;
import com.musterstadt.model.Application;
import com.musterstadt.model.Application.ApplicationStatus;
import com.musterstadt.model.Application.ApplicationType;

import javax.ejb.EJB;
import javax.faces.bean.ManagedBean;
import javax.faces.bean.ManagedProperty;
import javax.faces.bean.RequestScoped;
import java.io.Serializable;
import java.util.List;

/**
 * Dashboard backing bean — loads summary statistics scoped to the logged-in citizen.
 * Request-scoped: reloads from DB on every page hit.
 *
 * TODO: Implement flood assistance statistics (see Hochwasserhilfe page)
 */
@ManagedBean(name = "dashboardBean")
@RequestScoped
public class DashboardBean implements Serializable {

    private static final long serialVersionUID = 1L;

    @ManagedProperty(value = "#{loginBean}")
    private LoginBean loginBean;

    @EJB
    private ApplicationDao applicationDao;

    @EJB
    private ParkingPermitDao parkingPermitDao;

    @EJB
    private DogRegistrationDao dogRegistrationDao;

    public long getParkingPermitCount() {
        return parkingPermitDao.countByCitizenId(loginBean.getCitizenId());
    }

    public long getDogRegistrationCount() {
        return dogRegistrationDao.countByCitizenId(loginBean.getCitizenId());
    }

    public long getOpenApplicationCount() {
        return applicationDao.countByCitizenAndStatus(loginBean.getCitizenId(), ApplicationStatus.PENDING);
    }

    public long getTotalApplicationCount() {
        return applicationDao.findByCitizenId(loginBean.getCitizenId()).size();
    }

    public long getApprovedCount() {
        return applicationDao.countByCitizenAndStatus(loginBean.getCitizenId(), ApplicationStatus.APPROVED);
    }

    public long getRejectedCount() {
        return applicationDao.countByCitizenAndStatus(loginBean.getCitizenId(), ApplicationStatus.REJECTED);
    }

    public List<Application> getRecentActivity() {
        return applicationDao.findRecentApplicationsByCitizen(loginBean.getCitizenId(), 10);
    }

    public long getParkingApplicationCount() {
        return applicationDao.countByCitizenAndType(loginBean.getCitizenId(), ApplicationType.PARKING);
    }

    public long getAddressApplicationCount() {
        return applicationDao.countByCitizenAndType(loginBean.getCitizenId(), ApplicationType.ADDRESS);
    }

    // Required by JSF for @ManagedProperty injection
    public void setLoginBean(LoginBean loginBean) { this.loginBean = loginBean; }
}
