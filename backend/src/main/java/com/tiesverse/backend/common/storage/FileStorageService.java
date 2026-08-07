package com.tiesverse.backend.common.storage;

import com.tiesverse.backend.common.exception.BadRequestException;
import com.tiesverse.backend.common.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

/**
 * Stores uploads in Cloudflare R2 when R2 credentials are configured. Local
 * storage remains available for development and as a read fallback while
 * existing media is migrated into R2.
 */
@Service
public class FileStorageService {

    // Allowlisted per subdirectory rather than a denylist of dangerous extensions: a
    // denylist has to enumerate every server-executable extension a future deployment
    // topology might interpret (.phtml, .jar, .aspx, .cgi, ...), and any one it misses
    // is a stored-RCE/XSS risk the moment /uploads/** is ever fronted by something that
    // executes files by extension. An allowlist of the file types each feature actually
    // needs has no such gap.
    private static final Set<String> VIDEO_EXTENSIONS = Set.of("mp4", "webm", "mov", "m4v", "ogv");
    private static final Set<String> DOCUMENT_EXTENSIONS = Set.of(
            "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt", "csv");
    private static final Set<String> SUBMISSION_EXTENSIONS = Set.of(
            "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt", "csv", "zip",
            "png", "jpg", "jpeg", "gif");
    private static final Set<String> CERTIFICATE_TEMPLATE_EXTENSIONS = Set.of("png", "jpg", "jpeg", "pdf");

    @Value("${app.storage.root:./uploads}")
    private String storageRoot;

    private final S3Client r2Client;
    private final String r2Bucket;

    public FileStorageService(
            @Value("${r2.endpoint:}") String r2Endpoint,
            @Value("${r2.bucket:}") String r2Bucket,
            @Value("${r2.access-key-id:}") String r2AccessKeyId,
            @Value("${r2.secret-access-key:}") String r2SecretAccessKey
    ) {
        this.r2Bucket = r2Bucket;
        this.r2Client = isR2Configured(r2Endpoint, r2Bucket, r2AccessKeyId, r2SecretAccessKey)
                ? S3Client.builder()
                        .endpointOverride(URI.create(r2Endpoint))
                        .credentialsProvider(StaticCredentialsProvider.create(
                                AwsBasicCredentials.create(r2AccessKeyId, r2SecretAccessKey)))
                        .region(Region.of("auto"))
                        .forcePathStyle(true)
                        .build()
                : null;
    }

