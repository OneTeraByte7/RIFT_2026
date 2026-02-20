# Render.com deployment configuration

## Environment Variables to Set in Render Dashboard:
GROQ_API_KEY=your_groq_key_here
GITHUB_TOKEN=your_github_token_here
PYTHON_VERSION=3.11
GIT_USER_NAME=AI-Agent
GIT_USER_EMAIL=ai@healing.dev

## Build Command:
pip install -r requirements.txt

## Start Command (Choose one):

# Option 1: Direct uvicorn (RECOMMENDED for Render)
uvicorn api.main:app --host 0.0.0.0 --port $PORT --log-level info --no-access-log

# Option 2: With access logs (more verbose)
uvicorn api.main:app --host 0.0.0.0 --port $PORT --log-level info --access-log

# Option 3: Python module
python -m uvicorn api.main:app --host 0.0.0.0 --port $PORT --log-level info

## For Better Logging on Render:
# Add this to Render environment variables:
PYTHONUNBUFFERED=1
LOG_LEVEL=INFO
