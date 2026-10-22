import json
import logging
import asyncio
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import Optional

import sys
from pathlib import Path

# Add project root to sys.path so 'backend' module imports succeed from any directory
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.models.schemas import GeneratePlanRequest, CompletePlanResponse
from backend.workflow.graph import workflow
from backend.services.db_service import init_db, save_plan, get_all_plans, get_plan_by_id

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("MainServer")

app = FastAPI(
    title="AI-Powered Project Planning Assistant API",
    description="Multi-Agent Project Planning System built with FastAPI and LangGraph",
    version="1.0.0"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "AI-Powered Project Planning Assistant"}

@app.post("/api/generate-plan", response_model=CompletePlanResponse)
async def generate_plan(request: GeneratePlanRequest):
    """
    Executes the 5-agent LangGraph workflow synchronously and returns the consolidated project plan.
    """
    project_idea = request.project_idea.strip()
    if not project_idea:
        raise HTTPException(status_code=400, detail="Project idea cannot be empty.")

    initial_state = {
        "project_idea": project_idea,
        "api_key": request.api_key,
        "requirements": None,
        "architecture": None,
        "technology_stack": None,
        "tasks": None,
        "execution_plan": None,
        "agent_logs": [],
        "current_agent": None,
        "error": None
    }

    try:
        final_state = workflow.invoke(initial_state)
        
        # Save to SQLite database
        project_id = save_plan(
            project_idea=project_idea,
            requirements=final_state.get("requirements", {}),
            architecture=final_state.get("architecture", {}),
            technology=final_state.get("technology_stack", {}),
            tasks=final_state.get("tasks", {}),
            execution_plan=final_state.get("execution_plan", {}),
            agent_logs=final_state.get("agent_logs", [])
        )

        return CompletePlanResponse(
            project_id=project_id,
            project_idea=project_idea,
            requirements=final_state.get("requirements", {}),
            architecture=final_state.get("architecture", {}),
            technology=final_state.get("technology_stack", {}),
            tasks=final_state.get("tasks", {}),
            execution_plan=final_state.get("execution_plan", {}),
            agent_logs=final_state.get("agent_logs", [])
        )
    except Exception as e:
        logger.error(f"Error in generate_plan endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate project plan: {str(e)}")


@app.get("/api/generate-plan-stream")
async def generate_plan_stream(project_idea: str, api_key: Optional[str] = None):
    """
    Streams SSE (Server-Sent Events) step-by-step as each agent executes in the LangGraph graph.
    """
    project_idea = project_idea.strip()
    if not project_idea:
        raise HTTPException(status_code=400, detail="Project idea cannot be empty.")

    async def event_generator():
        initial_state = {
            "project_idea": project_idea,
            "api_key": api_key,
            "requirements": None,
            "architecture": None,
            "technology_stack": None,
            "tasks": None,
            "execution_plan": None,
            "agent_logs": [],
            "current_agent": None,
            "error": None
        }

        agent_mapping = [
            ("requirement_agent", "agent_1", "Requirement Agent", "Requirements Analyst", "Analyzing project requirements..."),
            ("architecture_agent", "agent_2", "Architecture Agent", "System Architect", "Designing system architecture..."),
            ("technology_agent", "agent_3", "Technology Agent", "Technology Consultant", "Selecting technology stack..."),
            ("task_agent", "agent_4", "Task Agent", "Development Task Planner", "Breaking project into tasks..."),
            ("planning_agent", "agent_5", "Planning Agent", "Project Planner", "Creating execution plan...")
        ]

        queue = asyncio.Queue()
        loop = asyncio.get_running_loop()

        def run_graph_sync():
            try:
                for step in workflow.stream(initial_state):
                    node_name = list(step.keys())[0]
                    state_val = step[node_name]
                    loop.call_soon_threadsafe(queue.put_nowait, ("step", node_name, state_val))
                loop.call_soon_threadsafe(queue.put_nowait, ("complete", None, None))
            except Exception as ex:
                logger.error(f"LangGraph execution error: {ex}", exc_info=True)
                loop.call_soon_threadsafe(queue.put_nowait, ("error", str(ex), None))

        # Run LangGraph execution off main async loop
        loop.run_in_executor(None, run_graph_sync)

        node_index = 0
        final_state = initial_state

        # Yield start event for the first agent immediately
        if node_index < len(agent_mapping):
            _, node_id, name, role, msg = agent_mapping[node_index]
            yield f"data: {json.dumps({'type': 'agent_start', 'agent_id': node_id, 'agent_name': name, 'role': role, 'message': msg})}\n\n"

        while True:
            evt_type, payload1, payload2 = await queue.get()
            if evt_type == "complete":
                break
            elif evt_type == "error":
                yield f"data: {json.dumps({'type': 'agent_error', 'error': payload1})}\n\n"
                break
            elif evt_type == "step":
                node_name = payload1
                final_state = payload2

                matched = next((m for m in agent_mapping if m[0] == node_name), None)
                if matched:
                    _, node_id, name, role, msg = matched
                    log_entry = final_state.get("agent_logs", [])[-1] if final_state.get("agent_logs") else {}
                    yield f"data: {json.dumps({'type': 'agent_complete', 'agent_id': node_id, 'agent_name': name, 'output': log_entry.get('output', {})})}\n\n"

                    node_index += 1
                    if node_index < len(agent_mapping):
                        _, next_id, next_name, next_role, next_msg = agent_mapping[node_index]
                        yield f"data: {json.dumps({'type': 'agent_start', 'agent_id': next_id, 'agent_name': next_name, 'role': next_role, 'message': next_msg})}\n\n"

        # Save generated plan to database
        project_id = save_plan(
            project_idea=project_idea,
            requirements=final_state.get("requirements", {}),
            architecture=final_state.get("architecture", {}),
            technology=final_state.get("technology_stack", {}),
            tasks=final_state.get("tasks", {}),
            execution_plan=final_state.get("execution_plan", {}),
            agent_logs=final_state.get("agent_logs", [])
        )

        complete_plan = {
            "project_id": project_id,
            "project_idea": project_idea,
            "requirements": final_state.get("requirements", {}),
            "architecture": final_state.get("architecture", {}),
            "technology": final_state.get("technology_stack", {}),
            "tasks": final_state.get("tasks", {}),
            "execution_plan": final_state.get("execution_plan", {}),
            "agent_logs": final_state.get("agent_logs", [])
        }

        yield f"data: {json.dumps({'type': 'workflow_complete', 'plan': complete_plan})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.get("/api/plans")
def list_plans():
    """Returns list of past generated project plans."""
    return get_all_plans()


@app.get("/api/plans/{plan_id}")
def get_plan(plan_id: str):
    """Returns detailed plan by ID."""
    plan = get_plan_by_id(plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan


from fastapi import Response
from backend.services.pdf_service import generate_plan_pdf

@app.post("/api/download-pdf")
async def download_pdf(plan_data: dict):
    """
    Generates and returns a downloadable PDF report for the project plan.
    """
    try:
        pdf_bytes = generate_plan_pdf(plan_data)
        title = plan_data.get("requirements", {}).get("project_title", "project_plan").replace(" ", "_")
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={title}.pdf"
            }
        )
    except Exception as e:
        logger.error(f"Error generating PDF: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

