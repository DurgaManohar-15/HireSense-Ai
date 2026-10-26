package com.hiresense.modules.coding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodingRunRequest {
    private String language; // java, python, javascript, cpp
    private String code;
    private String customInput;
}
