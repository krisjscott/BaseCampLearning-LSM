package com.tiesverse.backend.auth.mapper;

import com.tiesverse.backend.auth.dto.response.AuthResponse;
import com.tiesverse.backend.auth.entity.Account;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper
public interface AuthMapper {

    AuthMapper INSTANCE = Mappers.getMapper(AuthMapper.class);

    @Mapping(target = "accessToken", source = "accessToken")
    @Mapping(target = "refreshToken", source = "refreshToken")
    @Mapping(target = "email", source = "account.email")
    @Mapping(target = "role", source = "account.role")
    @Mapping(target = "fullName", source = "fullName")
    AuthResponse toAuthResponse(Account account, String accessToken, String refreshToken, String fullName);
}
