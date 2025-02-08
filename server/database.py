import sqlite3
from typing import List, Dict, Any
import os
import random

DATABASE_DIR = os.path.join(os.path.dirname(__file__), 'data')
DATABASE_PATH = os.path.join(DATABASE_DIR, 'workflows.db')

AVAILABLE_ICONS = ["brain", "bot", "coins", "code", "link", "workflow", "gitBranch"]

def migrate_db():
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # Check if icon and hash columns exist
    cursor.execute("PRAGMA table_info(agents)")
    columns = cursor.fetchall()
    has_icon = any(col[1] == 'icon' for col in columns)
    has_hash = any(col[1] == 'hash' for col in columns)
    
    if not has_icon:
        # Add icon column
        cursor.execute('ALTER TABLE agents ADD COLUMN icon TEXT')
        
        # Update existing rows with random icons
        cursor.execute('SELECT id FROM agents')
        agent_ids = cursor.fetchall()
        
        for (agent_id,) in agent_ids:
            random_icon = random.choice(AVAILABLE_ICONS)
            cursor.execute('UPDATE agents SET icon = ? WHERE id = ?', (random_icon, agent_id))
    
    if not has_hash:
        # Add hash column
        cursor.execute('ALTER TABLE agents ADD COLUMN hash TEXT')

        # Update existing rows with random icons
        cursor.execute('SELECT id FROM agents')
        agent_ids = cursor.fetchall()
        dummy_hash = "0x0e14A1BB6Fa84d12f077A8C352E8114A53a1d5ab"
        
        for (agent_id,) in agent_ids:
            cursor.execute('UPDATE agents SET hash = ? WHERE id = ?', (dummy_hash, agent_id))
    
    conn.commit()
    conn.close()

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
            output TEXT,
            icon TEXT,
            hash TEXT
        )
    ''')
    conn.commit()
    conn.close()
    
    # Run migration to handle existing data
    migrate_db()

def create_agent(agent_id: str, agent_type: str, label: str, description: str, input: str, output: str, icon: str):
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO agents (id, type, label, description, input, output, icon) VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (agent_id, agent_type, label, description, input, output, icon))
    conn.commit()
    conn.close()

def get_agent(agent_id: str) -> Dict[str, Any]:
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, type, label, description, input, output, icon, hash FROM agents WHERE id = ?
    ''', (agent_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {"id": row[0], "type": row[1], "label": row[2], "description": row[3], "input": row[4], "output": row[5], "icon": row[6], "hash": row[7]}
    return {}

def get_all_agents() -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, type, label, description, input, output, icon, hash FROM agents
    ''')
    rows = cursor.fetchall()
    conn.close()
    return [{"id": row[0], "type": row[1], "label": row[2], "description": row[3], "input": row[4], "output": row[5], "icon": row[6], "hash": row[7]} for row in rows]

def update_agent_type(agent_id: str, agent_type: str):
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE agents SET type = ? WHERE id = ?
    ''', (agent_type, agent_id))
    conn.commit()
    conn.close()

def update_agent_label(agent_id: str, label: str):
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE agents SET label = ? WHERE id = ?
    ''', (label, agent_id))
    conn.commit()
    conn.close()

def update_agent_hash(agent_id: str, hash: str):
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE agents SET hash = ? WHERE id = ?",
        (hash, agent_id)
    )
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