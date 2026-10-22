import json
import logging
from typing import Dict, Any
from backend.models.schemas import ProjectState
from backend.services.llm_service import call_llm_structured

logger = logging.getLogger("TaskAgent")

AGENT_ROLE = "Development Task Planner"
AGENT_GOAL = "Convert system architecture, requirements, and selected tech stack into detailed, actionable development tasks with priorities and dependencies."

def run_task_agent(state: ProjectState) -> ProjectState:
    """Agent 4: Development Task Planner"""
    project_idea = state.get("project_idea", "")
    requirements = state.get("requirements", {})
    architecture = state.get("architecture", {})
    tech_stack = state.get("technology_stack", {})
    api_key = state.get("api_key")
    
    input_context = f"Raw Idea: {project_idea}\n\nRequirements:\n{json.dumps(requirements, indent=2)}\n\nArchitecture:\n{json.dumps(architecture, indent=2)}\n\nTech Stack:\n{json.dumps(tech_stack, indent=2)}"
    
    user_prompt = f"""
ROLE: {AGENT_ROLE}
GOAL: {AGENT_GOAL}
INPUT:
Raw Idea: {project_idea}
Requirements: {json.dumps(requirements.get('functional_requirements', []), indent=2)}
Architecture Components: {json.dumps(architecture.get('components', []), indent=2)}
Tech Stack: {json.dumps(tech_stack, indent=2)}

REASONING TASK:
1. Break down the software project into specific, granular, actionable implementation tasks.
2. DO NOT create generic high-level tasks like 'Build the backend' or 'Create the app'.
3. Break tasks into specific units like 'Initialize backend structure', 'Configure SQLite schema', 'Implement auth API', 'Integrate AI model client', 'Create React UI component', etc.
4. Assign a unique Task ID (T1, T2, T3...), Title, Description, Priority ('High', 'Medium', 'Low'), Phase name, and Dependency list (e.g., ['T1']).
5. Ensure logical dependency order (e.g. database setup before API endpoints that consume database).

OUTPUT FORMAT:
Return a JSON object with:
{{
  "tasks": [
    {{
      "id": "T1",
      "title": "Task Title",
      "description": "Specific action scope",
      "priority": "High",
      "phase": "Phase 1: Setup",
      "dependencies": []
    }},
    {{
      "id": "T2",
      "title": "Next Task Title",
      "description": "Specific action scope",
      "priority": "High",
      "phase": "Phase 1: Setup",
      "dependencies": ["T1"]
    }}
  ]
}}
"""
    logger.info("Executing Task Agent...")
    output = call_llm_structured(
        system_role=f"You are a Senior {AGENT_ROLE}. Break software requirements into granular, step-by-step developer tasks.",
        user_prompt=user_prompt,
        output_schema_name="TaskOutput",
        api_key=api_key
    )

    log_entry = {
        "agent_id": "agent_4",
        "agent_name": "Task Agent",
        "role": AGENT_ROLE,
        "goal": AGENT_GOAL,
        "input_context": input_context,
        "prompt": user_prompt.strip(),
        "output": output,
        "status": "completed"
    }

    logs = state.get("agent_logs", [])
    logs.append(log_entry)

    state["tasks"] = output
    state["agent_logs"] = logs
    state["current_agent"] = "Task Agent"
    return state
