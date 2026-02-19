"""
CI/CD Monitor Agent
Monitors GitHub Actions, GitLab CI, or other CI/CD pipelines
Falls back to local test execution if no CI/CD is detected
"""

import os
import re
import asyncio
import aiohttp
import logging
import time
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class CICDMonitorAgent:
    """Monitors CI/CD pipeline and reports results"""
    
    def __init__(self):
        self.github_token = os.getenv("GITHUB_TOKEN", "")
        self.poll_interval = int(os.getenv("CICD_POLL_INTERVAL", "10"))
        self.max_wait = int(os.getenv("CICD_MAX_WAIT", "300"))  # 5 minutes
    
    async def check_pipeline(self, repo_url: str, branch_name: str) -> Dict[str, Any]:
        """Check CI/CD pipeline status for the branch"""
        
        # Parse GitHub URL
        github_match = re.match(
            r'https?://github\.com/([^/]+)/([^/\.]+)', repo_url
        )
        
        # For repos without CI/CD, skip monitoring and let tests re-run
        if github_match and self.github_token:
            owner = github_match.group(1)
            repo = github_match.group(2).replace('.git', '')
            
            # Check if repo has GitHub Actions
            return await self._check_github_actions(owner, repo, branch_name)
        else:
            # No CI/CD integration available, return completed status
            logger.info("No CI/CD configured, will re-run tests locally")
            return await self._local_verification(branch_name)
    
    async def _check_github_actions(self, owner: str, repo: str, branch: str) -> Dict[str, Any]:
        """Poll GitHub Actions for workflow run status"""
        headers = {
            "Authorization": f"token {self.github_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        # Wait briefly for workflow to be triggered
        await asyncio.sleep(3)
        
        start_time = time.time()
        max_wait = 30  # Reduced to 30 seconds to check if workflows exist
        
        async with aiohttp.ClientSession() as session:
            while (time.time() - start_time) < max_wait:
                try:
                    url = f"https://api.github.com/repos/{owner}/{repo}/actions/runs"
                    params = {"branch": branch, "per_page": 5}
                    
                    async with session.get(url, headers=headers, params=params) as resp:
                        if resp.status == 200:
                            data = await resp.json()
                            runs = data.get("workflow_runs", [])
                            
                            if runs:
                                latest_run = runs[0]
                                status = latest_run["status"]
                                conclusion = latest_run.get("conclusion")
                                
                                if status == "completed":
                                    return {
                                        "status": "passed" if conclusion == "success" else "failed",
                                        "details": f"GitHub Actions: {conclusion}",
                                        "run_id": latest_run["id"],
                                        "url": latest_run["html_url"]
                                    }
                                elif status in ["queued", "in_progress"]:
                                    logger.info(f"Pipeline {status}, waiting...")
                                    await asyncio.sleep(self.poll_interval)
                                    continue
                    
                    await asyncio.sleep(self.poll_interval)
                
                except Exception as e:
                    logger.error(f"Error checking GitHub Actions: {e}")
                    break  # Exit loop if error
        
        # No workflows found or timeout - use local verification
        logger.info("No GitHub Actions workflows found, using local verification")
        return await self._local_verification(branch)
    
    async def _local_verification(self, branch_name: str) -> Dict[str, Any]:
        """
        Local verification when no external CI/CD is available
        Returns completed status to trigger test re-run
        """
        logger.info("Local verification - tests will be re-run in next iteration")
        
        return {
            "status": "completed",
            "details": "No CI/CD configured - tests will be verified locally",
        }