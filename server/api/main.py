"""
FastAPI Backend
Provides REST API for the React dashboard to trigger agent runs
and stream real-time results
"""

import os
import json
import asyncio
import logging
import platform
import tempfile
from typing import Dict, Any, Optional
from datetime import datetime
from pathlib import Path

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, HttpUrl
import uvicorn

# Add parent to path
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Fix for Windows subprocess support
if platform.system() == 'Windows':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from agents.orchestrator import CICDHealingOrchestrator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="CI/CD Healing Agent API",
    description="Autonomous CI/CD pipeline healing agent with multi-agent architecture",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    """Set Windows event loop policy on startup"""
    if platform.system() == 'Windows':
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
        logger.info("Windows ProactorEventLoop policy set")

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        os.getenv("FRONTEND_URL", "*"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store for run results (use Redis in production)
run_results: Dict[str, Any] = {}
run_progress: Dict[str, list] = {}

# Global orchestrator
orchestrator = CICDHealingOrchestrator()


class RunAgentRequest(BaseModel):
    repo_url: str
    team_name: str
    leader_name: str


class RunStatus(BaseModel):
    run_id: str
    status: str
    progress: list
    result: Optional[Dict[str, Any]] = None


@app.get("/")
async def root():
    return {"status": "running", "service": "CI/CD Healing Agent API v1.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.post("/api/run")
async def run_agent(request: RunAgentRequest, background_tasks: BackgroundTasks):
    """
    Trigger the CI/CD healing agent.
    Returns run_id immediately, agent runs in background.
    """
    import time
    run_id = f"run_{int(time.time() * 1000)}"
    
    run_results[run_id] = {
        "status": "RUNNING",
        "started_at": datetime.now().isoformat(),
        "repo_url": request.repo_url,
        "team_name": request.team_name,
        "leader_name": request.leader_name,
    }
    run_progress[run_id] = []
    
    background_tasks.add_task(
        _run_agent_task,
        run_id,
        request.repo_url,
        request.team_name,
        request.leader_name
    )
    
    return {"run_id": run_id, "status": "RUNNING", "message": "Agent started"}


@app.get("/api/run/{run_id}")
async def get_run_status(run_id: str):
    """Get current status of a run"""
    if run_id not in run_results:
        raise HTTPException(status_code=404, detail="Run not found")
    
    return {
        "run_id": run_id,
        **run_results[run_id],
        "progress": run_progress.get(run_id, [])
    }


@app.get("/api/run/{run_id}/stream")
async def stream_run_progress(run_id: str):
    """
    Server-Sent Events stream for real-time progress updates
    Frontend subscribes to this for live updates
    """
    async def event_generator():
        last_count = 0
        
        while True:
            if run_id not in run_results:
                yield f"data: {json.dumps({'error': 'Run not found'})}\n\n"
                break
            
            current_status = run_results[run_id]
            messages = run_progress.get(run_id, [])
            
            # Send new messages
            for msg in messages[last_count:]:
                yield f"data: {json.dumps({'type': 'progress', 'message': msg})}\n\n"
            last_count = len(messages)
            
            # Send status update
            yield f"data: {json.dumps({'type': 'status', 'data': current_status})}\n\n"
            
            if current_status["status"] in ["COMPLETED", "FAILED", "ERROR"]:
                yield f"data: {json.dumps({'type': 'done', 'data': current_status})}\n\n"
                break
            
            await asyncio.sleep(1)
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no"
        }
    )


@app.get("/api/results")
async def get_all_results():
    """Get all run results"""
    return {
        "runs": [
            {"run_id": k, **v, "progress_count": len(run_progress.get(k, []))}
            for k, v in run_results.items()
        ]
    }


@app.delete("/api/run/{run_id}")
async def cancel_run(run_id: str):
    """Cancel a running agent"""
    if run_id not in run_results:
        raise HTTPException(status_code=404, detail="Run not found")
    
    run_results[run_id]["status"] = "CANCELLED"
    return {"message": "Run cancelled"}


async def _run_agent_task(run_id: str, repo_url: str, team_name: str, leader_name: str):
    """Background task that runs the full agent pipeline"""
    
    # Ensure Windows event loop policy is set in this task's context
    if platform.system() == 'Windows':
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    
    def log_progress(msg: str):
        run_progress[run_id].append({
            "timestamp": datetime.now().isoformat(),
            "message": msg
        })
    
    try:
        log_progress(f"Starting CI/CD healing agent for {repo_url}")
        log_progress(f"Team: {team_name} | Leader: {leader_name}")
        
        result = await orchestrator.run(repo_url, team_name, leader_name)
        
        # Update with full results
        run_results[run_id].update({
            "status": "COMPLETED",
            "completed_at": datetime.now().isoformat(),
            "result": result,
            "branch_name": result.get("branch_name"),
            "total_failures": result.get("total_failures", 0),
            "total_fixes": result.get("total_fixes", 0),
            "final_status": result.get("final_status"),
            "score": result.get("score"),
            "fixes_applied": result.get("fixes_applied", []),
            "cicd_runs": result.get("cicd_runs", []),
        })
        
        log_progress(f"Completed! Status: {result.get('final_status')}")
        
        # Save results.json
        save_results_file(run_id, result)
    
    except Exception as e:
        logger.error(f"Agent run failed: {e}", exc_info=True)
        run_results[run_id].update({
            "status": "ERROR",
            "error": str(e),
            "completed_at": datetime.now().isoformat()
        })
        log_progress(f"Error: {str(e)}")


def save_results_file(run_id: str, result: Dict[str, Any]):
    """Save results.json as required by spec"""
    default_dir = os.path.join(tempfile.gettempdir(), "results") if platform.system() == 'Windows' else "/tmp/results"
    results_dir = os.getenv("RESULTS_DIR", default_dir)
    os.makedirs(results_dir, exist_ok=True)
    
    results_path = os.path.join(results_dir, f"results_{run_id}.json")
    with open(results_path, "w") as f:
        json.dump(result, f, indent=2, default=str)
    
    # Also save latest
    latest_path = os.path.join(results_dir, "results_latest.json")
    with open(latest_path, "w") as f:
        json.dump(result, f, indent=2, default=str)
    
    logger.info(f"Results saved to {results_path}")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=os.getenv("ENV", "production") == "development",
        log_level="info"
    )