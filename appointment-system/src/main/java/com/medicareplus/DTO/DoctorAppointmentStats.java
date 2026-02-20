// DoctorAppointmentStats.java
package com.medicareplus.DTO;

import lombok.Data;
import lombok.AllArgsConstructor;

@Data
@AllArgsConstructor
public class DoctorAppointmentStats {
    private long totalAppointments;
    private long todayAppointments;
    private long upcomingAppointments;
    private long completedAppointments;
    private double totalRevenue;
}