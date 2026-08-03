package com.tiesverse.backend.user.mapper;

import com.tiesverse.backend.user.dto.request.UpdateProfileRequest;
import com.tiesverse.backend.user.dto.response.UserActivityResponse;
import com.tiesverse.backend.user.dto.response.UserResponse;
import com.tiesverse.backend.user.entity.User;
import com.tiesverse.backend.user.entity.UserActivity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    @Mapping(target = "id", source = "user.id")
    @Mapping(target = "fullName", source = "user.fullName")
    @Mapping(target = "email", source = "email")
    @Mapping(target = "profilePictureUrl", source = "user.profilePictureUrl")
    @Mapping(target = "learnerCode", source = "user.learnerCode")
    @Mapping(target = "phone", source = "user.phone")
    @Mapping(target = "bio", source = "user.bio")
    @Mapping(target = "role", source = "role")
    @Mapping(target = "dateOfBirth", source = "user.dateOfBirth")
    @Mapping(target = "address", source = "user.address")
    UserResponse toUserResponse(User user, String email, String role);

    @Mapping(target = "id", source = "id")
    UserActivityResponse toUserActivityResponse(UserActivity activity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "accountId", ignore = true)
    @Mapping(target = "profilePictureUrl", ignore = true)
    @Mapping(target = "learnerCode", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateUserFromRequest(UpdateProfileRequest request, @MappingTarget User user);
}
