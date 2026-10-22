import json
import logging
from typing import Dict, Any
from backend.models.schemas import ProjectState, AgentLogItem
from backend.services.llm_service import call_llm_structured

logger = logging.getLogger("RequirementAgent")

AGENT_ROLE = "Requirements Analyst"
AGENT_GOAL = "Understand the user's raw project idea and identify the project's functional, non-functional requirements, target users, and key features."

def run_requirement_agent(state: ProjectState) -> ProjectState:
    """Agent 1: Requirements Analyst"""
    project_idea = state.get("project_idea", "")
    api_key = state.get("api_key")
    
    input_context = f"Raw Project Idea: '{project_idea}'"
    
    user_prompt = f"""
ROLE: {AGENT_ROLE}
GOAL: {AGENT_GOAL}
INPUT: {input_context}

REASONING TASK:
1. Deeply analyze the raw project idea to understand the project objective.
2. Identify target user groups.
3. Extract functional requirements (what system must do).
4. Extract non-functional requirements (performance, availability, security, usability).
5. Highlight key core features.
6. Identify practical constraints or scope limits.

OUTPUT FORMAT:
Return a JSON object with:
{{
  "project_title": "Concise Name",
  "objective": "Detailed objective string",
  "target_users": ["User group 1", "User group 2"],
  "functional_requirements": ["Req 1", "Req 2"],
  "non_functional_requirements": ["Non-func 1", "Non-func 2"],
  "key_features": ["Feature 1", "Feature 2"],
  "constraints": ["Constraint 1", "Constraint 2"]
}}
"""
    logger.info("Executing Requirement Agent...")
    output = call_llm_structured(
        system_role=f"You are a Senior {AGENT_ROLE}. Analyze project ideas thoroughly and output valid JSON.",
        user_prompt=user_prompt,
        output_schema_name="RequirementOutput",
        api_key=api_key
    )

    log_entry = {
        "agent_id": "agent_1",
        "agent_name": "Requirement Agent",
        "role": AGENT_ROLE,
        "goal": AGENT_GOAL,
        "input_context": input_context,
        "prompt": user_prompt.strip(),
        "output": output,
        "status": "completed"
    }

    logs = state.get("agent_logs", [])
    logs.append(log_entry)

    state["requirements"] = output
    state["agent_logs"] = logs
    state["current_agent"] = "Requirement Agent"
    return state
