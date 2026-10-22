import json
import logging
from typing import Dict, Any
from backend.models.schemas import ProjectState
from backend.services.llm_service import call_llm_structured

logger = logging.getLogger("PlanningAgent")

AGENT_ROLE = "Project Planner"
AGENT_GOAL = "Combine all previous agent outputs into a structured, phased execution plan with milestones, timeline estimates, and risk mitigations."

def run_planning_agent(state: ProjectState) -> ProjectState:
    """Agent 5: Project Planner"""
    project_idea = state.get("project_idea", "")
    requirements = state.get("requirements", {})
    architecture = state.get("architecture", {})
    tech_stack = state.get("technology_stack", {})
    tasks_data = state.get("tasks", {})
    api_key = state.get("api_key")
    
    input_context = f"Raw Idea: {project_idea}\n\nRequirements:\n{json.dumps(requirements, indent=2)}\n\nTasks:\n{json.dumps(tasks_data, indent=2)}"
    
    user_prompt = f"""
ROLE: {AGENT_ROLE}
GOAL: {AGENT_GOAL}
INPUT:
Raw Idea: {project_idea}
Requirements Title: {requirements.get('project_title', 'Software Project')}
Task List: {json.dumps(tasks_data.get('tasks', []), indent=2)}

REASONING TASK:
1. Synthesize all previous outputs (Requirements, Architecture, Tech Stack, Task List).
2. Group tasks into logical development execution phases (e.g. Phase 1: Environment & Schema, Phase 2: Core API, Phase 3: AI Integration, Phase 4: Frontend UI, Phase 5: Verification & Polish).
3. For each phase, define name, clear phase objective, array of task IDs included (e.g. ['T1', 'T2']), and concrete deliverable.
4. Identify 3-5 major project milestones.
5. Identify top project risks and practical mitigation strategies.
6. Write a cohesive execution summary outlining the project roadmap.

OUTPUT FORMAT:
Return a JSON object with:
{{
  "phases": [
    {{
      "name": "Phase 1: Title",
      "objective": "Objective description",
      "tasks": ["T1", "T2"],
      "deliverable": "Tangible deliverable"
    }}
  ],
  "milestones": [
    "Milestone 1 description",
    "Milestone 2 description"
  ],
  "risks": [
    {{ "risk": "Risk description", "mitigation": "Mitigation strategy" }}
  ],
  "execution_summary": "High level narrative summary"
}}
"""
    logger.info("Executing Planning Agent...")
    output = call_llm_structured(
        system_role=f"You are an experienced {AGENT_ROLE}. Build practical, milestone-driven execution roadmaps for technical software projects.",
        user_prompt=user_prompt,
        output_schema_name="PlanningOutput",
        api_key=api_key
    )

    log_entry = {
        "agent_id": "agent_5",
        "agent_name": "Planning Agent",
        "role": AGENT_ROLE,
        "goal": AGENT_GOAL,
        "input_context": input_context,
        "prompt": user_prompt.strip(),
        "output": output,
        "status": "completed"
    }

    logs = state.get("agent_logs", [])
    logs.append(log_entry)

    state["execution_plan"] = output
    state["agent_logs"] = logs
    state["current_agent"] = "Planning Agent"
    return state
