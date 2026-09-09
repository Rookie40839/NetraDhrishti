package com.netradhrishti.api.controllers;

import com.netradhrishti.api.models.ComplianceFlag;
import com.netradhrishti.api.models.ComplianceRule;
import com.netradhrishti.api.repositories.ComplianceFlagRepository;
import com.netradhrishti.api.repositories.ComplianceRuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/compliance")
@CrossOrigin(origins = "*")
public class ComplianceController {

    @Autowired
    private ComplianceRuleRepository complianceRuleRepository;

    @Autowired
    private ComplianceFlagRepository complianceFlagRepository;

    @GetMapping("/rules")
    public ResponseEntity<List<Map<String, Object>>> getAllRules() {
        List<ComplianceRule> rules = complianceRuleRepository.findAll();
        var countsList = complianceFlagRepository.countTriggeredGroupedByRuleId();

        Map<String, Long> countMap = new HashMap<>();
        for (var c : countsList) {
            String ruleId = (String) c.get("ruleId");
            Long count = ((Number) c.get("count")).longValue();
            countMap.put(ruleId, count);
        }

        List<Map<String, Object>> result = rules.stream().map(rule -> {
            Map<String, Object> map = new HashMap<>();
            map.put("ruleId", rule.getRuleId());
            map.put("ruleName", rule.getRuleName());
            map.put("ruleType", rule.getRuleType());
            map.put("description", rule.getDescription());
            map.put("sourceReference", rule.getSourceReference());
            map.put("severity", rule.getSeverity());
            map.put("active", rule.getActive());
            map.put("flaggedCount", countMap.getOrDefault(rule.getRuleId(), 0L));
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/rules/{ruleId}")
    public ResponseEntity<?> getRuleDetail(@PathVariable String ruleId) {
        var ruleOpt = complianceRuleRepository.findById(ruleId);
        if (ruleOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ComplianceRule rule = ruleOpt.get();
        List<ComplianceFlag> flags = complianceFlagRepository.findByRuleId(ruleId);

        Map<String, Object> response = new HashMap<>();
        response.put("rule", rule);
        response.put("flaggedCount", flags.size());
        response.put("flags", flags);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/flags")
    public ResponseEntity<List<ComplianceFlag>> getAllFlags(@RequestParam(required = false) String ruleId) {
        if (ruleId != null && !ruleId.trim().isEmpty()) {
            return ResponseEntity.ok(complianceFlagRepository.findByRuleId(ruleId.trim()));
        }
        return ResponseEntity.ok(complianceFlagRepository.findAll());
    }
}
