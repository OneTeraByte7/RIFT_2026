"""
Sandbox Executor
Provides safe code execution environment
Uses Docker when available, falls back to subprocess isolation
"""

import os
import asyncio
import logging
import subprocess
from typing import Dict, Any, Optional, Tuple

logger = logging.getLogger(__name__)


class SandboxExecutor:
    """Execute code safely in a sandboxed environment"""
    
    def __init__(self):
        self.use_docker = self._check_docker()
        self.docker_image = os.getenv("SANDBOX_IMAGE", "python:3.11-slim")
        self.timeout = int(os.getenv("SANDBOX_TIMEOUT", "120"))
    
    def _check_docker(self) -> bool:
        """Check if Docker is available"""
        try:
            result = subprocess.run(
                ["docker", "info"], 
                capture_output=True, 
                timeout=5
            )
            return result.returncode == 0
        except:
            return False
    
    async def execute_in_sandbox(
        self, 
        command: str, 
        repo_path: str,
        env_vars: Optional[Dict[str, str]] = None
    ) -> Tuple[str, str, int]:
        """
        Execute command in sandbox
        Returns: (stdout, stderr, return_code)
        """
        if self.use_docker:
            return await self._docker_execute(command, repo_path, env_vars)
        else:
            return await self._subprocess_execute(command, repo_path, env_vars)
    
    async def _docker_execute(
        self, 
        command: str, 
        repo_path: str,
        env_vars: Optional[Dict[str, str]] = None
    ) -> Tuple[str, str, int]:
        """Execute in Docker container"""
        env_args = []
        if env_vars:
            for k, v in env_vars.items():
                env_args.extend(["-e", f"{k}={v}"])
        
        docker_cmd = [
            "docker", "run", "--rm",
            "--memory", "512m",
            "--cpus", "1",
            "--network", "none",  # No network in sandbox
            "-v", f"{repo_path}:/workspace:ro",
            "-w", "/workspace",
            *env_args,
            self.docker_image,
            "sh", "-c", command
        ]
        
        try:
            proc = await asyncio.wait_for(
                asyncio.create_subprocess_exec(
                    *docker_cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                ),
                timeout=self.timeout
            )
            stdout, stderr = await proc.communicate()
            return stdout.decode(), stderr.decode(), proc.returncode
        
        except asyncio.TimeoutError:
            return "", "Execution timed out", 1
        except Exception as e:
            logger.error(f"Docker execution failed: {e}")
            return "", str(e), 1
    
    async def _subprocess_execute(
        self, 
        command: str, 
        repo_path: str,
        env_vars: Optional[Dict[str, str]] = None
    ) -> Tuple[str, str, int]:
        """Execute in subprocess (fallback)"""
        env = {**os.environ}
        if env_vars:
            env.update(env_vars)
        
        try:
            proc = await asyncio.wait_for(
                asyncio.create_subprocess_shell(
                    command,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE,
                    cwd=repo_path,
                    env=env
                ),
                timeout=self.timeout
            )
            stdout, stderr = await proc.communicate()
            return stdout.decode(), stderr.decode(), proc.returncode
        
        except asyncio.TimeoutError:
            return "", "Execution timed out", 1
        except Exception as e:
            return "", str(e), 1