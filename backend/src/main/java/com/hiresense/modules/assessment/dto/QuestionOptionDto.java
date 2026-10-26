package com.hiresense.modules.assessment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionOptionDto {
    private Long id;
    private String optionLabel;
    private String optionText;
    private Boolean correct; // null when returned to active test-taker, boolean for admin or result review
}
