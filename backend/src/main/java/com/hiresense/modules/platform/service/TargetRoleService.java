package com.hiresense.modules.platform.service;

import com.hiresense.modules.platform.dto.TargetRoleDto;
import com.hiresense.modules.platform.model.TargetRole;
import com.hiresense.modules.platform.repository.TargetRoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TargetRoleService {

    private final TargetRoleRepository targetRoleRepository;

    @Transactional(readOnly = true)
    public List<TargetRoleDto> getActiveRoles() {
        return targetRoleRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(r -> TargetRoleDto.builder()
                        .id(r.getId())
                        .name(r.getName())
                        .category(r.getCategory())
                        .description(r.getDescription())
                        .expectedCoreSkills(r.getExpectedCoreSkills())
                        .active(r.isActive())
                        .build())
                .collect(Collectors.toList());
    }
}
