package com.hiresense.modules.resume.controller;

import com.hiresense.common.ApiResponse;
import com.hiresense.modules.resume.dto.*;
import com.hiresense.modules.resume.model.ResumeImprovementSuggestion;
import com.hiresense.modules.resume.service.JobDescriptionService;
import com.hiresense.modules.resume.service.ResumeService;
import com.hiresense.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;
    private final JobDescriptionService jobDescriptionService;

    // 1. Upload Resume PDF
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ResumeDto>> uploadResume(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ResumeDto resume = resumeService.uploadResume(userPrincipal.getId(), file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resume uploaded and parsed successfully", resume));
    }

    // 2. List My Resumes
    @GetMapping
    public ResponseEntity<ApiResponse<List<ResumeDto>>> getMyResumes(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<ResumeDto> resumes = resumeService.getMyResumes(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(resumes));
    }

    // 3. Get Resume Details
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResumeDto>> getResumeById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ResumeDto resume = resumeService.getResumeById(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(resume));
    }

    // 4. Download Resume PDF
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadResume(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Resource file = resumeService.downloadResume(id, userPrincipal.getId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(file);
    }

    // 5. Trigger or Retrieve AI Resume Diagnostic & JD Match
    @PostMapping("/{id}/analyze")
    public ResponseEntity<ApiResponse<ResumeAnalysisResponse>> analyzeResume(
            @PathVariable Long id,
            @RequestBody(required = false) ResumeAnalysisRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ResumeAnalysisResponse analysis = resumeService.analyzeResume(id, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Resume analysis completed successfully", analysis));
    }

    // 6. Get Latest Standalone Analysis for Resume
    @GetMapping("/{id}/analysis")
    public ResponseEntity<ApiResponse<ResumeAnalysisResponse>> getResumeAnalysis(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ResumeAnalysisResponse analysis = resumeService.getLatestAnalysis(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(analysis));
    }

    // 7. Get Full Analysis History for Current User
    @GetMapping("/analyses/history")
    public ResponseEntity<ApiResponse<List<ResumeAnalysisResponse>>> getAnalysisHistory(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<ResumeAnalysisResponse> history = resumeService.getAnalysisHistory(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    // 8. Get All JD-Resume Snapshots History
    @GetMapping("/jd-analyses")
    public ResponseEntity<ApiResponse<List<JdResumeAnalysisResponse>>> getJdAnalysisHistory(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<JdResumeAnalysisResponse> history = resumeService.getJdAnalysisHistory(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    // 9. Get Single JD-Resume Snapshot by ID
    @GetMapping("/jd-analyses/{id}")
    public ResponseEntity<ApiResponse<JdResumeAnalysisResponse>> getJdAnalysisById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        JdResumeAnalysisResponse analysis = resumeService.getJdAnalysisById(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(analysis));
    }

    // 10. Compare Two Analysis Snapshots Side-by-Side
    @GetMapping("/jd-analyses/compare")
    public ResponseEntity<ApiResponse<AnalysisComparisonDto>> compareAnalyses(
            @RequestParam("analysisAId") Long analysisAId,
            @RequestParam("analysisBId") Long analysisBId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        AnalysisComparisonDto comparison = resumeService.compareAnalyses(analysisAId, analysisBId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Analyses compared successfully", comparison));
    }

    // 11. Accept / Edit / Reject a Resume Improvement Suggestion
    @PatchMapping("/suggestions/{suggestionId}")
    public ResponseEntity<ApiResponse<ResumeImprovementSuggestion>> updateSuggestionStatus(
            @PathVariable Long suggestionId,
            @Valid @RequestBody SuggestionActionRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ResumeImprovementSuggestion updated = resumeService.updateSuggestionStatus(suggestionId, userPrincipal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Suggestion updated successfully", updated));
    }

    // 12. Create Job Description
    @PostMapping("/job-descriptions")
    public ResponseEntity<ApiResponse<JobDescriptionDto>> createJobDescription(
            @Valid @RequestBody JobDescriptionCreateRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        JobDescriptionDto jd = jobDescriptionService.createJobDescription(userPrincipal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Job description parsed and saved successfully", jd));
    }

    // 13. List My Job Descriptions
    @GetMapping("/job-descriptions")
    public ResponseEntity<ApiResponse<List<JobDescriptionDto>>> getMyJobDescriptions(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<JobDescriptionDto> list = jobDescriptionService.getMyJobDescriptions(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    // 14. Get Job Description by ID
    @GetMapping("/job-descriptions/{id}")
    public ResponseEntity<ApiResponse<JobDescriptionDto>> getJobDescriptionById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        JobDescriptionDto jd = jobDescriptionService.getJobDescriptionById(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(jd));
    }

    // 15. Delete Job Description
    @DeleteMapping("/job-descriptions/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteJobDescription(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        jobDescriptionService.deleteJobDescription(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Job description removed successfully", null));
    }

    // 16. Delete Resume
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteResume(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        resumeService.deleteResume(id, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Resume deleted successfully", null));
    }
}
