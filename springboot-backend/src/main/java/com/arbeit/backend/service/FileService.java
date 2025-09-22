package com.arbeit.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class FileService {

    @Value("${app.upload.resume-dir}")
    private String resumeDir;

    public FileService() {
        // Default constructor
    }

    public String saveResumeToFileSystem(MultipartFile file, String userId) throws IOException {
        // Create directory if it doesn't exist
        Path uploadPath = Paths.get(resumeDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String fileName = userId + "_resume_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);

        // Save file
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return fileName;
    }

    public byte[] downloadResumeFromFileSystem(String fileName) throws IOException {
        Path filePath = Paths.get(resumeDir, fileName);
        return Files.readAllBytes(filePath);
    }

    public void deleteResumeFromFileSystem(String fileName) {
        try {
            Path filePath = Paths.get(resumeDir, fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log error but don't throw
            System.err.println("Failed to delete file: " + e.getMessage());
        }
    }

    public boolean isValidResumeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return false;
        }

        String contentType = file.getContentType();
        if (contentType == null) {
            return false;
        }

        // Allow PDF, DOC, DOCX files
        return contentType.equals("application/pdf") ||
               contentType.equals("application/msword") ||
               contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    }

    public boolean isFileSizeValid(MultipartFile file, long maxSizeInMB) {
        if (file == null) {
            return false;
        }
        long maxSizeInBytes = maxSizeInMB * 1024 * 1024;
        return file.getSize() <= maxSizeInBytes;
    }
}
