package com.tiesverse.backend.common.storage;

import com.tiesverse.backend.common.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

/**
 * Local-disk file storage, serving as the stand-in for object storage (S3 in
 * the target architecture) since no cloud bucket is provisioned for this
 * deployment. Files are stored under {@code app.storage.root} and served
 * publicly via the resource handler registered in {@link com.tiesverse.backend.config.WebConfig}.
 */
@Service
public class FileStorageService {

    // Blocked regardless of caller: these execute if opened directly from the
    // /uploads/** static origin, turning an upload endpoint into stored XSS.
    private static final Set<String> BLOCKED_EXTENSIONS = Set.of(
            "html", "htm", "svg", "js", "mjs", "jsp", "php", "exe", "sh", "bat", "cmd", "com", "msi");

    @Value("${app.storage.root:./uploads}")
    private String storageRoot;

    public String store(MultipartFile file, String subDirectory) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No file was uploaded");
        }
        String extension = extensionOf(file.getOriginalFilename());
        if (BLOCKED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Files of type ." + extension + " are not allowed");
        }
        String filename = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);
        try {
            Path targetDir = Paths.get(storageRoot, subDirectory);
            Files.createDirectories(targetDir);
            Path targetFile = targetDir.resolve(filename);
            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new BadRequestException("Could not store uploaded file: " + e.getMessage());
        }
        return "/uploads/" + subDirectory + "/" + filename;
    }

    public String storeText(String content, String subDirectory, String filename) {
        try {
            Path targetDir = Paths.get(storageRoot, subDirectory);
            Files.createDirectories(targetDir);
            Path targetFile = targetDir.resolve(filename);
            Files.writeString(targetFile, content);
        } catch (IOException e) {
            throw new BadRequestException("Could not store file: " + e.getMessage());
        }
        return "/uploads/" + subDirectory + "/" + filename;
    }

    public static String extensionOf(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        if (dot < 0 || dot == filename.length() - 1) return "";
        String extension = filename.substring(dot + 1).toLowerCase();
        // Reject anything but plain alphanumerics so a crafted filename can't
        // smuggle a path separator (or "..") into the stored file's name.
        return extension.matches("[a-z0-9]{1,10}") ? extension : "";
    }
}
