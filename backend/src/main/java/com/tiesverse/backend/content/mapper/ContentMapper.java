package com.tiesverse.backend.content.mapper;

import com.tiesverse.backend.content.dto.response.ContentResponse;
import com.tiesverse.backend.content.entity.Content;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface ContentMapper {

    ContentMapper INSTANCE = Mappers.getMapper(ContentMapper.class);

    ContentResponse toResponse(Content content);
}
