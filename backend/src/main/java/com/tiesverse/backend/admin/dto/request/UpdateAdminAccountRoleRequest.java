package com.tiesverse.backend.admin.dto.request;

import com.tiesverse.backend.common.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateAdminAccountRoleRequest {

    @NotNull(message = "Role is required")
    private Role role;
}
