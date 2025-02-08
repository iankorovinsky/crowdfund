import subprocess
import json
from typing import Tuple
import os
from dotenv import load_dotenv

load_dotenv()

def run_typescript_mint(title: str, description: str) -> Tuple[bool, str]:
    """
    Execute the TypeScript mintAndRegisterIp function through Node.js
    
    Args:
        title (str): Title of the IP asset
        description (str): Description of the IP asset
        
    Returns:
        Tuple[bool, str]: Success status and result/error message
    """
    try:
        # Construct the Node.js command to execute the TypeScript file
        # Note: Make sure ts-node is installed globally or in the project
        command = [
            "npx", "ts-node",
            "simpleMintAndRegisterSpg.ts",
            title,
            description
        ]
        
        # Execute the command
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            cwd=os.path.dirname(os.path.abspath(__file__))  # Execute in the server directory
        )
        
        if result.returncode == 0:
            return True, result.stdout.strip()
        else:
            return False, f"Error executing TypeScript: {result.stderr}"
            
    except Exception as e:
        return False, f"Error: {str(e)}"

if __name__ == "__main__":
    # Example usage
    success, result = run_typescript_mint("Test Running Full", "Test Running Full")
    print(f"Success: {success}")
    print(f"Result: {result}") 