package com.roboticgen.nexus.dto;
import java.util.List;

import lombok.Data;

@Data
public class CourseRequest {
    private String title;
    private String description;
    private List<ModuleRequest> modules;
}