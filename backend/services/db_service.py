import sqlite3
import json
import uuid
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional
from backend.config import DB_PATH

logger = logging.getLogger("DBService")

def init_db():
    """Initializes the SQLite database table if it doesn't exist."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS project_plans (
                id TEXT PRIMARY KEY,
                project_idea TEXT NOT NULL,
                project_title TEXT,
                requirements TEXT NOT NULL,
                architecture TEXT NOT NULL,
                technology TEXT NOT NULL,
                tasks TEXT NOT NULL,
                execution_plan TEXT NOT NULL,
                agent_logs TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
        conn.commit()
        conn.close()
        logger.info(f"Database initialized at {DB_PATH}")
    except Exception as e:
        logger.error(f"Error initializing SQLite database: {e}")

def save_plan(
    project_idea: str,
    requirements: Dict[str, Any],
    architecture: Dict[str, Any],
    technology: Dict[str, Any],
    tasks: Dict[str, Any],
    execution_plan: Dict[str, Any],
    agent_logs: List[Dict[str, Any]]
) -> str:
    """Saves a generated project plan to SQLite database and returns the generated UUID."""
    project_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()
    project_title = requirements.get("project_title", "Software Project")
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO project_plans (
                id, project_idea, project_title, requirements, architecture, technology, tasks, execution_plan, agent_logs, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            project_id,
            project_idea,
            project_title,
            json.dumps(requirements),
            json.dumps(architecture),
            json.dumps(technology),
            json.dumps(tasks),
            json.dumps(execution_plan),
            json.dumps(agent_logs),
            created_at
        ))
        conn.commit()
        conn.close()
        return project_id
    except Exception as e:
        logger.error(f"Error saving project plan to DB: {e}")
        return project_id

def get_all_plans() -> List[Dict[str, Any]]:
    """Retrieves all past generated plans (summary view)."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, project_idea, project_title, created_at FROM project_plans ORDER BY created_at DESC
        """)
        rows = cursor.fetchall()
        conn.close()
        return [
            {
                "id": row[0],
                "project_idea": row[1],
                "project_title": row[2],
                "created_at": row[3]
            }
            for row in rows
        ]
    except Exception as e:
        logger.error(f"Error fetching plan list from DB: {e}")
        return []

def get_plan_by_id(plan_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves full project plan details by ID."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, project_idea, project_title, requirements, architecture, technology, tasks, execution_plan, agent_logs, created_at
            FROM project_plans WHERE id = ?
        """, (plan_id,))
        row = cursor.fetchone()
        conn.close()
        if row:
            return {
                "project_id": row[0],
                "project_idea": row[1],
                "project_title": row[2],
                "requirements": json.loads(row[3]),
                "architecture": json.loads(row[4]),
                "technology": json.loads(row[5]),
                "tasks": json.loads(row[6]),
                "execution_plan": json.loads(row[7]),
                "agent_logs": json.loads(row[8]),
                "created_at": row[9]
            }
        return None
    except Exception as e:
        logger.error(f"Error fetching plan {plan_id} from DB: {e}")
        return None