    public String store(MultipartFile file, String subDirectory) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No file was uploaded");
        }
        String extension = extensionOf(file.getOriginalFilename());
        if (!allowedExtensionsFor(subDirectory).contains(extension)) {
            throw new BadRequestException("Files of type ." + extension + " are not allowed in " + subDirectory);
        }
        String filename = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);
        String key = objectKey(subDirectory, filename);
        try (InputStream inputStream = file.getInputStream()) {
            if (r2Client != null) {
                r2Client.putObject(PutObjectRequest.builder()
                                .bucket(r2Bucket)
                                .key(key)
                                .contentType(file.getContentType())
                                .build(),
                        RequestBody.fromInputStream(inputStream, file.getSize()));
            } else {
                storeLocally(inputStream, subDirectory, filename);
            }
        } catch (IOException e) {
            throw new BadRequestException("Could not store uploaded file: " + e.getMessage());
        }
        return "/uploads/" + subDirectory + "/" + filename;
    }

    public String storeText(String content, String subDirectory, String filename) {
        String key = objectKey(subDirectory, filename);
        byte[] bytes = content.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        try {
            if (r2Client != null) {
                r2Client.putObject(PutObjectRequest.builder()
                                .bucket(r2Bucket)
                                .key(key)
                                .contentType("text/vtt; charset=UTF-8")
                                .build(),
                        RequestBody.fromBytes(bytes));
            } else {
                Path targetFile = localPath(subDirectory, filename);
                Files.createDirectories(targetFile.getParent());
                Files.writeString(targetFile, content);
            }
        } catch (IOException e) {
            throw new BadRequestException("Could not store file: " + e.getMessage());
        }
        return "/uploads/" + subDirectory + "/" + filename;
    }

    public StoredFile load(String subDirectory, String filename) {
        String key = objectKey(subDirectory, filename);
        if (r2Client != null) {
            try {
                ResponseInputStream<GetObjectResponse> inputStream = r2Client.getObject(GetObjectRequest.builder()
                        .bucket(r2Bucket)
                        .key(key)
                        .build());
                GetObjectResponse response = inputStream.response();
                return new StoredFile(inputStream, response.contentType(), response.contentLength());
            } catch (S3Exception exception) {
                if (exception.statusCode() != 404) {
                    throw new BadRequestException("Could not load uploaded file from R2");
                }
            }
        }

        Path targetFile = localPath(subDirectory, filename);
        if (!Files.isRegularFile(targetFile)) {
            throw new ResourceNotFoundException("Uploaded file not found");
        }
        try {
            return new StoredFile(Files.newInputStream(targetFile), Files.probeContentType(targetFile), Files.size(targetFile));
        } catch (IOException exception) {
            throw new BadRequestException("Could not load uploaded file: " + exception.getMessage());
        }
    }

    public byte[] readAllBytes(String publicUrl) {
        StoragePath path = storagePath(publicUrl);
        if (r2Client != null) {
            try {
                ResponseBytes<GetObjectResponse> object = r2Client.getObjectAsBytes(GetObjectRequest.builder()
                        .bucket(r2Bucket)
                        .key(objectKey(path.subDirectory(), path.filename()))
                        .build());
                return object.asByteArray();
            } catch (S3Exception exception) {
                if (exception.statusCode() != 404) {
                    throw new BadRequestException("Could not load uploaded file from R2");
                }
            }
        }
        try {
            return Files.readAllBytes(localPath(path.subDirectory(), path.filename()));
        } catch (IOException exception) {
            throw new BadRequestException("Could not load uploaded file: " + exception.getMessage());
        }
    }

    private void storeLocally(InputStream inputStream, String subDirectory, String filename) throws IOException {
        Path targetFile = localPath(subDirectory, filename);
        Files.createDirectories(targetFile.getParent());
        Files.copy(inputStream, targetFile, StandardCopyOption.REPLACE_EXISTING);
    }

    private Path localPath(String subDirectory, String filename) {
        Path root = Paths.get(storageRoot).toAbsolutePath().normalize();
        Path target = root.resolve(subDirectory).resolve(filename).normalize();
        if (!target.startsWith(root)) {
            throw new BadRequestException("Invalid upload path");
        }
        return target;
    }

    private Set<String> allowedExtensionsFor(String subDirectory) {
        return switch (subDirectory) {
            case "videos" -> VIDEO_EXTENSIONS;
            case "documents" -> DOCUMENT_EXTENSIONS;
            case "submissions" -> SUBMISSION_EXTENSIONS;
            case "certificate-templates" -> CERTIFICATE_TEMPLATE_EXTENSIONS;
            default -> Set.of();
        };
    }

    private String objectKey(String subDirectory, String filename) {
        if (!Set.of("videos", "captions", "documents", "submissions", "certificate-templates").contains(subDirectory)
                || !filename.matches("[A-Za-z0-9][A-Za-z0-9._-]*") || filename.contains("..")) {
            throw new BadRequestException("Invalid upload path");
        }
        return subDirectory + "/" + filename;
    }

    private boolean isR2Configured(String endpoint, String bucket, String accessKeyId, String secretAccessKey) {
        return !endpoint.isBlank() && !bucket.isBlank() && !accessKeyId.isBlank() && !secretAccessKey.isBlank();
    }

    public record StoredFile(InputStream inputStream, String contentType, long contentLength) {
    }

    /** Resolves a public "/uploads/..." URL previously returned by {@link #store} back to its on-disk path. */
    public Path resolve(String publicUrl) {
        StoragePath path = storagePath(publicUrl);
        return localPath(path.subDirectory(), path.filename());
    }

    private StoragePath storagePath(String publicUrl) {
        if (publicUrl == null || !publicUrl.startsWith("/uploads/")) {
            throw new BadRequestException("Not a storage-managed file URL: " + publicUrl);
        }
        String[] parts = publicUrl.substring("/uploads/".length()).split("/", -1);
        if (parts.length != 2) {
            throw new BadRequestException("Invalid upload path");
        }
        objectKey(parts[0], parts[1]);
        return new StoragePath(parts[0], parts[1]);
    }

    private record StoragePath(String subDirectory, String filename) {
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
