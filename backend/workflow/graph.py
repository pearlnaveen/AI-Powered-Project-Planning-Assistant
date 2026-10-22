import logging
from langgraph.graph import StateGraph, START, END
from backend.models.schemas import ProjectState
from backend.agents.requirement_agent import run_requirement_agent
from backend.agents.architecture_agent import run_architecture_agent
from backend.agents.technology_agent import run_technology_agent
from backend.agents.task_agent import run_task_agent
from backend.agents.planning_agent import run_planning_agent

logger = logging.getLogger("WorkflowGraph")

def create_workflow_graph():
    """Constructs the sequential 5-agent LangGraph execution graph."""
    builder = StateGraph(ProjectState)

    # 1. Add Agent Nodes
    builder.add_node("requirement_agent", run_requirement_agent)
    builder.add_node("architecture_agent", run_architecture_agent)
    builder.add_node("technology_agent", run_technology_agent)
    builder.add_node("task_agent", run_task_agent)
    builder.add_node("planning_agent", run_planning_agent)

    # 2. Add Sequential Edges
    builder.add_edge(START, "requirement_agent")
    builder.add_edge("requirement_agent", "architecture_agent")
    builder.add_edge("architecture_agent", "technology_agent")
    builder.add_edge("technology_agent", "task_agent")
    builder.add_edge("task_agent", "planning_agent")
    builder.add_edge("planning_agent", END)

    # 3. Compile Graph
    return builder.compile()

# Instantiated graph compiled object
workflow = create_workflow_graph()
