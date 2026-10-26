package com.hiresense.modules.intelligence.service;

import com.hiresense.common.exception.BadRequestException;
import com.hiresense.common.exception.ResourceNotFoundException;
import com.hiresense.modules.auth.model.User;
import com.hiresense.modules.auth.repository.UserRepository;
import com.hiresense.modules.intelligence.dto.GenerateRoadmapRequest;
import com.hiresense.modules.intelligence.dto.RoadmapDto;
import com.hiresense.modules.intelligence.dto.RoadmapTaskDto;
import com.hiresense.modules.intelligence.dto.SkillGapDto;
import com.hiresense.modules.intelligence.model.Roadmap;
import com.hiresense.modules.intelligence.model.RoadmapTask;
import com.hiresense.modules.intelligence.repository.RoadmapRepository;
import com.hiresense.modules.intelligence.repository.RoadmapTaskRepository;
import com.hiresense.modules.profile.model.StudentProfile;
import com.hiresense.modules.profile.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hiresense.modules.intelligence.dto.RoadmapResourceDto;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoadmapService {

    private final RoadmapRepository roadmapRepository;
    private final RoadmapTaskRepository taskRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository profileRepository;
    private final SkillGapAnalysisService skillGapService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public RoadmapDto generateRoadmap(Long userId, GenerateRoadmapRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Optional<StudentProfile> profileOpt = profileRepository.findByUserId(userId);
        String targetRole = (request.getTargetRole() != null && !request.getTargetRole().isBlank())
                ? request.getTargetRole() : profileOpt.map(StudentProfile::getTargetRole).orElse("Software Engineer");
        String targetCompany = (request.getTargetCompany() != null && !request.getTargetCompany().isBlank())
                ? request.getTargetCompany() : profileOpt.map(p -> p.getTargetCompany() != null ? p.getTargetCompany().getName() : "General Tech").orElse("General Tech");

        int duration = request.getDurationDays() != null ? request.getDurationDays() : 30;
        int hours = request.getHoursPerDay() != null ? request.getHoursPerDay() : 2;

        // 1. Determine Focus Skills / Topics
        List<String> targetTopicNames = new ArrayList<>();

        if (request.getCustomSkillGaps() != null && !request.getCustomSkillGaps().isEmpty()) {
            targetTopicNames.addAll(request.getCustomSkillGaps());
        } else if (request.getTopics() != null && !request.getTopics().isEmpty()) {
            targetTopicNames.addAll(request.getTopics());
        } else {
            // Fallback to top prioritized skill gaps from system evaluation
            List<SkillGapDto> skillGaps = skillGapService.evaluateAndPersistSkillGaps(userId);
            List<SkillGapDto> focusSkills = skillGaps.stream()
                    .filter(g -> g.getGapScore() > 0)
                    .limit(8)
                    .toList();

            if (focusSkills.isEmpty()) {
                focusSkills = skillGaps.stream().limit(5).toList();
            }
            targetTopicNames = focusSkills.stream().map(SkillGapDto::getSkillName).toList();
        }

        if (targetTopicNames.isEmpty()) {
            targetTopicNames = List.of("Data Structures", "Algorithms", "Java / Spring Boot", "System Design", "SQL & DBMS");
        }

        String depth = (request.getDepthLevel() != null && !request.getDepthLevel().isBlank())
                ? request.getDepthLevel().toUpperCase()
                : "IN_DEPTH";

        // 2. Deactivate previous active roadmap
        List<Roadmap> existingRoadmaps = roadmapRepository.findByUserIdOrderByVersionNumberDesc(userId);
        int nextVersion = existingRoadmaps.isEmpty() ? 1 : existingRoadmaps.get(0).getVersionNumber() + 1;

        for (Roadmap r : existingRoadmaps) {
            if (r.isActive()) {
                r.setActive(false);
                roadmapRepository.save(r);
            }
        }

        // 3. Create Roadmap Entity
        Roadmap roadmap = Roadmap.builder()
                .user(user)
                .versionNumber(nextVersion)
                .targetRole(targetRole)
                .targetCompany(targetCompany)
                .durationDays(duration)
                .hoursPerDay(hours)
                .totalTasks(duration)
                .completedTasks(0)
                .active(true)
                .aiProvider("MOCK_DETERMINISTIC")
                .aiModel("adaptive-planner-v2")
                .createdAt(Instant.now())
                .build();

        Roadmap savedRoadmap = roadmapRepository.save(roadmap);

        // 4. Generate Customized Day-by-Day Learning Schedule based on Depth & Hours
        List<RoadmapTask> tasks = new ArrayList<>();
        String[] activityRotation = {"LEARN", "PRACTICE", "CODING", "QUIZ", "MOCK_INTERVIEW"};

        for (int day = 1; day <= duration; day++) {
            String currentTopic = targetTopicNames.get((day - 1) % targetTopicNames.size());
            String activity = activityRotation[(day - 1) % activityRotation.length];
            String priority = (day % 3 == 0) ? "HIGH" : (day % 2 == 0 ? "MEDIUM" : "LOW");

            String topicTitle = currentTopic + " - " + getSubtopic(currentTopic, day, depth);
            String objective = generateObjective(activity, currentTopic, targetRole, depth, hours);
            List<RoadmapResourceDto> resources = generateResourcesForTopic(currentTopic, activity, topicTitle);
            String resourcesJson = null;
            try {
                resourcesJson = objectMapper.writeValueAsString(resources);
            } catch (Exception e) {
                log.warn("Failed to serialize roadmap task resources: {}", e.getMessage());
            }

            RoadmapTask task = RoadmapTask.builder()
                    .roadmap(savedRoadmap)
                    .dayNumber(day)
                    .topic(topicTitle)
                    .skillName(currentTopic)
                    .activityType(activity)
                    .estimatedDurationMinutes(hours * 60)
                    .priority(priority)
                    .learningObjective(objective)
                    .resourcesJson(resourcesJson)
                    .completed(false)
                    .skipped(false)
                    .build();

            tasks.add(task);
        }

        taskRepository.saveAll(tasks);
        savedRoadmap.setTasks(tasks);

        return mapToDto(savedRoadmap);
    }

    @Transactional(readOnly = true)
    public RoadmapDto getCurrentRoadmap(Long userId) {
        return roadmapRepository.findFirstByUserIdAndActiveTrueOrderByVersionNumberDesc(userId)
                .map(this::mapToDto)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<RoadmapDto> getRoadmapHistory(Long userId) {
        return roadmapRepository.findByUserIdOrderByVersionNumberDesc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public RoadmapTaskDto updateTaskStatus(Long taskId, Long userId, boolean completed, boolean skipped) {
        RoadmapTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap task not found: " + taskId));

        Roadmap roadmap = task.getRoadmap();
        if (roadmap == null || !roadmap.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Roadmap task not found or unauthorized: " + taskId);
        }

        task.setCompleted(completed);
        task.setSkipped(skipped);
        if (completed) {
            task.setCompletedAt(Instant.now());
        } else {
            task.setCompletedAt(null);
        }

        RoadmapTask savedTask = taskRepository.save(task);

        // Recalculate completed count for roadmap
        List<RoadmapTask> allTasks = taskRepository.findByRoadmapIdOrderByDayNumberAsc(roadmap.getId());
        long completedCount = allTasks.stream().filter(RoadmapTask::isCompleted).count();
        roadmap.setCompletedTasks((int) completedCount);
        roadmap.setUpdatedAt(Instant.now());
        roadmapRepository.save(roadmap);

        return mapToTaskDto(savedTask);
    }

    private List<RoadmapResourceDto> generateResourcesForTopic(String skill, String activity, String topicTitle) {
        List<RoadmapResourceDto> list = new ArrayList<>();
        String lower = skill.toLowerCase();

        if (lower.contains("java") || lower.contains("spring")) {
            list.add(RoadmapResourceDto.builder()
                    .title("Oracle Java Core Documentation & Best Practices")
                    .url("https://docs.oracle.com/en/java/")
                    .type("DOCUMENTATION")
                    .description("Official Java language specification, concurrency, and collections framework.")
                    .estimatedReadTime("20 mins")
                    .build());
            list.add(RoadmapResourceDto.builder()
                    .title("Baeldung Java & Spring Boot In-Depth Guides")
                    .url("https://www.baeldung.com/java-tutorial")
                    .type("ARTICLE")
                    .description("Comprehensive tutorials with code examples on Spring Boot, JPA, and OOP.")
                    .estimatedReadTime("25 mins")
                    .build());
            list.add(RoadmapResourceDto.builder()
                    .title("LeetCode Top Java Interview Problems")
                    .url("https://leetcode.com/problemset/all/")
                    .type("PRACTICE")
                    .description("Hands-on coding challenges for high-frequency technical interview questions.")
                    .estimatedReadTime("45 mins")
                    .build());
        } else if (lower.contains("data struct") || lower.contains("algorithm") || lower.contains("dsa") || lower.contains("graph") || lower.contains("tree") || lower.contains("dynamic")) {
            list.add(RoadmapResourceDto.builder()
                    .title("NeetCode 150 - Curated DSA Practice Roadmap")
                    .url("https://neetcode.io/practice")
                    .type("PRACTICE")
                    .description("Interactive visual solutions and structured problem sets grouped by pattern.")
                    .estimatedReadTime("35 mins")
                    .build());
            list.add(RoadmapResourceDto.builder()
                    .title("GeeksforGeeks Data Structures & Algorithms Library")
                    .url("https://www.geeksforgeeks.org/data-structures/")
                    .type("DOCUMENTATION")
                    .description("Detailed algorithmic time & space complexity breakdowns with code samples.")
                    .estimatedReadTime("20 mins")
                    .build());
            list.add(RoadmapResourceDto.builder()
                    .title("LeetCode Blind 75 Must-Do Problems")
                    .url("https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions")
                    .type("PRACTICE")
                    .description("The most frequently tested interview patterns for top product companies.")
                    .estimatedReadTime("40 mins")
                    .build());
        } else if (lower.contains("sql") || lower.contains("dbms") || lower.contains("database")) {
            list.add(RoadmapResourceDto.builder()
                    .title("MySQL / PostgreSQL Optimization Reference")
                    .url("https://dev.mysql.com/doc/refman/8.0/en/")
                    .type("DOCUMENTATION")
                    .description("Official documentation on query execution plans, transactions, and indexing.")
                    .estimatedReadTime("25 mins")
                    .build());
            list.add(RoadmapResourceDto.builder()
                    .title("LeetCode Database SQL 50 Study Plan")
                    .url("https://leetcode.com/studyplan/top-sql-50/")
                    .type("PRACTICE")
                    .description("Hands-on SQL schema queries, complex joins, subqueries, and window functions.")
                    .estimatedReadTime("30 mins")
                    .build());
            list.add(RoadmapResourceDto.builder()
                    .title("Use The Index, Luke! - Database Performance")
                    .url("https://use-the-index-luke.com/")
                    .type("ARTICLE")
                    .description("A guide to database indexing for developers and SQL performance tuning.")
                    .estimatedReadTime("15 mins")
                    .build());
        } else if (lower.contains("system design") || lower.contains("microservice") || lower.contains("architecture")) {
            list.add(RoadmapResourceDto.builder()
                    .title("System Design Primer (GitHub Curated Guide)")
                    .url("https://github.com/donnemartin/system-design-primer")
                    .type("DOCUMENTATION")
                    .description("Learn how to design large-scale distributed systems and handle millions of users.")
                    .estimatedReadTime("30 mins")
                    .build());
            list.add(RoadmapResourceDto.builder()
                    .title("ByteByteGo - Visual System Design Architecture")
                    .url("https://bytebytego.com/")
                    .type("ARTICLE")
                    .description("High-level architectural diagrams and system design interview deep-dives.")
                    .estimatedReadTime("20 mins")
                    .build());
        } else if (lower.contains("react") || lower.contains("javascript") || lower.contains("frontend") || lower.contains("css") || lower.contains("html")) {
            list.add(RoadmapResourceDto.builder()
                    .title("React Official Documentation (react.dev)")
                    .url("https://react.dev/learn")
                    .type("DOCUMENTATION")
                    .description("Modern React concepts, hooks, state management, and performance.")
                    .estimatedReadTime("25 mins")
                    .build());
            list.add(RoadmapResourceDto.builder()
                    .title("MDN Web Docs - JavaScript Standard Reference")
                    .url("https://developer.mozilla.org/en-US/docs/Web/JavaScript")
                    .type("DOCUMENTATION")
                    .description("Authoritative guide to JS closures, event loops, async/await, and DOM.")
                    .estimatedReadTime("20 mins")
                    .build());
            list.add(RoadmapResourceDto.builder()
                    .title("GreatFrontEnd - Frontend Practice & Quizzes")
                    .url("https://www.greatfrontend.com/")
                    .type("PRACTICE")
                    .description("Interactive UI challenges and JavaScript coding interview questions.")
                    .estimatedReadTime("30 mins")
                    .build());
        } else if (lower.contains("operating system") || lower.contains("os") || lower.contains("network") || lower.contains("cn")) {
            list.add(RoadmapResourceDto.builder()
                    .title("GeeksforGeeks Core CS & Operating Systems Concepts")
                    .url("https://www.geeksforgeeks.org/operating-systems/")
                    .type("DOCUMENTATION")
                    .description("Processes, threads, deadlock resolution, CPU scheduling, and virtual memory.")
                    .estimatedReadTime("20 mins")
                    .build());
            list.add(RoadmapResourceDto.builder()
                    .title("Computer Networks Protocols & OSI Reference")
                    .url("https://www.geeksforgeeks.org/computer-network-tutorials/")
                    .type("DOCUMENTATION")
                    .description("TCP/IP 4-layer model, HTTP/HTTPS, DNS, routing algorithms, and sockets.")
                    .estimatedReadTime("20 mins")
                    .build());
        } else if (lower.contains("aptitude") || lower.contains("reasoning") || lower.contains("logic") || lower.contains("quant")) {
            list.add(RoadmapResourceDto.builder()
                    .title("IndiaBIX Quantitative Aptitude & Reasoning Drills")
                    .url("https://www.indiabix.com/aptitude/questions-and-answers/")
                    .type("PRACTICE")
                    .description("Topic-wise placement aptitude tests with detailed step-by-step solutions.")
                    .estimatedReadTime("30 mins")
                    .build());
            list.add(RoadmapResourceDto.builder()
                    .title("GeeksforGeeks Placement Aptitude & Logical Practice")
                    .url("https://www.geeksforgeeks.org/aptitude-questions-and-answers/")
                    .type("PRACTICE")
                    .description("Standard campus recruitment test questions for top IT firms.")
                    .estimatedReadTime("25 mins")
                    .build());
        } else {
            list.add(RoadmapResourceDto.builder()
                    .title(String.format("GeeksforGeeks %s Mastery Guide", skill))
                    .url("https://www.geeksforgeeks.org/")
                    .type("DOCUMENTATION")
                    .description(String.format("Core fundamentals, interview questions, and examples for %s.", skill))
                    .estimatedReadTime("20 mins")
                    .build());
            list.add(RoadmapResourceDto.builder()
                    .title(String.format("LeetCode & GitHub Topic Practice (%s)", skill))
                    .url("https://leetcode.com/")
                    .type("PRACTICE")
                    .description(String.format("Hands-on exercises and real interview challenges for %s.", skill))
                    .estimatedReadTime("30 mins")
                    .build());
        }

        return list;
    }

    private String getSubtopic(String skill, int day, String depth) {
        if ("BRIEF".equals(depth)) {
            String[] briefSubtopics = {"Quick Foundation & Core Cheat Sheet", "High-Frequency Interview Patterns", "Key Edge Cases & Rapid Drill", "Summary & Self-Assessment"};
            return briefSubtopics[(day - 1) % briefSubtopics.length];
        } else if ("GENERAL_AWARENESS".equals(depth)) {
            String[] generalSubtopics = {"Conceptual Overview & Ecosystem", "System Architecture Terminology", "Industry Best Practices & Use Cases", "Conversational Articulation & Trade-offs"};
            return generalSubtopics[(day - 1) % generalSubtopics.length];
        } else {
            String[] inDepthSubtopics = {"Internals, Memory Models & Concurrency", "Algorithms, Data Flow & Complexity", "Production Architecture & Design Patterns", "Hands-On System Implementation", "Comprehensive Performance Tuning & Mock Defense"};
            return inDepthSubtopics[(day - 1) % inDepthSubtopics.length];
        }
    }

    private String generateObjective(String activity, String skill, String role, String depth, int hours) {
        String depthPrefix = switch (depth) {
            case "BRIEF" -> "[Quick Revision - " + hours + "h] ";
            case "GENERAL_AWARENESS" -> "[General Awareness - " + hours + "h] ";
            default -> "[In-Depth Mastery - " + hours + "h] ";
        };

        return switch (activity) {
            case "LEARN" -> depthPrefix + String.format("Master the architectural principles and design fundamentals of %s tailored for %s interviews.", skill, role);
            case "PRACTICE" -> depthPrefix + String.format("Solve curated scenario problems and benchmark questions in %s.", skill);
            case "CODING" -> depthPrefix + String.format("Implement practical code patterns, unit tests, and algorithms for %s.", skill);
            case "QUIZ" -> depthPrefix + String.format("Validate retention and interview readiness in %s with diagnostic exercises.", skill);
            case "MOCK_INTERVIEW" -> depthPrefix + String.format("Articulate technical trade-offs, architecture decisions, and real-world applications of %s.", skill);
            default -> depthPrefix + String.format("Solidify campus placement readiness for %s.", skill);
        };
    }

    private RoadmapDto mapToDto(Roadmap r) {
        List<RoadmapTaskDto> taskDtos = r.getTasks().stream()
                .map(this::mapToTaskDto)
                .collect(Collectors.toList());

        int progress = r.getTotalTasks() > 0 ? (int) Math.round(((double) r.getCompletedTasks() / r.getTotalTasks()) * 100.0) : 0;

        return RoadmapDto.builder()
                .id(r.getId())
                .versionNumber(r.getVersionNumber())
                .targetRole(r.getTargetRole())
                .targetCompany(r.getTargetCompany())
                .durationDays(r.getDurationDays())
                .hoursPerDay(r.getHoursPerDay())
                .totalTasks(r.getTotalTasks())
                .completedTasks(r.getCompletedTasks())
                .progressPercentage(progress)
                .active(r.isActive())
                .aiProvider(r.getAiProvider())
                .tasks(taskDtos)
                .createdAt(r.getCreatedAt())
                .build();
    }

    private RoadmapTaskDto mapToTaskDto(RoadmapTask t) {
        List<RoadmapResourceDto> resources = new ArrayList<>();
        if (t.getResourcesJson() != null && !t.getResourcesJson().isBlank()) {
            try {
                resources = objectMapper.readValue(t.getResourcesJson(), new TypeReference<List<RoadmapResourceDto>>() {});
            } catch (Exception e) {
                log.warn("Failed to parse roadmap task resources for task {}: {}", t.getId(), e.getMessage());
            }
        }
        if (resources.isEmpty()) {
            resources = generateResourcesForTopic(t.getSkillName(), t.getActivityType(), t.getTopic());
        }

        return RoadmapTaskDto.builder()
                .id(t.getId())
                .dayNumber(t.getDayNumber())
                .topic(t.getTopic())
                .skillName(t.getSkillName())
                .activityType(t.getActivityType())
                .estimatedDurationMinutes(t.getEstimatedDurationMinutes())
                .priority(t.getPriority())
                .learningObjective(t.getLearningObjective())
                .resources(resources)
                .completed(t.isCompleted())
                .skipped(t.isSkipped())
                .completedAt(t.getCompletedAt())
                .build();
    }
}
