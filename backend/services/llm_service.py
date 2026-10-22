import json
import logging
import re
from typing import Dict, Any, Optional
from langchain_ollama import ChatOllama
from backend.config import OLLAMA_MODEL, OLLAMA_BASE_URL

logger = logging.getLogger("LLMService")

def clean_json(text: str) -> Dict[str, Any]:
    """Strips code fences or extracts JSON object substring and parses it."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s*```$", "", text)

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    start = text.find("{")
    end = text.rfind("}")

    if start != -1 and end != -1:
        try:
            return json.loads(text[start:end + 1])
        except json.JSONDecodeError:
            pass

    raise ValueError("Model did not return valid JSON.")


def call_llm_structured(
    system_role: str,
    user_prompt: str,
    output_schema_name: str,
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Calls local ChatOllama model (qwen2.5:7b) for structured JSON output.
    If local Ollama service is unreachable or model missing, uses domain fallback engine.
    """
    prompt = f"""SYSTEM ROLE: {system_role}

{user_prompt}

CRITICAL: Return ONLY valid raw JSON string without markdown code fences or commentary."""

    try:
        llm = ChatOllama(
            model=OLLAMA_MODEL,
            base_url=OLLAMA_BASE_URL,
            temperature=0.2
        )
        response = llm.invoke(prompt)

        if isinstance(response.content, list):
            text = "".join(
                item.get("text", "")
                for item in response.content
                if isinstance(item, dict)
            )
        else:
            text = str(response.content)

        parsed = clean_json(text)
        if parsed and isinstance(parsed, dict):
            logger.info(f"Ollama ({OLLAMA_MODEL}) successfully generated structured output for {output_schema_name}")
            return parsed
    except Exception as e:
        err_str = str(e).lower()
        if "connection" in err_str or "11434" in err_str or "refused" in err_str:
            logger.warning("Local Ollama service is not running. Please start Ollama and try again.")
        elif "not found" in err_str or "404" in err_str:
            logger.warning(f"Ollama model {OLLAMA_MODEL} is not installed. Run: ollama pull {OLLAMA_MODEL}")
        else:
            logger.warning(f"Ollama call exception: {e}")

    # Domain-aware fallback engine if Ollama is offline/pulling
    logger.info(f"Using dynamic fallback engine for agent {output_schema_name}")
    return _generate_heuristic_fallback(output_schema_name, user_prompt)


