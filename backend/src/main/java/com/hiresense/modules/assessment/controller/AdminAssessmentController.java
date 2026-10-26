package com.hiresense.modules.assessment.controller;

import com.hiresense.common.ApiResponse;
import com.hiresense.modules.assessment.dto.*;
import com.hiresense.modules.assessment.model.AssessmentCategory;
import com.hiresense.modules.assessment.model.AssessmentDifficulty;
import com.hiresense.modules.assessment.service.AdminQuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAssessmentController {

    private final AdminQuestionService adminQuestionService;

    @GetMapping("/questions")
    public ResponseEntity<ApiResponse<Page<QuestionAdminDto>>> getQuestions(
            @RequestParam(required = false) AssessmentCategory category,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) AssessmentDifficulty difficulty,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<QuestionAdminDto> questions = adminQuestionService.getQuestions(
                category, topic, difficulty, PageRequest.of(page, size, Sort.by("id").descending())
        );
        return ResponseEntity.ok(ApiResponse.success(questions));
    }

    @GetMapping("/questions/{id}")
    public ResponseEntity<ApiResponse<QuestionAdminDto>> getQuestionById(@PathVariable Long id) {
        QuestionAdminDto question = adminQuestionService.getQuestionById(id);
        return ResponseEntity.ok(ApiResponse.success(question));
    }

    @PostMapping("/questions")
    public ResponseEntity<ApiResponse<QuestionAdminDto>> createQuestion(@Valid @RequestBody CreateQuestionRequest request) {
        QuestionAdminDto question = adminQuestionService.createQuestion(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Question created successfully", question));
    }

    @PutMapping("/questions/{id}")
    public ResponseEntity<ApiResponse<QuestionAdminDto>> updateQuestion(
            @PathVariable Long id,
            @Valid @RequestBody CreateQuestionRequest request) {
        QuestionAdminDto question = adminQuestionService.updateQuestion(id, request);
        return ResponseEntity.ok(ApiResponse.success("Question updated successfully", question));
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<ApiResponse<Void>> deactivateQuestion(@PathVariable Long id) {
        adminQuestionService.deactivateQuestion(id);
        return ResponseEntity.ok(ApiResponse.success("Question deactivated successfully", null));
    }

    @PostMapping("/assessments")
    public ResponseEntity<ApiResponse<AssessmentDefinitionDto>> createAssessment(
            @Valid @RequestBody CreateAssessmentDefinitionRequest request) {
        AssessmentDefinitionDto assessment = adminQuestionService.createAssessmentDefinition(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Assessment definition created successfully", assessment));
    }
}
