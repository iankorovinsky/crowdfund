import boto3
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

s3 = boto3.resource('s3',
  endpoint_url = os.getenv('CLOUDFLARE_ENDPOINT_URL'),
  aws_access_key_id = os.getenv('CLOUDFLARE_ACCESS_KEY_ID'),
  aws_secret_access_key = os.getenv('CLOUDFLARE_ACCESS_KEY_SECRET')
)

BUCKET_NAME = os.getenv('CLOUDFLARE_BUCKET_NAME')

def create_bucket_if_not_exists(bucket_name: str):
    try:
        s3.meta.client.head_bucket(Bucket=bucket_name)
        print(f"Bucket {bucket_name} already exists.")
    except Exception as e:
        if 'Not Found' in str(e):
            s3.create_bucket(Bucket=bucket_name)
            print(f"Bucket {bucket_name} created.")
        else:
            print(f"Error checking bucket: {e}")

def upload_file_to_r2(file_path: str, key: str):
    try:
        create_bucket_if_not_exists(BUCKET_NAME)
        s3.Bucket(BUCKET_NAME).upload_file(file_path, key)
        print(f"File {file_path} uploaded to {key} in bucket {BUCKET_NAME}")
    except Exception as e:
        print(f"Error uploading file: {e}")

def list_files_in_bucket():
    try:
        bucket = s3.Bucket(BUCKET_NAME)
        return [obj.key for obj in bucket.objects.all()]
    except Exception as e:
        print(f"Error listing files: {e}")
        return []

def download_file_from_s3(key: str, download_path: str):
    try:
        s3.Bucket(BUCKET_NAME).download_file(key, download_path)
        print(f"File {key} downloaded to {download_path}")
    except Exception as e:
        print(f"Error downloading file: {e}")