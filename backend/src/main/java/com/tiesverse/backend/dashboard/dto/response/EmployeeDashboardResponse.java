package com.tiesverse.backend.dashboard.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class EmployeeDashboardResponse {

    private List<AssignedModuleItem> assignedModules;
    private List<ComplianceTrainingItem> complianceTraining;
    private TeamProgressItem teamProgress;
    private List<InternalCertificationItem> internalCertifications;

    @Data
    @Builder
    public static class AssignedModuleItem {
        private UUID courseId;
        private String courseTitle;
        private LocalDate dueDate;
        private Double completionPercentage;
    }

    @Data
    @Builder
    public static class ComplianceTrainingItem {
        private UUID courseId;
        private String courseTitle;
        private LocalDate dueDate;
        private boolean completed;
    }

    @Data
    @Builder
    public static class TeamProgressItem {
        private Integer totalMembers;
        private Double averageCompletion;
        private Integer coursesCompleted;
    }

    @Data
    @Builder
    public static class InternalCertificationItem {
        private UUID certificateId;
        private String certificateTitle;
        private String courseName;
        private LocalDate issuedDate;
    }
}
