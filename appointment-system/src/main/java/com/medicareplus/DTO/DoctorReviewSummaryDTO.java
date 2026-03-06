package com.medicareplus.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorReviewSummaryDTO {
    private Integer doctorId;
    private Double averageRating;
    private long totalReviews;
}
