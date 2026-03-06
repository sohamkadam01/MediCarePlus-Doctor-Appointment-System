package com.medicareplus.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorPaymentAnalyticsDTO {

    private double totalRevenue;
    private double expectedRevenue;
    private double cancelledAmount;
    private double thisMonthRevenue;
    private double thisMonthAvgFee;
    private double onlineCompletedRevenue;
    private double clinicCompletedRevenue;
    private int collectionRate;

    private List<RevenuePointDTO> monthlyRevenue;
    private double monthlyPeak;

    private List<RevenuePointDTO> weeklyRevenue;
    private double weeklyPeak;
    private double weeklyTotalRevenue;
    private double weeklyAverageRevenue;

    private List<RecentPaymentDTO> recentPaid;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RevenuePointDTO {
        private String key;
        private String label;
        private double revenue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentPaymentDTO {
        private Long id;
        private String patientName;
        private String appointmentDate;
        private String appointmentTime;
        private String visitType;
        private double consultationFee;
        private String paymentMethod;
        private String paidAt;
    }
}

