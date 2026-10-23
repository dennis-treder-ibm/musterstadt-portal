package com.musterstadt.rest.dto;

/**
 * Response DTO for GET /api/dashboard/summary
 */
public class DashboardSummaryResponse {
    public long parkingPermitCount;
    public long dogRegistrationCount;
    public long openApplicationCount;
    public long totalApplicationCount;
    public long approvedCount;
    public long rejectedCount;
    public long parkingApplicationCount;
    public long addressApplicationCount;
    public java.util.List<RecentActivityItem> recentActivity;

    public static class RecentActivityItem {
        public Long id;
        public String type;
        public String typeDisplay;
        public String status;
        public String statusDisplay;
        public java.util.Date createdDate;
        public java.util.Date lastUpdated;
        public String notes;

        public RecentActivityItem(Long id, String type, String typeDisplay, String status,
                                  String statusDisplay, java.util.Date createdDate,
                                  java.util.Date lastUpdated, String notes) {
            this.id = id;
            this.type = type;
            this.typeDisplay = typeDisplay;
            this.status = status;
            this.statusDisplay = statusDisplay;
            this.createdDate = createdDate;
            this.lastUpdated = lastUpdated;
            this.notes = notes;
        }
    }
}
