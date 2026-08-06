package com.tiesverse.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.storage.root:./uploads}")
    private String storageRoot;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = "file:" + Paths.get(storageRoot).toAbsolutePath().normalize() + "/";
        registry.addResourceHandler("/uploads/**").addResourceLocations(location);
    }
}
