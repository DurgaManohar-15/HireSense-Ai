package com.hiresense.modules.resume.storage;

import com.hiresense.common.exception.BadRequestException;
import com.hiresense.common.exception.ResourceNotFoundException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Slf4j
@Service
public class LocalResumeStorageService implements ResumeStorageService {

    private final Path rootLocation;

    public LocalResumeStorageService(@Value("${hiresense.storage.resume-upload-dir:./storage/resumes}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootLocation);
            log.info("Resume storage location initialized at: {}", rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize resume storage directory", e);
        }
    }

    @Override
    public void store(InputStream inputStream, String storageFilename) {
        try {
            Path destinationFile = this.rootLocation.resolve(Paths.get(storageFilename)).normalize().toAbsolutePath();

            // Prevent path traversal attack
            if (!destinationFile.getParent().equals(this.rootLocation.toAbsolutePath())) {
                throw new BadRequestException("Cannot store file outside current storage directory (Path Traversal Detected)");
            }

            Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store resume file", e);
        }
    }

    @Override
    public Resource loadAsResource(String storageFilename) {
        try {
            Path file = rootLocation.resolve(storageFilename).normalize();
            if (!file.toAbsolutePath().startsWith(this.rootLocation.toAbsolutePath())) {
                throw new BadRequestException("Cannot access file outside storage directory");
            }
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("Resume file not found: " + storageFilename);
            }
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("Resume file not found: " + storageFilename);
        }
    }

    @Override
    public void delete(String storageFilename) {
        try {
            Path file = rootLocation.resolve(storageFilename).normalize();
            if (file.toAbsolutePath().startsWith(this.rootLocation.toAbsolutePath())) {
                Files.deleteIfExists(file);
            }
        } catch (IOException e) {
            log.warn("Failed to delete stored resume file: {}", storageFilename, e);
        }
    }
}
