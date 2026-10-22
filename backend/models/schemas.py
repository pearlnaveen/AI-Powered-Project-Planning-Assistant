from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from typing_extensions import TypedDict

# Agent 1: Requirements Analyst Schemas
class RequirementOutput(BaseModel):
    project_title: str = Field(description="Clear and concise project title")
    objective: str = Field(description="Primary objective of the software project")
    target_users: List[str] = Field(description="Primary target user personas or groups")
    functional_requirements: List[str] = Field(description="List of functional requirements")
    non_functional_requirements: List[str] = Field(description="List of non-functional requirements like security, performance, scalability")
    key_features: List[str] = Field(description="Key core features of the system")
    constraints: List[str] = Field(description="Known constraints or limitations (academic scope, budget, tech)")

# Agent 2: Architecture Agent Schemas
class Component(BaseModel):
    name: str = Field(description="Component name, e.g., React Client UI, FastAPI Backend, SQLite Database")
    responsibility: str = Field(description="Specific responsibilities of this component")

class ArchitectureOutput(BaseModel):
    architecture_style: str = Field(description="High level architecture style, e.g., Client-Server Monolith, Microservices, Event-Driven")
    components: List[Component] = Field(description="List of major system components")
    data_flow: List[str] = Field(description="Step-by-step description of data flow through the system")
    architecture_description: str = Field(description="High-level narrative summarizing the system architecture")

# Agent 3: Technology Agent Schemas
class TechItem(BaseModel):
    technology: str = Field(description="Technology name, e.g., React, FastAPI, PostgreSQL, Ollama Qwen2.5")
    reason: str = Field(description="Rationale for choosing this technology for the project")

class TechnologyOutput(BaseModel):
    frontend: TechItem = Field(description="Frontend framework recommendation")
    backend: TechItem = Field(description="Backend framework recommendation")
    database: TechItem = Field(description="Database technology recommendation")
    ai_ml: TechItem = Field(description="AI/ML model or API recommendation")
    additional_tools: List[TechItem] = Field(default_factory=list, description="Additional tools, libraries or services")

# Agent 4: Task Agent Schemas
class TaskItem(BaseModel):
    id: str = Field(description="Unique task ID, e.g., T1, T2, T3")
    title: str = Field(description="Actionable task title")
    description: str = Field(description="Brief explanation of task implementation scope")
    priority: str = Field(description="High, Medium, or Low")
    phase: str = Field(description="Development phase name this task belongs to")
    dependencies: List[str] = Field(default_factory=list, description="List of dependent task IDs, e.g. ['T1']")

class TaskOutput(BaseModel):
    tasks: List[TaskItem] = Field(description="List of granular development tasks")

# Agent 5: Planning Agent Schemas
class PhaseItem(BaseModel):
    name: str = Field(description="Phase name, e.g., Phase 1: Core Foundation")
    objective: str = Field(description="Objective of this phase")
    tasks: List[str] = Field(description="Task IDs included in this phase, e.g., ['T1', 'T2']")
    deliverable: str = Field(description="Concrete deliverable produced at end of phase")

class RiskItem(BaseModel):
    risk: str = Field(description="Potential project risk")
    mitigation: str = Field(description="Proposed mitigation strategy")

class PlanningOutput(BaseModel):
    phases: List[PhaseItem] = Field(description="Sequential execution phases")
    milestones: List[str] = Field(description="Major project milestones")
    risks: List[RiskItem] = Field(description="Identified risks and mitigations")
    execution_summary: str = Field(description="Summary of overall execution plan")

# Agent Execution Log schema for academic visibility
class AgentLogItem(BaseModel):
    agent_id: str
    agent_name: str
    role: str
    goal: str
    input_context: str
    prompt: str
    output: Dict[str, Any]
    status: str = "success"

# Request & Response schemas
class GeneratePlanRequest(BaseModel):
    project_idea: str
    api_key: Optional[str] = None

class CompletePlanResponse(BaseModel):
    project_id: Optional[str] = None
    project_idea: str
    requirements: Dict[str, Any]
    architecture: Dict[str, Any]
    technology: Dict[str, Any]
    tasks: Dict[str, Any]
    execution_plan: Dict[str, Any]
    agent_logs: List[AgentLogItem]
    created_at: Optional[str] = None

# LangGraph TypedDict State
class ProjectState(TypedDict, total=False):
    project_idea: str
    api_key: Optional[str]
    requirements: Optional[Dict[str, Any]]
    architecture: Optional[Dict[str, Any]]
    technology_stack: Optional[Dict[str, Any]]
    tasks: Optional[Dict[str, Any]]
    execution_plan: Optional[Dict[str, Any]]
    agent_logs: List[Dict[str, Any]]
    current_agent: Optional[str]
    error: Optional[str]
