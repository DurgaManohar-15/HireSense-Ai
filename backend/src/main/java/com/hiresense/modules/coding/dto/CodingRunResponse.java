package com.hiresense.modules.coding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodingRunResponse {
    private String status; // ACCEPTED, WRONG_ANSWER, COMPILE_ERROR, RUNTIME_ERROR
    private boolean passed;
    private int passedCount;
    private int totalCount;
    private long runtimeMs;
    private double memoryMb;
    private String output;
    private String expectedOutput;
    private String errorMessage;
    private List<TestCaseResult> testCaseResults;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestCaseResult {
        private String input;
        private String expectedOutput;
        private String actualOutput;
        private boolean passed;
        private long runtimeMs;
    }
}
