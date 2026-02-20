"""
Git Agent
Handles all git operations: clone, branch, commit, push
"""

import os
import re
import asyncio
import logging
import tempfile
import platform
import subprocess
from typing import Optional
from pathlib import Path

logger = logging.getLogger(__name__)


class GitAgent:
    """Handles all git operations for the CI/CD healing workflow"""
    
    def __init__(self):
        self.github_token = os.getenv("GITHUB_TOKEN", "")
        self.git_user = os.getenv("GIT_USER_NAME", "AI-AGENT")
        self.git_email = os.getenv("GIT_USER_EMAIL", "ai-agent@cicd-healer.dev")
    
    async def clone(self, repo_url: str) -> str:
        """Clone repository to temp directory, returns path"""
        # Create unique temp directory
        default_dir = os.path.join(tempfile.gettempdir(), "repos") if platform.system() == 'Windows' else "/tmp/repos"
        base_dir = os.getenv("REPOS_DIR", default_dir)
        os.makedirs(base_dir, exist_ok=True)
        
        # Generate safe dir name from URL
        repo_name = repo_url.rstrip('/').split('/')[-1].replace('.git', '')
        # Remove any invalid characters for Windows paths
        repo_name = re.sub(r'[<>:"/\\|?*]', '_', repo_name)
        
        # Use time.time() instead of asyncio event loop time for proper timestamp
        import time
        timestamp = int(time.time() * 1000)  # milliseconds
        repo_dir = os.path.join(base_dir, f"{repo_name}_{timestamp}")
        repo_dir = os.path.normpath(repo_dir)  # Normalize path for Windows
        
        # Inject token for private repos if available
        clone_url = repo_url
        if self.github_token and "github.com" in repo_url:
            # Format: https://token@github.com/owner/repo
            clone_url = repo_url.replace(
                "https://github.com", 
                f"https://{self.github_token}@github.com"
            )
        
        # Use synchronous subprocess wrapped in thread for Windows compatibility
        def _clone():
            result = subprocess.run(
                ["git", "clone", clone_url, repo_dir, "--depth", "1"],
                capture_output=True,
                text=True,
                encoding='utf-8',
                errors='replace'
            )
            if result.returncode != 0:
                error_msg = result.stderr
                # Sanitize token from error messages
                error_msg = error_msg.replace(self.github_token, "***") if self.github_token else error_msg
                raise Exception(f"Clone failed: {error_msg}")
            return result
        
        await asyncio.to_thread(_clone)
        
        # Fix potential encoding issues in package.json on Windows
        package_json_path = os.path.join(repo_dir, "package.json")
        if os.path.exists(package_json_path):
            try:
                # Read and rewrite with proper UTF-8 encoding
                with open(package_json_path, 'r', encoding='utf-8-sig', errors='ignore') as f:
                    content = f.read()
                with open(package_json_path, 'w', encoding='utf-8', newline='\n') as f:
                    f.write(content)
                logger.info("Fixed package.json encoding")
            except Exception as e:
                logger.warning(f"Could not fix package.json encoding: {e}")
        
        # Configure git identity
        await self._run_git(repo_dir, "config", "user.name", self.git_user)
        await self._run_git(repo_dir, "config", "user.email", self.git_email)
        
        logger.info(f"Cloned to {repo_dir}")
        return repo_dir
    
    async def create_branch(self, repo_path: str, branch_name: str):
        """Create and checkout a new branch"""
        # Validate branch name
        if not self._validate_branch_name(branch_name):
            raise ValueError(f"Invalid branch name format: {branch_name}")
        
        # Make sure we're on main/master first
        await self._run_git(repo_path, "fetch", "--all")
        
        # Try to checkout main or master
        for base_branch in ["main", "master", "develop"]:
            result = await self._run_git_safe(repo_path, "checkout", base_branch)
            if result:
                break
        
        # Create new branch
        await self._run_git(repo_path, "checkout", "-b", branch_name)
        logger.info(f"Created branch: {branch_name}")
    
    def _validate_branch_name(self, branch_name: str) -> bool:
        """Validate branch follows TEAM_NAME_LEADER_NAME_AI_Fix format"""
        pattern = r'^[A-Z0-9_]+_AI_Fix$'
        return bool(re.match(pattern, branch_name))
    
    async def commit_and_push(self, repo_path: str, message: str, branch_name: str):
        """Stage all changes, commit with [AI-AGENT] prefix, push to branch"""
        # Validate commit message has [AI-AGENT] prefix
        if not message.startswith("[AI-AGENT]"):
            message = f"[AI-AGENT] {message}"
        
        # Stage all changes
        await self._run_git(repo_path, "add", "-A")
        
        # Check if there are changes to commit
        status_result = await self._run_git_output(repo_path, "status", "--porcelain")
        if not status_result.strip():
            logger.info("No changes to commit")
            return
        
        # Commit
        await self._run_git(repo_path, "commit", "-m", message)
        
        # Push to the branch
        await self._run_git(repo_path, "push", "-u", "origin", branch_name, "--force")
        
        logger.info(f"Committed and pushed: {message}")
    
    async def push_branch(self, repo_path: str, branch_name: str):
        """Push branch to remote (even if empty, to make it visible on GitHub)"""
        try:
            # Try to push the branch
            await self._run_git(repo_path, "push", "-u", "origin", branch_name)
            logger.info(f"Pushed branch {branch_name} to origin")
        except Exception as e:
            # If push fails (empty branch), create an empty commit first
            logger.info(f"Branch push failed, creating initial commit: {e}")
            try:
                await self._run_git(repo_path, "commit", "--allow-empty", "-m", "[AI-AGENT] Initialize branch for healing")
                await self._run_git(repo_path, "push", "-u", "origin", branch_name)
                logger.info(f"Pushed branch {branch_name} with initial commit")
            except Exception as e2:
                logger.error(f"Failed to push branch: {e2}")
                raise
    
    async def get_current_branch(self, repo_path: str) -> str:
        """Get current branch name"""
        return await self._run_git_output(repo_path, "rev-parse", "--abbrev-ref", "HEAD")
    
    async def get_commit_count(self, repo_path: str, branch_name: str) -> int:
        """Get number of commits on this branch compared to main"""
        try:
            output = await self._run_git_output(
                repo_path, "rev-list", "--count", f"origin/main..{branch_name}"
            )
            return int(output.strip())
        except:
            return 0
    
    async def _run_git(self, cwd: str, *args):
        """Run git command, raise on failure - Windows compatible"""
        # Normalize path for Windows
        cwd = os.path.normpath(cwd) if cwd else os.getcwd()
        
        def _run():
            result = subprocess.run(
                ["git"] + list(args),
                cwd=cwd,
                capture_output=True,
                text=True
            )
            if result.returncode != 0:
                raise Exception(f"git {' '.join(args)} failed: {result.stderr}")
            return result.stdout
        
        return await asyncio.to_thread(_run)
    
    async def _run_git_safe(self, cwd: str, *args) -> bool:
        """Run git command, return False on failure instead of raising"""
        try:
            await self._run_git(cwd, *args)
            return True
        except:
            return False
    
    async def _run_git_output(self, cwd: str, *args) -> str:
        """Run git command and return output"""
        result = await self._run_git(cwd, *args)
        return result.strip()