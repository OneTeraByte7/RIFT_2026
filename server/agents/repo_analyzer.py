"""
Repository Analyzer Agent
Discovers all files and test files in the repository
"""

import os
import re
import asyncio
import logging
from typing import List, Tuple, Dict, Any
from pathlib import Path

logger = logging.getLogger(__name__)


class RepoAnalyzerAgent:
    """Analyzes repository structure to discover files and tests"""
    
    TEST_PATTERNS = [
        r'test_.*\.py$',
        r'.*_test\.py$',
        r'.*\.test\.[jt]sx?$',
        r'.*\.spec\.[jt]sx?$',
        r'__tests__/.*\.[jt]sx?$',
        r'tests?/.*\.py$',
        r'spec/.*\.(rb|js|ts)$',
    ]
    
    IGNORE_DIRS = {
        '.git', 'node_modules', '__pycache__', '.pytest_cache',
        'venv', 'env', '.env', 'dist', 'build', '.next', '.cache',
        'coverage', '.tox', 'eggs', '.eggs'
    }
    
    async def analyze(self, repo_path: str) -> Tuple[List[str], List[str]]:
        """Discover all source and test files"""
        all_files = []
        test_files = []
        
        for root, dirs, files in os.walk(repo_path):
            # Filter ignored directories
            dirs[:] = [d for d in dirs if d not in self.IGNORE_DIRS]
            
            for file in files:
                filepath = os.path.join(root, file)
                rel_path = os.path.relpath(filepath, repo_path)
                
                # Only track relevant source files
                if self._is_source_file(file):
                    all_files.append(rel_path)
                
                # Check if test file
                if self._is_test_file(rel_path, file):
                    test_files.append(rel_path)
        
        logger.info(f"Found {len(all_files)} source files, {len(test_files)} test files")
        return all_files, test_files
    
    def _is_source_file(self, filename: str) -> bool:
        extensions = {
            '.py', '.js', '.ts', '.jsx', '.tsx', 
            '.rb', '.go', '.java', '.cs', '.cpp', '.c'
        }
        return Path(filename).suffix in extensions
    
    def _is_test_file(self, rel_path: str, filename: str) -> bool:
        for pattern in self.TEST_PATTERNS:
            if re.search(pattern, rel_path) or re.search(pattern, filename):
                return True
        return False
    
    async def get_file_content(self, repo_path: str, rel_path: str) -> str:
        """Read file content"""
        full_path = os.path.join(repo_path, rel_path)
        try:
            with open(full_path, 'r', encoding='utf-8', errors='replace') as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error reading {rel_path}: {e}")
            return ""
    
    async def get_all_source_contents(self, repo_path: str, files: List[str]) -> Dict[str, str]:
        """Get contents of all source files"""
        contents = {}
        for rel_path in files:
            content = await self.get_file_content(repo_path, rel_path)
            if content:
                contents[rel_path] = content
        return contents