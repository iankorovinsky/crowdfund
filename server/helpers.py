import os

def copy_env_to_tmp():
    if not os.path.exists('.env'):
        print('No .env file found')
        return

    os.makedirs('/tmp/crowdfund', exist_ok=True)

    with open('.env', 'r') as f:
        with open('/tmp/crowdfund/.env', 'w') as f2:
            f2.write(f.read())