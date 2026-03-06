package com.medicareplus.DTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LabAnalysisDTO {
    private Long id;
    private String patientName;
    private String testName;
    private int progress;
    private String startedTime;
    private String instrument;
}
