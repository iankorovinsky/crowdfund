import sqlite3
from typing import List, Dict, Any
import os

DATABASE_DIR = os.path.join(os.path.dirname(__file__), 'data')
DATABASE_PATH = os.path.join(DATABASE_DIR, 'workflows.db')

def initialize_db():
    os.makedirs(DATABASE_DIR, exist_ok=True)
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS agents (
            id TEXT PRIMARY KEY,
            type TEXT,
            label TEXT,
            description TEXT,
            input TEXT,
            output TEXT
        )
    ''')
    conn.commit()
    conn.close()

def create_agent(agent_id: str, agent_type: str, label: str, description: str, input: str, output: str):
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO agents (id, type, label, description, input, output) VALUES (?, ?, ?, ?, ?, ?)
    ''', (agent_id, agent_type, label, description, input, output))
    conn.commit()
    conn.close()

def get_agent(agent_id: str) -> Dict[str, Any]:
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, type, label, description, input, output FROM agents WHERE id = ?
    ''', (agent_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {"id": row[0], "type": row[1], "label": row[2], "description": row[3], "input": row[4], "output": row[5]}
    return {}

def get_all_agents() -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, type, label, description, input, output FROM agents
    ''')
    rows = cursor.fetchall()
    conn.close()
    return [{"id": row[0], "type": row[1], "label": row[2], "description": row[3], "input": row[4], "output": row[5]} for row in rows]

def update_agent_type(agent_id: str, agent_type: str):
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE agents SET type = ? WHERE id = ?
    ''', (agent_type, agent_id))
    conn.commit()
    conn.close()

def delete_agent(agent_id: str):
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        DELETE FROM agents WHERE id = ?
    ''', (agent_id,))
    conn.commit()
    conn.close()