package com.arbeit.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.multipart.MultipartResolver;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;

import java.io.File;
import java.nio.file.Paths;

@Configuration
public class FileUploadConfig {

    @Value("${app.upload.resume-dir}")
    private String resumeDir;

    @Bean
    public MultipartResolver multipartResolver() {
        return new StandardServletMultipartResolver();
    }

    @Bean
    public String resumeUploadDirectory() {
        File directory = Paths.get(resumeDir).toFile();
        if (!directory.exists()) {
            directory.mkdirs();
        }
        return resumeDir;
    }
}
