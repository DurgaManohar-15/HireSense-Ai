package com.hiresense.modules.job.repository;

import com.hiresense.modules.job.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByActiveTrueOrderByCreatedAtDesc();

    @Query("SELECT j FROM Job j WHERE j.active = true AND " +
           "(:query IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(j.company) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(j.skills) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:workType IS NULL OR j.workType = :workType) AND " +
           "(:experienceLevel IS NULL OR j.experienceLevel = :experienceLevel) " +
           "ORDER BY j.createdAt DESC")
    List<Job> searchJobs(
            @Param("query") String query,
            @Param("location") String location,
            @Param("workType") String workType,
            @Param("experienceLevel") String experienceLevel
    );
}
