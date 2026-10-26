package com.hiresense.modules.profile.service;

import com.hiresense.common.exception.ResourceNotFoundException;
import com.hiresense.modules.profile.dto.CompanyBenchmarkDto;
import com.hiresense.modules.profile.dto.TargetCompanyResponse;
import com.hiresense.modules.profile.model.TargetCompany;
import com.hiresense.modules.profile.repository.TargetCompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TargetCompanyService {

    private final TargetCompanyRepository targetCompanyRepository;

    @Transactional(readOnly = true)
    public List<TargetCompanyResponse> getAllActiveCompanies() {
        return targetCompanyRepository.findByActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TargetCompanyResponse getCompanyById(Long id) {
        TargetCompany company = targetCompanyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Target company not found with id: " + id));
        return mapToResponse(company);
    }

    public TargetCompanyResponse mapToResponse(TargetCompany company) {
        List<CompanyBenchmarkDto> benchmarks = company.getBenchmarks().stream()
                .map(b -> CompanyBenchmarkDto.builder()
                        .id(b.getId())
                        .skillName(b.getSkillName())
                        .category(b.getCategory())
                        .minimumProficiency(b.getMinimumProficiency())
                        .weight(b.getWeight())
                        .build())
                .collect(Collectors.toList());

        return TargetCompanyResponse.builder()
                .id(company.getId())
                .name(company.getName())
                .tier(company.getTier())
                .description(company.getDescription())
                .websiteUrl(company.getWebsiteUrl())
                .benchmarks(benchmarks)
                .build();
    }
}
