import json
import logging
from typing import Dict, Any
from backend.models.schemas import ProjectState
from backend.services.llm_service import call_llm_structured

logger = logging.getLogger("TechnologyAgent")

AGENT_ROLE = "Technology Consultant"
AGENT_GOAL = "Recommend an appropriate technology stack based on the project requirements and high-level architecture."

def run_technology_agent(state: ProjectState) -> ProjectState:
    """Agent 3: Technology Consultant"""
    project_idea = state.get("project_idea", "")
    requirements = state.get("requirements", {})
    architecture = state.get("architecture", {})
    api_key = state.get("api_key")
    
    input_context = f"Raw Idea: {project_idea}\n\nRequirements:\n{json.dumps(requirements, indent=2)}\n\nArchitecture:\n{json.dumps(architecture, indent=2)}"
    
    user_prompt = f"""
ROLE: {AGENT_ROLE}
GOAL: {AGENT_GOAL}
INPUT:
Raw Idea: {project_idea}
Requirements Context:
{json.dumps(requirements, indent=2)}

Architecture Context:
{json.dumps(architecture, indent=2)}

REASONING TASK:
1. Evaluate the requirements and architecture designed by previous agents.
2. Select appropriate, modern, yet student-friendly tech stack choices for:
   - Frontend
   - Backend
   - Database
   - AI / ML / Data Processing (if applicable)
   - Additional helper tools / libraries
3. For EVERY recommendation, provide a concrete, specific reason tailored to this project's needs.
4. Do NOT blindly default to a static stack; justify choices based on the specific project idea.

OUTPUT FORMAT:
Return a JSON object with:
{{
  "frontend": {{ "technology": "Tech Name", "reason": "Detailed rationale" }},
  "backend": {{ "technology": "Tech Name", "reason": "Detailed rationale" }},
  "database": {{ "technology": "Tech Name", "reason": "Detailed rationale" }},
  "ai_ml": {{ "technology": "Tech Name", "reason": "Detailed rationale" }},
  "additional_tools": [
    {{ "technology": "Tool Name", "reason": "Rationale" }}
  ]
}}
"""
    logger.info("Executing Technology Agent...")
    output = call_llm_structured(
        system_role=f"You are an expert {AGENT_ROLE}. Provide tailored technology recommendations with clear justifications.",
        user_prompt=user_prompt,
        output_schema_name="TechnologyOutput",
        api_key=api_key
    )

    log_entry = {
        "agent_id": "agent_3",
        "agent_name": "Technology Agent",
        "role": AGENT_ROLE,
        "goal": AGENT_GOAL,
        "input_context": input_context,
        "prompt": user_prompt.strip(),
        "output": output,
        "status": "completed"
    }

    logs = state.get("agent_logs", [])
    logs.append(log_entry)

    state["technology_stack"] = output
    state["agent_logs"] = logs
    state["current_agent"] = "Technology Agent"
    return state
