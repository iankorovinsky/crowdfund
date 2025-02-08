from typing import Tuple
import os

def copy_env_to_tmp():
    if not os.path.exists('.env'):
        print('No .env file found')
        return

    os.makedirs('/tmp/crowdfund', exist_ok=True)

    with open('.env', 'r') as f:
        with open('/tmp/crowdfund/.env', 'w') as f2:
            f2.write(f.read())

def get_node_input_and_output(node_type: str) -> Tuple[str, str]:
    if node_type == 'Market Data':
        return 'symbol', 'market_data'
    elif node_type == 'Financial Analysis':
        return 'market_data', 'analysis'
    elif node_type == 'Portfolio Manager':
        return 'analysis', 'decision'
    else:
        # Default case for unknown node types
        return 'input', 'output'  # Generic input/output names for unknown types