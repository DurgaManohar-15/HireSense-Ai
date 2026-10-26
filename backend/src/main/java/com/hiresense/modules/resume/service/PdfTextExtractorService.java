package com.hiresense.modules.resume.service;

import com.hiresense.common.exception.BadRequestException;
import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;

@Slf4j
@Service
public class PdfTextExtractorService {

    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
    private static final int MAX_PAGE_COUNT = 3;
    private static final byte[] PDF_MAGIC_BYTES = new byte[]{0x25, 0x50, 0x44, 0x46}; // "%PDF"

    @Data
    @Builder
    public static class ExtractedPdfData {
        private String text;
        private int pageCount;
        private long sizeBytes;
        private String originalFilename;
    }

    public ExtractedPdfData validateAndExtractText(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty or missing");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException("File size exceeds the 5 MB limit (Uploaded: " + (file.getSize() / 1024 / 1024) + " MB)");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".pdf")) {
            throw new BadRequestException("Invalid file extension. Only PDF (.pdf) documents are supported.");
        }

        // Validate Magic Bytes (file signature)
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[4];
            int read = is.read(header);
            if (read < 4 || !Arrays.equals(header, PDF_MAGIC_BYTES)) {
                throw new BadRequestException("Invalid PDF signature. The file is not a valid PDF document.");
            }
        } catch (IOException e) {
            throw new BadRequestException("Failed to read file header signature", e);
        }

        // Extract with PDFBox
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            int pageCount = document.getNumberOfPages();
            if (pageCount > MAX_PAGE_COUNT) {
                throw new BadRequestException("Resume exceeds maximum allowed length of 3 pages (Uploaded: " + pageCount + " pages). Please upload a concise campus resume.");
            }

            if (pageCount == 0) {
                throw new BadRequestException("The uploaded PDF has 0 pages.");
            }

            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String extractedText = stripper.getText(document);

            if (extractedText == null || extractedText.trim().length() < 50) {
                throw new BadRequestException("No readable text could be extracted from this PDF. If this is a scanned or image-based PDF, please upload a text-readable PDF version.");
            }

            return ExtractedPdfData.builder()
                    .text(extractedText.trim())
                    .pageCount(pageCount)
                    .sizeBytes(file.getSize())
                    .originalFilename(filename)
                    .build();

        } catch (IOException e) {
            log.error("PDFBox extraction failed for file: {}", filename, e);
            throw new BadRequestException("Corrupted or encrypted PDF document. Please verify the file can be opened and re-upload.");
        }
    }
}
