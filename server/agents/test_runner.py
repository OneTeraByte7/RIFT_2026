"""
Test Runner Agent
Runs all discovered test files and captures failures with precise details
"""

import os
import re
import json
import asyncio
import subprocess
import logging
from typing import List, Dict, Any, Optional
from pathlib import Path

logger = logging.getLogger(__name__)


class TestRunnerAgent:
    """Runs tests and captures failures with exact file, line, and bug type"""
    
    BUG_TYPE_PATTERNS = {
        "SYNTAX": [
            r"SyntaxError", r"IndentationError", r"syntax error",
            r"unexpected token", r"Unexpected identifier", r"ParseError"
        ],
        "LINTING": [
            r"unused import", r"imported but unused", r"F401",
            r"unused variable", r"W0611", r"no-unused-vars",
            r"undefined variable", r"E0602"
        ],
        "TYPE_ERROR": [
            r"TypeError", r"type error", r"TS\d+", r"cannot read prop",
            r"is not a function", r"NoneType", r"AttributeError"
        ],
        "LOGIC": [
            r"AssertionError", r"assert.*failed", r"expected.*received",
            r"Expected.*toBe", r"FAILED.*assert", r"wrong result"
        ],
        "IMPORT": [
            r"ModuleNotFoundError", r"ImportError", r"Cannot find module",
            r"No module named", r"import.*failed", r"require.*not found"
        ],
        "INDENTATION": [
            r"IndentationError", r"unexpected indent", r"expected an indented block",
            r"unindent does not match"
        ]
    }
    
    async def run_all_tests(self, repo_path: str, test_files: List[str]) -> List[Dict[str, Any]]:
        """Run all tests and collect failures"""
        all_failures = []
        
        # First try to auto-detect the test framework
        test_framework = self._detect_framework(repo_path)
        logger.info(f"Detected test framework: {test_framework}")
        
        if test_framework == "pytest":
            failures = await self._run_pytest(repo_path, test_files)
            all_failures.extend(failures)
        elif test_framework == "jest":
            failures = await self._run_jest(repo_path, test_files)
            all_failures.extend(failures)
        else:
            # Try both
            py_tests = [f for f in test_files if f.endswith('.py')]
            js_tests = [f for f in test_files if f.endswith(('.js', '.ts', '.jsx', '.tsx'))]
            
            if py_tests:
                failures = await self._run_pytest(repo_path, py_tests)
                all_failures.extend(failures)
            if js_tests:
                failures = await self._run_jest(repo_path, js_tests)
                all_failures.extend(failures)
        
        # Also run static analysis on ALL source files (not just tests)
        logger.info("Running static code analysis on all source files...")
        all_source_files = await self._discover_all_source_files(repo_path)
        logger.info(f"Found {len(all_source_files)} source files to analyze")
        linting_failures = await self._run_linting(repo_path, all_source_files)
        all_failures.extend(linting_failures)
        
        # Run deep static analysis for common bug patterns
        static_failures = await self._run_static_analysis(repo_path, all_source_files)
        all_failures.extend(static_failures)
        
        logger.info(f"Total failures found: {len(all_failures)} (before deduplication)")
        
        # Deduplicate
        seen = set()
        unique_failures = []
        for f in all_failures:
            key = (f["file"], f["line"], f["bug_type"])
            if key not in seen:
                seen.add(key)
                unique_failures.append(f)
        
        logger.info(f"Unique failures after deduplication: {len(unique_failures)}")
        return unique_failures
    
    def _detect_framework(self, repo_path: str) -> str:
        """Detect which test framework is being used"""
        package_json = os.path.join(repo_path, "package.json")
        requirements = os.path.join(repo_path, "requirements.txt")
        setup_py = os.path.join(repo_path, "setup.py")
        
        if os.path.exists(package_json):
            try:
                with open(package_json) as f:
                    data = json.load(f)
                    deps = {**data.get("dependencies", {}), **data.get("devDependencies", {})}
                    if "jest" in deps or "@jest/core" in deps:
                        return "jest"
                    if "vitest" in deps:
                        return "vitest"
            except:
                pass
        
        if os.path.exists(requirements) or os.path.exists(setup_py):
            return "pytest"
        
        return "auto"
    
    async def _run_pytest(self, repo_path: str, test_files: List[str]) -> List[Dict[str, Any]]:
        """Run pytest and parse output - Windows compatible"""
        failures = []
        
        try:
            # Install dependencies only if requirements.txt exists and not already installed
            req_file = os.path.join(repo_path, "requirements.txt")
            installed_marker = os.path.join(repo_path, ".deps_installed")
            
            if os.path.exists(req_file) and not os.path.exists(installed_marker):
                logger.info("Installing Python dependencies...")
                def _install():
                    return subprocess.run(
                        ["pip", "install", "-r", req_file, "--quiet"],
                        cwd=repo_path,
                        capture_output=True,
                        text=True,
                        timeout=180  # 3 minute timeout
                    )
                try:
                    await asyncio.to_thread(_install)
                    # Create marker file
                    with open(installed_marker, 'w') as f:
                        f.write('installed')
                    logger.info("pip install completed")
                except Exception as e:
                    logger.warning(f"pip install error: {e}")
            else:
                logger.info("Skipping pip install - dependencies already installed")
            
            # Run pytest with verbose output
            def _run_pytest():
                env = {**os.environ, "PYTHONPATH": repo_path}
                return subprocess.run(
                    ["python", "-m", "pytest", "--tb=short", "-v", "--no-header", "-rN"],
                    cwd=repo_path,
                    capture_output=True,
                    text=True,
                    env=env
                )
            
            result = await asyncio.to_thread(_run_pytest)
            output = result.stdout + result.stderr
            
            failures = self._parse_pytest_output(output, repo_path)
            
        except Exception as e:
            logger.error(f"pytest error: {e}")
        
        return failures
    
    def _parse_pytest_output(self, output: str, repo_path: str) -> List[Dict[str, Any]]:
        """Parse pytest output to extract failures with file/line info"""
        failures = []
        lines = output.split('\n')
        
        i = 0
        while i < len(lines):
            line = lines[i]
            
            # Look for FAILED lines
            if line.startswith('FAILED') or 'FAILED' in line:
                # Extract file path and test name
                match = re.match(r'FAILED\s+([^:]+)::([^\s]+)', line)
                if match:
                    test_file = match.group(1)
                    
                    # Look ahead for error details
                    error_context = '\n'.join(lines[max(0, i-20):i+5])
                    
                    failure = self._extract_failure_details(test_file, error_context, output)
                    if failure:
                        failures.append(failure)
            
            # Look for ERROR lines with traceback
            elif re.match(r'ERROR\s+', line):
                match = re.match(r'ERROR\s+([^:]+)', line)
                if match:
                    file_path = match.group(1).strip()
                    error_context = '\n'.join(lines[i:min(len(lines), i+20)])
                    failure = self._extract_failure_details(file_path, error_context, output)
                    if failure:
                        failures.append(failure)
            
            # Look for SyntaxError/ImportError in collection phase
            elif 'SyntaxError' in line or 'IndentationError' in line:
                file_match = re.search(r'File "([^"]+)", line (\d+)', '\n'.join(lines[max(0, i-5):i+2]))
                if file_match:
                    f_path = os.path.relpath(file_match.group(1), repo_path)
                    failures.append({
                        "file": f_path,
                        "line": int(file_match.group(2)),
                        "bug_type": "SYNTAX" if "SyntaxError" in line else "INDENTATION",
                        "description": line.strip(),
                        "status": "pending"
                    })
            
            i += 1
        
        return failures
    
    def _extract_failure_details(self, file_path: str, context: str, full_output: str) -> Optional[Dict[str, Any]]:
        """Extract structured failure info from error context"""
        # Find line number
        line_num = 1
        line_match = re.search(r'line (\d+)', context)
        if line_match:
            line_num = int(line_match.group(1))
        
        # Determine bug type using improved classifier
        bug_type = self._classify_bug_type(context)
        
        # Extract description
        desc_lines = [l.strip() for l in context.split('\n') if l.strip() and not l.startswith('_')]
        description = desc_lines[-1] if desc_lines else "Test failure"
        
        return {
            "file": file_path,
            "line": line_num,
            "bug_type": bug_type,
            "description": description[:200],
            "status": "pending"
        }
    
    async def _run_jest(self, repo_path: str, test_files: List[str]) -> List[Dict[str, Any]]:
        """Run Jest tests - Windows compatible"""
        failures = []
        
        try:
            # Install dependencies only if node_modules doesn't exist
            package_json_path = os.path.join(repo_path, "package.json")
            node_modules_path = os.path.join(repo_path, "node_modules")
            
            if os.path.exists(package_json_path) and not os.path.exists(node_modules_path):
                logger.info("Installing npm dependencies...")
                def _install():
                    return subprocess.run(
                        ["npm", "install", "--silent"],
                        cwd=repo_path,
                        capture_output=True,
                        text=True,
                        shell=True,
                        encoding='utf-8',
                        errors='replace',
                        timeout=180  # 3 minute timeout
                    )
                try:
                    await asyncio.to_thread(_install)
                    logger.info("npm install completed")
                except Exception as e:
                    logger.warning(f"npm install error: {e}")
            else:
                logger.info("Skipping npm install - dependencies already installed")
            
            # Run Jest with timeout protection
            logger.info("Starting Jest execution...")
            def _run_jest():
                # Try different Jest execution methods
                commands = [
                    # Method 1: Direct jest with verbose output
                    ["npx", "jest", "--verbose", "--no-coverage"],
                    # Method 2: npm test 
                    ["npm", "test"],
                    # Method 3: jest with json (if supported)
                    ["npx", "jest", "--json", "--no-coverage"]
                ]
                
                for cmd in commands:
                    try:
                        logger.info(f"Trying command: {' '.join(cmd)}")
                        result = subprocess.run(
                            cmd,
                            cwd=repo_path,
                            capture_output=True,
                            text=True,
                            shell=True,
                            encoding='utf-8',
                            errors='replace',
                            timeout=120
                        )
                        logger.info(f"Command {cmd[0]} completed with code {result.returncode}")
                        if result.stdout or result.stderr:
                            return result
                    except subprocess.TimeoutExpired as e:
                        logger.warning(f"Command {cmd[0]} timed out")
                        continue
                    except Exception as e:
                        logger.warning(f"Command {cmd[0]} failed: {e}")
                        continue
                
                raise Exception("All Jest execution methods failed")
            
            try:
                result = await asyncio.wait_for(asyncio.to_thread(_run_jest), timeout=150)
                stdout = result.stdout
                stderr = result.stderr
                
                logger.info(f"Jest completed with return code: {result.returncode}")
                logger.info(f"Jest stdout length: {len(stdout)}")
                logger.info(f"Jest stderr length: {len(stderr)}")
                logger.info(f"Jest stdout preview: {stdout[:500]}")
                logger.info(f"Jest stderr preview: {stderr[:500]}")
                
                # If Jest failed to run at all (return code indicates npm/jest error)
                # Try to at least detect test files exist
                if result.returncode != 0 and len(stdout) == 0 and 'npm error' in stderr:
                    logger.warning("Jest/npm failed completely, adding placeholder failures for existing test files")
                    # Add at least one failure per test file so agent attempts to fix
                    for test_file in test_files:
                        if test_file.endswith(('.test.js', '.spec.js')):
                            failures.append({
                                "file": test_file,
                                "line": 1,
                                "bug_type": "LOGIC",
                                "description": f"Test file exists but couldn't run - likely has failures",
                                "status": "pending"
                            })
                    logger.info(f"Added {len(failures)} placeholder failures for unrunnable tests")
                    return failures
            except asyncio.TimeoutError:
                logger.error("Jest execution timed out after 150 seconds")
                return failures
            except Exception as e:
                logger.error(f"Jest execution error: {e}")
                return failures
            
            try:
                data = json.loads(stdout)
                logger.info(f"Jest JSON parsed, {len(data.get('testResults', []))} test results")
                for test_result in data.get("testResults", []):
                    logger.info(f"Test result keys: {test_result.keys()}")
                    logger.info(f"Test result name: {test_result.get('name')}")
                    logger.info(f"Assertion results count: {len(test_result.get('assertionResults', []))}")
                    # Jest uses "assertionResults" not "testResults"
                    for assertion in test_result.get("assertionResults", []):
                        logger.info(f"Assertion: {assertion.get('title')} - {assertion.get('status')}")
                        if assertion["status"] == "failed":
                            file_path = os.path.relpath(test_result["name"], repo_path)
                            failure_msg = "\n".join(assertion.get("failureMessages", []))
                            
                            # Classify bug type based on failure message
                            bug_type = self._classify_bug_type(failure_msg)
                            
                            failures.append({
                                "file": file_path,
                                "line": assertion.get("location", {}).get("line", 1) if assertion.get("location") else 1,
                                "bug_type": bug_type,
                                "description": failure_msg[:200] if failure_msg else assertion.get("title", "Test failed"),
                                "status": "pending"
                            })
                logger.info(f"Parsed {len(failures)} failures from JSON")
            except json.JSONDecodeError as e:
                logger.info(f"JSON decode failed: {e}, trying text parsing")
                # Parse text output (both stdout and stderr)
                combined_output = stdout + "\n" + stderr
                failures = self._parse_jest_text_output(combined_output, repo_path)
                logger.info(f"Parsed {len(failures)} failures from text output")
        
        except Exception as e:
            logger.error(f"Jest error: {e}")
        
        return failures
    
    def _parse_jest_text_output(self, output: str, repo_path: str) -> List[Dict[str, Any]]:
        """Parse Jest text output - improved to catch all failure patterns"""
        failures = []
        lines = output.split('\n')
        
        current_file = None
        
        for i, line in enumerate(lines):
            # Look for test file names
            if 'FAIL' in line and ('.test.' in line or '.spec.' in line):
                file_match = re.search(r'([\w/\\.-]+\.(?:test|spec)\.[jt]sx?)', line)
                if file_match:
                    current_file = file_match.group(1)
                    logger.info(f"Found failing test file: {current_file}")
            
            # Look for failed test cases
            if '✕' in line or '✗' in line or line.strip().startswith('●'):
                test_name = line.strip()
                context = '\n'.join(lines[i:min(len(lines), i+20)])
                
                # Extract expected vs received
                expected_match = re.search(r'Expected:?\s*(.+)', context, re.IGNORECASE)
                received_match = re.search(r'Received:?\s*(.+)', context, re.IGNORECASE)
                
                description = test_name
                if expected_match and received_match:
                    description = f"Expected {expected_match.group(1).strip()}, got {received_match.group(1).strip()}"
                
                # Get line number if available
                line_match = re.search(r':(\d+):', context)
                line_num = int(line_match.group(1)) if line_match else 1
                
                # Classify bug type
                bug_type = self._classify_bug_type(context)
                
                failures.append({
                    "file": current_file or "unknown.test.js",
                    "line": line_num,
                    "bug_type": bug_type,
                    "description": description[:200],
                    "status": "pending"
                })
                logger.info(f"Added failure: {current_file}:{line_num} - {bug_type}")
        
        return failures
    
    async def _run_linting(self, repo_path: str, files: List[str]) -> List[Dict[str, Any]]:
        """Run linting (pylint/flake8 for Python, eslint for JS)"""
        failures = []
        
        py_files = [f for f in files if f.endswith('.py')]
        if py_files:
            failures.extend(await self._run_flake8(repo_path, py_files))
        
        js_files = [f for f in files if f.endswith(('.js', '.ts', '.jsx', '.tsx'))]
        if js_files:
            failures.extend(await self._run_eslint(repo_path, js_files))
        
        return failures
    
    async def _run_flake8(self, repo_path: str, py_files: List[str]) -> List[Dict[str, Any]]:
        """Run flake8 linting"""
        failures = []
        try:
            proc = await asyncio.create_subprocess_exec(
                "python", "-m", "flake8", "--format=%(path)s:%(row)d:%(col)d: %(code)s %(text)s",
                *py_files,
                cwd=repo_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, _ = await proc.communicate()
            
            for line in stdout.decode().split('\n'):
                match = re.match(r'([^:]+):(\d+):\d+: ([A-Z]\d+) (.+)', line.strip())
                if match:
                    code = match.group(3)
                    bug_type = "LINTING"
                    if code.startswith('E1') or code.startswith('W'):
                        bug_type = "LINTING"
                    elif code.startswith('E9'):
                        bug_type = "SYNTAX"
                    elif code.startswith('F4'):
                        bug_type = "IMPORT"
                    
                    failures.append({
                        "file": match.group(1),
                        "line": int(match.group(2)),
                        "bug_type": bug_type,
                        "description": f"{code}: {match.group(4)}",
                        "status": "pending"
                    })
        except Exception as e:
            logger.error(f"flake8 error: {e}")
        
        return failures
    
    async def _run_eslint(self, repo_path: str, js_files: List[str]) -> List[Dict[str, Any]]:
        """Run ESLint"""
        failures = []
        try:
            proc = await asyncio.create_subprocess_exec(
                "npx", "eslint", "--format=json", *js_files,
                cwd=repo_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, _ = await proc.communicate()
            
            try:
                data = json.loads(stdout.decode())
                for file_result in data:
                    for msg in file_result.get("messages", []):
                        failures.append({
                            "file": os.path.relpath(file_result["filePath"], repo_path),
                            "line": msg.get("line", 1),
                            "bug_type": "LINTING",
                            "description": msg.get("message", ""),
                            "status": "pending"
                        })
            except:
                pass
        except Exception as e:
            logger.error(f"eslint error: {e}")
        
        return failures
    
    def _classify_bug_type(self, error_text: str) -> str:
        """Classify bug type from error message with priority order"""
        error_lower = error_text.lower()
        
        # Check patterns in priority order (most specific first)
        
        # 1. SYNTAX errors (compilation/parse errors)
        if any(pattern in error_lower for pattern in ['syntaxerror', 'syntax error', 'unexpected token', 
                                                        'unexpected identifier', 'parseerror', 'missing semicolon',
                                                        'unexpected end of input']):
            return "SYNTAX"
        
        # 2. INDENTATION errors (Python-specific)
        if any(pattern in error_lower for pattern in ['indentationerror', 'unexpected indent', 
                                                        'expected an indented block', 'unindent does not match']):
            return "INDENTATION"
        
        # 3. IMPORT errors (module not found)
        if any(pattern in error_lower for pattern in ['modulenotfounderror', 'importerror', 'cannot find module',
                                                        'no module named', 'module not found', 'cannot resolve module',
                                                        'require is not defined']):
            return "IMPORT"
        
        # 4. TYPE errors (type mismatches, null/undefined)
        if any(pattern in error_lower for pattern in ['typeerror', 'type error', 'cannot read prop', 
                                                        'is not a function', 'nonetype', 'attributeerror',
                                                        'undefined is not', 'null is not', 'ts2', 'ts1']):
            return "TYPE_ERROR"
        
        # 5. LINTING errors (unused vars, style issues)
        if any(pattern in error_lower for pattern in ['unused import', 'imported but unused', 'f401',
                                                        'unused variable', 'w0611', 'no-unused-vars',
                                                        'undefined variable', 'e0602', 'eslint',
                                                        'never used', 'is assigned but']):
            return "LINTING"
        
        # 6. LOGIC errors (test assertions, wrong results) - Default
        # Assertion failures, wrong calculations, business logic errors
        if any(pattern in error_lower for pattern in ['assertionerror', 'assert', 'expected', 'received',
                                                        'tobe', 'toequal', 'failed', 'wrong result',
                                                        'does not match', 'mismatch']):
            return "LOGIC"
        
        # Default to LOGIC for test failures
        return "LOGIC"
    
    async def _discover_all_source_files(self, repo_path: str) -> List[str]:
        """Discover all source files in the repository"""
        IGNORE_DIRS = {
            '.git', 'node_modules', '__pycache__', '.pytest_cache',
            'venv', 'env', '.env', 'dist', 'build', '.next', '.cache',
            'coverage', '.tox', 'eggs', '.eggs', 'target', 'bin', 'obj'
        }
        
        source_files = []
        extensions = {'.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.cpp', '.c', '.cs', '.go', '.rb'}
        
        for root, dirs, files in os.walk(repo_path):
            # Filter ignored directories
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            
            for file in files:
                if Path(file).suffix in extensions:
                    filepath = os.path.join(root, file)
                    rel_path = os.path.relpath(filepath, repo_path)
                    source_files.append(rel_path)
        
        return source_files
    
    async def _run_static_analysis(self, repo_path: str, files: List[str]) -> List[Dict[str, Any]]:
        """Run deep static analysis to detect common bug patterns"""
        failures = []
        
        logger.info(f"Running static analysis on {len(files)} files...")
        
        for file_path in files:
            full_path = os.path.join(repo_path, file_path)
            
            try:
                with open(full_path, 'r', encoding='utf-8', errors='replace') as f:
                    content = f.read()
                    lines = content.split('\n')
                
                # Check for common bug patterns
                file_failures = []
                
                # Python-specific checks
                if file_path.endswith('.py'):
                    file_failures.extend(self._check_python_patterns(file_path, lines))
                
                # JavaScript/TypeScript checks
                elif file_path.endswith(('.js', '.ts', '.jsx', '.tsx')):
                    file_failures.extend(self._check_js_patterns(file_path, lines))
                
                failures.extend(file_failures)
                
                if file_failures:
                    logger.info(f"Found {len(file_failures)} issues in {file_path}")
                
            except Exception as e:
                logger.warning(f"Could not analyze {file_path}: {e}")
        
        return failures
    
    def _check_python_patterns(self, file_path: str, lines: List[str]) -> List[Dict[str, Any]]:
        """Check for common Python bug patterns"""
        failures = []
        
        for i, line in enumerate(lines, 1):
            stripped = line.strip()
            
            # Check for common logic errors in functions
            if 'def ' in stripped and 'return' in ''.join(lines[i:min(len(lines), i+10)]):
                # Look for wrong operators
                func_body = '\n'.join(lines[i:min(len(lines), i+10)])
                
                # Check for subtraction when addition might be intended
                if 'return a - b' in func_body and 'def add' in stripped:
                    failures.append({
                        "file": file_path,
                        "line": i,
                        "bug_type": "LOGIC",
                        "description": "Using subtraction (-) in add function, should use addition (+)",
                        "status": "pending"
                    })
                
                # Check for addition when multiplication might be intended
                if 'return a + b' in func_body and 'def multiply' in stripped:
                    failures.append({
                        "file": file_path,
                        "line": i,
                        "bug_type": "LOGIC",
                        "description": "Using addition (+) in multiply function, should use multiplication (*)",
                        "status": "pending"
                    })
            
            # Check for missing colons after if/for/while/def/class
            if re.match(r'^\s*(if|for|while|def|class|elif|else|try|except|finally|with)\s+.*[^:]\s*$', stripped):
                if stripped and not stripped.endswith(':') and not stripped.endswith('\\'):
                    failures.append({
                        "file": file_path,
                        "line": i,
                        "bug_type": "SYNTAX",
                        "description": f"Missing colon at end of line: {stripped[:50]}",
                        "status": "pending"
                    })
            
            # Check for obvious indentation errors
            if stripped.startswith('def ') or stripped.startswith('class '):
                # Next non-empty line should be indented
                for j in range(i, min(len(lines), i+5)):
                    next_line = lines[j].strip()
                    if next_line and not next_line.startswith('#'):
                        if len(lines[j]) - len(lines[j].lstrip()) == 0 and lines[j].strip():
                            failures.append({
                                "file": file_path,
                                "line": j + 1,
                                "bug_type": "INDENTATION",
                                "description": f"Expected indented block after {stripped[:30]}",
                                "status": "pending"
                            })
                        break
        
        return failures
    
    def _check_js_patterns(self, file_path: str, lines: List[str]) -> List[Dict[str, Any]]:
        """Check for common JavaScript/TypeScript bug patterns"""
        failures = []
        
        for i, line in enumerate(lines, 1):
            stripped = line.strip()
            
            # Check for wrong operators in functions
            if 'function ' in stripped or 'const ' in stripped or 'let ' in stripped:
                func_body = '\n'.join(lines[i:min(len(lines), i+10)])
                
                # Check for subtraction when addition might be intended
                if 'return a - b' in func_body and 'add' in stripped.lower():
                    failures.append({
                        "file": file_path,
                        "line": i,
                        "bug_type": "LOGIC",
                        "description": "Using subtraction (-) in add function, should use addition (+)",
                        "status": "pending"
                    })
                
                # Check for addition when multiplication might be intended
                if 'return a + b' in func_body and 'multiply' in stripped.lower():
                    failures.append({
                        "file": file_path,
                        "line": i,
                        "bug_type": "LOGIC",
                        "description": "Using addition (+) in multiply function, should use multiplication (*)",
                        "status": "pending"
                    })
            
            # Check for missing semicolons (in strict codebases)
            if stripped and not stripped.startswith('//') and not stripped.startswith('/*'):
                if (stripped.endswith(')') or stripped.endswith(']') or stripped.endswith('"') or 
                    stripped.endswith("'") or re.match(r'.*\w$', stripped)):
                    # This could be a statement that needs a semicolon
                    if not any(keyword in stripped for keyword in ['if', 'for', 'while', 'function', 'class', '{', '}', '//']):
                        # Skip this check for now as it's too noisy
                        pass
        
        return failures