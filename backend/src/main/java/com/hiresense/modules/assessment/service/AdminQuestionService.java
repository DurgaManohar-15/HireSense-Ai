package com.hiresense.modules.assessment.service;

import com.hiresense.common.exception.BadRequestException;
import com.hiresense.common.exception.ResourceNotFoundException;
import com.hiresense.modules.assessment.dto.*;
import com.hiresense.modules.assessment.model.*;
import com.hiresense.modules.assessment.repository.AssessmentDefinitionRepository;
import com.hiresense.modules.assessment.repository.QuestionOptionRepository;
import com.hiresense.modules.assessment.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminQuestionService {

    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository optionRepository;
    private final AssessmentDefinitionRepository definitionRepository;

    @Transactional(readOnly = true)
    public Page<QuestionAdminDto> getQuestions(AssessmentCategory category, String topic, AssessmentDifficulty difficulty, Pageable pageable) {
        return questionRepository.findWithFilters(category, topic, difficulty, pageable)
                .map(this::mapToAdminDto);
    }

    @Transactional(readOnly = true)
    public QuestionAdminDto getQuestionById(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));
        return mapToAdminDto(question);
    }

    @Transactional
    public QuestionAdminDto createQuestion(CreateQuestionRequest request) {
        if (request.getOptions() == null || request.getOptions().size() < 2) {
            throw new BadRequestException("A question must have at least 2 options");
        }

        boolean hasCorrect = request.getOptions().stream().anyMatch(o -> Boolean.TRUE.equals(o.getCorrect()));
        if (!hasCorrect) {
            throw new BadRequestException("At least one option must be marked as correct");
        }

        Question question = Question.builder()
                .category(request.getCategory())
                .topic(request.getTopic().trim())
                .difficulty(request.getDifficulty())
                .questionText(request.getQuestionText().trim())
                .explanation(request.getExplanation())
                .example(request.getExample())
                .useCase(request.getUseCase())
                .marks(request.getMarks() != null ? request.getMarks() : 1)
                .active(true)
                .build();

        Question savedQuestion = questionRepository.save(question);

        List<QuestionOption> options = new ArrayList<>();
        char label = 'A';
        for (QuestionOptionDto optDto : request.getOptions()) {
            String optLabel = optDto.getOptionLabel() != null ? optDto.getOptionLabel() : String.valueOf(label++);
            QuestionOption opt = QuestionOption.builder()
                    .question(savedQuestion)
                    .optionLabel(optLabel)
                    .optionText(optDto.getOptionText().trim())
                    .correct(Boolean.TRUE.equals(optDto.getCorrect()))
                    .build();
            options.add(opt);
        }
        optionRepository.saveAll(options);
        savedQuestion.setOptions(options);

        return mapToAdminDto(savedQuestion);
    }

    @Transactional
    public QuestionAdminDto updateQuestion(Long id, CreateQuestionRequest request) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));

        question.setCategory(request.getCategory());
        question.setTopic(request.getTopic().trim());
        question.setDifficulty(request.getDifficulty());
        question.setQuestionText(request.getQuestionText().trim());
        question.setExplanation(request.getExplanation());
        question.setExample(request.getExample());
        question.setUseCase(request.getUseCase());
        question.setMarks(request.getMarks() != null ? request.getMarks() : 1);

        if (request.getOptions() != null && !request.getOptions().isEmpty()) {
            boolean hasCorrect = request.getOptions().stream().anyMatch(o -> Boolean.TRUE.equals(o.getCorrect()));
            if (!hasCorrect) {
                throw new BadRequestException("At least one option must be marked as correct");
            }

            question.getOptions().clear();
            char label = 'A';
            for (QuestionOptionDto optDto : request.getOptions()) {
                String optLabel = optDto.getOptionLabel() != null ? optDto.getOptionLabel() : String.valueOf(label++);
                QuestionOption opt = QuestionOption.builder()
                    .question(question)
                    .optionLabel(optLabel)
                    .optionText(optDto.getOptionText().trim())
                    .correct(Boolean.TRUE.equals(optDto.getCorrect()))
                    .build();
                question.getOptions().add(opt);
            }
        }

        Question updated = questionRepository.save(question);
        return mapToAdminDto(updated);
    }

    @Transactional
    public void deactivateQuestion(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));
        question.setActive(false);
        questionRepository.save(question);
    }

    @Transactional
    public AssessmentDefinitionDto createAssessmentDefinition(CreateAssessmentDefinitionRequest request) {
        AssessmentDefinition def = AssessmentDefinition.builder()
                .title(request.getTitle().trim())
                .slug(request.getSlug().trim().toLowerCase())
                .description(request.getDescription().trim())
                .category(request.getCategory())
                .difficulty(request.getDifficulty())
                .durationMinutes(request.getDurationMinutes())
                .totalQuestions(request.getTotalQuestions())
                .passingPercentage(request.getPassingPercentage())
                .active(true)
                .build();

        AssessmentDefinition saved = definitionRepository.save(def);
        return AssessmentDefinitionDto.builder()
                .id(saved.getId())
                .title(saved.getTitle())
                .slug(saved.getSlug())
                .description(saved.getDescription())
                .category(saved.getCategory())
                .difficulty(saved.getDifficulty())
                .durationMinutes(saved.getDurationMinutes())
                .totalQuestions(saved.getTotalQuestions())
                .passingPercentage(saved.getPassingPercentage())
                .active(saved.isActive())
                .build();
    }

    private QuestionAdminDto mapToAdminDto(Question q) {
        List<QuestionOptionDto> options = q.getOptions().stream()
                .map(opt -> QuestionOptionDto.builder()
                        .id(opt.getId())
                        .optionLabel(opt.getOptionLabel())
                        .optionText(opt.getOptionText())
                        .correct(opt.isCorrect())
                        .build())
                .collect(Collectors.toList());

        return QuestionAdminDto.builder()
                .id(q.getId())
                .category(q.getCategory())
                .topic(q.getTopic())
                .difficulty(q.getDifficulty())
                .questionText(q.getQuestionText())
                .explanation(q.getExplanation())
                .example(q.getExample())
                .useCase(q.getUseCase())
                .marks(q.getMarks())
                .active(q.isActive())
                .options(options)
                .createdAt(q.getCreatedAt())
                .updatedAt(q.getUpdatedAt())
                .build();
    }
}