def _generate_heuristic_fallback(schema_name: str, context_text: str) -> Dict[str, Any]:
    """
    Domain-aware fallback generator that creates structured JSON custom-tailored
    to the user's project idea when Ollama is starting up or pulling models.
    """
    raw_idea_match = re.search(r'Raw Idea:\s*([^\n]+)', context_text, re.IGNORECASE)
    if raw_idea_match:
        user_idea = raw_idea_match.group(1).strip()
    else:
        title_match = re.search(r'"project_title":\s*"([^"]+)"', context_text)
        if title_match:
            user_idea = title_match.group(1).strip()
        else:
            user_idea = context_text.strip()

    idea_lower = user_idea.lower()
    full_text_lower = context_text.lower()
    
    # Detect tech stack hints
    if "springboot" in idea_lower or "spring boot" in idea_lower or "java" in idea_lower:
        backend_tech_name = "Java (Spring Boot)"
        backend_tech_reason = "Industry-standard enterprise framework offering high performance, dependency injection, and microservice readiness."
        server_comp = "Spring Boot Application Server"
    elif "node" in idea_lower or "express" in idea_lower:
        backend_tech_name = "Node.js (Express)"
        backend_tech_reason = "Non-blocking event-driven I/O model ideal for real-time socket connections and REST endpoints."
        server_comp = "Node.js Express Server"
    elif "django" in idea_lower:
        backend_tech_name = "Python (Django)"
        backend_tech_reason = "Full-featured Python web framework with built-in ORM, admin panel, and robust security defaults."
        server_comp = "Django Application Server"
    else:
        backend_tech_name = "Python (FastAPI)"
        backend_tech_reason = f"Delivers high-performance REST APIs, automatic OpenAPI docs, and asynchronous processing for {user_idea}."
        server_comp = "FastAPI Application Gateway"

    clean_title = re.sub(r'^(?:build|create|develop|make|design|implement)\s+(?:a|an|the)?\s*', '', user_idea, flags=re.IGNORECASE)
    clean_title = re.sub(r'\s+using\s+.*$', '', clean_title, flags=re.IGNORECASE).strip()
    if len(clean_title) > 3:
        domain = clean_title.title()
    else:
        domain = user_idea.strip().title() if user_idea else "Software System"

    tech_type = f"{domain} System"

    if schema_name == "RequirementOutput":
        return {
            "project_title": domain,
            "objective": f"Develop an automated end-to-end {tech_type} to streamline operations, enhance observability, and provide real-time processing.",
            "target_users": [
                "Primary System Users & Operators",
                "Administrative Personnel",
                "Technical Support & Operations"
            ],
            "functional_requirements": [
                f"Provide secure authentication and access control for {domain}",
                f"Core automated data processing pipeline tailored for {domain}",
                f"Real-time status updates, alert notifications, and metric displays",
                f"Interactive admin dashboard for monitoring, filtering, and system management",
                "Exportable diagnostic reports, audit logs, and performance metrics"
            ],
            "non_functional_requirements": [
                "Low latency response time (< 2 seconds per request)",
                "99.5% operational availability and fault tolerance",
                "Responsive UI compatible with modern web browsers",
                "Data security and encrypted storage for operational records"
            ],
            "key_features": [
                f"Interactive {domain} Dashboard",
                "Role-based Access Control (RBAC)",
                f"Automated {tech_type} Engine",
                "Real-Time Alert & Monitoring Panel"
            ],
            "constraints": [
                "Academic / Prototype development timeframe (4-8 weeks)",
                "Standard open-source framework stack avoiding cloud overhead",
                "Relational or file-backed data store suitable for local execution"
            ]
        }

    elif schema_name == "ArchitectureOutput":
        return {
            "architecture_style": f"Modular Client-Server Architecture for {domain}",
            "components": [
                {
                    "name": f"{domain} Frontend Client (React)",
                    "responsibility": f"Renders interactive user interface, captures filter preferences for {domain}, displays real-time updates."
                },
                {
                    "name": server_comp,
                    "responsibility": f"Handles REST API routing, business logic, payload validation, and service orchestration for {domain}."
                },
                {
                    "name": f"{tech_type} Core Service",
                    "responsibility": f"Executes specialized filtering, parsing, data transformation, or alert evaluation for {domain}."
                },
                {
                    "name": f"{domain} Database",
                    "responsibility": f"Persists structured user records, configuration metadata, and historical metrics for {domain}."
                }
            ],
            "data_flow": [
                f"1. User transmits action/payload via {domain} Frontend Client.",
                f"2. {server_comp} validates request and processes JSON records.",
                f"3. {tech_type} Core Service executes business logic and computes metrics.",
                f"4. Database persists records and state metadata for {domain}.",
                "5. Frontend receives processed payload and updates interactive views."
            ],
            "architecture_description": f"The architecture for '{domain}' utilizes a modular 3-tier design separating UI presentation (React), backend controllers ({backend_tech_name}), and database engines. This design ensures clear separation of concerns, high throughput, and simple local execution."
        }

    elif schema_name == "TechnologyOutput":
        return {
            "frontend": {
                "technology": "React.js + Vite",
                "reason": f"Offers fast component-based rendering and reactive state management ideal for {domain} UI."
            },
            "backend": {
                "technology": backend_tech_name,
                "reason": backend_tech_reason
            },
            "database": {
                "technology": "SQLite / PostgreSQL",
                "reason": f"Provides reliable relational storage for all {domain} records, settings, and user accounts."
            },
            "ai_ml": {
                "technology": "Ollama + Qwen2.5:7b (Local LLM)",
                "reason": f"Provides local AI inference, requirement processing, and intelligent analysis for {domain}."
            },
            "additional_tools": [
                {
                    "technology": "LangChain + LangGraph",
                    "reason": "Agentic state graph orchestration for sequential task execution."
                },
                {
                    "technology": "ReportLab PDF Engine",
                    "reason": "Exportable PDF documentation for project plans."
                }
            ]
        }

    elif schema_name == "TaskOutput":
        return {
            "tasks": [
                {
                    "id": "T1",
                    "title": f"Initialize {domain} Repository & Dependencies",
                    "description": "Set up project directory layout, virtual environment, and dependency manifests.",
                    "priority": "High",
                    "phase": "Phase 1: Setup & Core Infrastructure",
                    "dependencies": []
                },
                {
                    "id": "T2",
                    "title": f"Design & Deploy {domain} Database Schema",
                    "description": f"Configure relational tables for {domain} users, entities, and operational logs.",
                    "priority": "High",
                    "phase": "Phase 1: Setup & Core Infrastructure",
                    "dependencies": ["T1"]
                },
                {
                    "id": "T3",
                    "title": f"Implement REST API Endpoints for {domain}",
                    "description": f"Build backend endpoints for input validation, user workflows, and CRUD operations for {domain}.",
                    "priority": "Medium",
                    "phase": "Phase 2: Backend Development",
                    "dependencies": ["T2"]
                },
                {
                    "id": "T4",
                    "title": f"Develop {tech_type} Core Service Engine",
                    "description": f"Integrate core business logic, Ollama LLM pipelines, and output parsers for {domain}.",
                    "priority": "High",
                    "phase": "Phase 3: Core Integration",
                    "dependencies": ["T3"]
                },
                {
                    "id": "T5",
                    "title": f"Build React UI Dashboard for {domain}",
                    "description": f"Create responsive user interface components, forms, status cards, and panels for {domain}.",
                    "priority": "High",
                    "phase": "Phase 4: Frontend Development",
                    "dependencies": ["T3"]
                },
                {
                    "id": "T6",
                    "title": f"Connect Frontend to {domain} API Endpoints",
                    "description": "Wire client HTTP requests, state management, and real-time event updates between React and FastAPI.",
                    "priority": "Medium",
                    "phase": "Phase 4: Frontend Development",
                    "dependencies": ["T4", "T5"]
                },
                {
                    "id": "T7",
                    "title": f"System Verification & Polish for {domain}",
                    "description": f"Perform end-to-end integration testing, boundary checks, UI polishing, and performance verification for {domain}.",
                    "priority": "High",
                    "phase": "Phase 5: Testing & Release",
                    "dependencies": ["T6"]
                }
            ]
        }

    elif schema_name == "PlanningOutput":
        return {
            "phases": [
                {
                    "name": "Phase 1: Setup & Core Infrastructure",
                    "objective": f"Establish baseline repository, database models, and workspace configuration for {domain}.",
                    "tasks": ["T1", "T2"],
                    "deliverable": f"Operational backend setup with working database connection for {domain}."
                },
                {
                    "name": "Phase 2: Backend Development",
                    "objective": f"Build operational logic, REST controllers, and endpoints for {domain}.",
                    "tasks": ["T3"],
                    "deliverable": f"Fully documented API endpoints ready for {domain} integrations."
                },
                {
                    "name": "Phase 3: Core Integration",
                    "objective": f"Implement {tech_type} pipeline, prompt handlers, and local Ollama model inference for {domain}.",
                    "tasks": ["T4"],
                    "deliverable": f"Functional core service returning structured output for {domain}."
                },
                {
                    "name": "Phase 4: Frontend Development",
                    "objective": f"Construct interactive React interface, architecture views, and dashboards for {domain}.",
                    "tasks": ["T5", "T6"],
                    "deliverable": f"Responsive React dashboard integrated with the {domain} backend."
                },
                {
                    "name": "Phase 5: Testing & Release",
                    "objective": f"Validate end-to-end workflow, edge cases, error handling, and performance for {domain}.",
                    "tasks": ["T7"],
                    "deliverable": f"Production-ready {domain} application with complete project documentation."
                }
            ],
            "milestones": [
                f"M1: Infrastructure & Database Established for {domain} (Week 1)",
                f"M2: Backend API & {tech_type} Logic Operational (Week 2)",
                f"M3: Frontend UI Connected & Interactive (Week 3)",
                f"M4: Final Testing & Demonstration for {domain} (Week 4)"
            ],
            "risks": [
                {
                    "risk": f"Local LLM inference speed or RAM constraints during {domain} execution",
                    "mitigation": "Use quantized qwen2.5:7b model with local fallback caching and prompt optimizations."
                },
                {
                    "risk": f"Integration bottlenecks between Frontend UI and {domain} service",
                    "mitigation": "Enforce strict Pydantic JSON schemas and mock contracts during parallel development."
                },
                {
                    "risk": "Scope expansion during project implementation",
                    "mitigation": "Maintain clear phase deliverables and stick to essential functional requirements."
                }
            ],
            "execution_summary": f"The development plan for '{domain}' is structured into 5 sequential phases across 4 weekly milestones. By combining FastAPI, React, and local Ollama inference, the system guarantees high privacy, clean separation of concerns, and rapid delivery."
        }

    return {}
