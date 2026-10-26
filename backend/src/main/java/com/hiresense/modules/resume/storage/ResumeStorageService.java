package com.hiresense.modules.resume.storage;

import org.springframework.core.io.Resource;

import java.io.InputStream;

public interface ResumeStorageService {
    void store(InputStream inputStream, String storageFilename);
    Resource loadAsResource(String storageFilename);
    void delete(String storageFilename);
}
