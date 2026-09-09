package com.netradhrishti.api.controllers;

import com.netradhrishti.api.models.DataQualityResult;
import com.netradhrishti.api.repositories.DataQualityResultRepository;
import com.netradhrishti.api.repositories.WorkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/data-quality")
@CrossOrigin(origins = "*")
public class DataQualityController {

    @Autowired
    private DataQualityResultRepository dataQualityResultRepository;

    @Autowired
    private WorkRepository workRepository;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        long totalWorks = workRepository.count();
        long totalIssues = dataQualityResultRepository.count();

        var byType = dataQualityResultRepository.countGroupedByIssueType();
        var bySeverity = dataQualityResultRepository.countGroupedBySeverity();

        // Calculate average data confidence across works
        var works = workRepository.findAll();
        double avgConfidence = works.stream()
                .mapToInt(w -> w.getDataConfidence() != null ? w.getDataConfidence() : 0)
                .average()
                .orElse(75.0);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalWorks", totalWorks);
        summary.put("totalIssues", totalIssues);
        summary.put("overallCompletenessScore", Math.round(avgConfidence));
        summary.put("issuesByType", byType);
        summary.put("issuesBySeverity", bySeverity);

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/issues")
    public ResponseEntity<List<DataQualityResult>> getIssues() {
        return ResponseEntity.ok(dataQualityResultRepository.findAll());
    }
}
