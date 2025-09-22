package com.arbeit.backend.service;

import org.springframework.stereotype.Service;

@Service
public class GeminiService {

    // Temporarily disabled due to dependency issues
    // TODO: Re-enable when correct Google AI SDK dependency is added

    public String generateRoadmap(String dreamRole, String currentSkills) {
        return "Mock roadmap for " + dreamRole + ". Current skills: " + (currentSkills != null ? currentSkills : "None") +
               "\n\nPhase 1: Foundations (1-2 months)\n- Learn basic concepts\n- Complete online tutorials\n- Build simple projects\n\n" +
               "Phase 2: Intermediate Skills (2-4 months)\n- Study advanced topics\n- Work on medium-complexity projects\n- Get certifications\n\n" +
               "Phase 3: Advanced Proficiency (4-6 months)\n- Master complex concepts\n- Contribute to open source\n- Build portfolio projects\n\n" +
               "Phase 4: Specialization (6-9 months)\n- Focus on specific area\n- Advanced certifications\n- Professional experience\n\n" +
               "Phase 5: Expert Level (9-12 months)\n- Leadership roles\n- Teaching/mentoring\n- Industry recognition";
    }

    public String generateProjectPlan(String title, String description) {
        return "Mock project plan for: " + title + "\n\nDescription: " + description + "\n\n" +
               "Phase 1: Planning (1 week)\nTasks:\n1. Define requirements\n2. Create project scope\n3. Set up development environment\n" +
               "Deliverables: Project specification document\nTime Estimate: 1 week\n\n" +
               "Phase 2: Development (2-4 weeks)\nTasks:\n1. Implement core features\n2. Write unit tests\n3. Code review\n" +
               "Deliverables: Working software prototype\nTime Estimate: 2-4 weeks\n\n" +
               "Phase 3: Testing & Deployment (1 week)\nTasks:\n1. Integration testing\n2. Bug fixes\n3. Deployment setup\n" +
               "Deliverables: Production-ready application\nTime Estimate: 1 week";
    }
}
