"""
Main Orchestrator Agent - coordinates all sub-agents for CI/CD healing
Uses LangGraph for multi-agent architecture
"""

import os
import json
import time
import asyncio
import logging
import platform
from typing import TypedDict, List, Dict, Any, Optional, Annotated
from datetime import datetime

from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

# Set Windows event loop policy at module level
if platform.system() == 'Windows':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from agents.repo_analyzer import RepoAnalyzerAgent
from agents.test_runner import TestRunnerAgent
from agents.code_fixer import CodeFixerAgent
from agents.git_agent import GitAgent
from agents.cicd_monitor import CICDMonitorAgent
from tools.sandbox import SandboxExecutor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AgentState(TypedDict):
    """Shared state across all agents in the graph"""
    repo_url: str
    team_name: str
    leader_name: str
    branch_name: str
    repo_path: str
    start_time: float
    
    # Analysis results
    files_discovered: List[str]
    test_files: List[str]
    
    # Failure tracking
    failures: List[Dict[str, Any]]
    total_failures: int
    
    # Fix tracking
    fixes_applied: List[Dict[str, Any]]
    total_fixes: int
    commit_count: int
    
    # CI/CD tracking
    cicd_runs: List[Dict[str, Any]]
    iteration: int
    max_iterations: int
    all_tests_passed: bool
    
    # Results
    final_status: str
    score: Dict[str, Any]
    error: Optional[str]
    
    # Messaging
    messages: List[str]


def create_branch_name(team_name: str, leader_name: str) -> str:
    """Create branch name following EXACT format: TEAM_NAME_LEADER_NAME_AI_Fix"""
    team = team_name.upper().replace(" ", "_")
    leader = leader_name.upper().replace(" ", "_")
    # Remove special chars except underscores
    import re
    team = re.sub(r'[^A-Z0-9_]', '', team)
    leader = re.sub(r'[^A-Z0-9_]', '', leader)
    return f"{team}_{leader}_AI_Fix"


def calculate_score(state: AgentState) -> Dict[str, Any]:
    """Calculate final score based on rules"""
    base_score = 100
    elapsed = time.time() - state["start_time"]
    
    speed_bonus = 10 if elapsed < 300 else 0  # 5 minutes
    efficiency_penalty = max(0, (state["commit_count"] - 20)) * 2
    
    final_score = base_score + speed_bonus - efficiency_penalty
    
    return {
        "base_score": base_score,
        "speed_bonus": speed_bonus,
        "efficiency_penalty": efficiency_penalty,
        "final_score": max(0, final_score),
        "elapsed_seconds": int(elapsed)
    }


class CICDHealingOrchestrator:
    """Main orchestrator that coordinates all agents"""
    
    def __init__(self):
        self.sandbox = SandboxExecutor()
        self.repo_analyzer = RepoAnalyzerAgent()
        self.test_runner = TestRunnerAgent()
        self.code_fixer = CodeFixerAgent()
        self.git_agent = GitAgent()
        self.cicd_monitor = CICDMonitorAgent()
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph state machine"""
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node("clone_repo", self._clone_repo)
        workflow.add_node("analyze_repo", self._analyze_repo)
        workflow.add_node("create_branch", self._create_branch)
        workflow.add_node("run_tests", self._run_tests)
        workflow.add_node("fix_code", self._fix_code)
        workflow.add_node("commit_fixes", self._commit_fixes)
        workflow.add_node("monitor_cicd", self._monitor_cicd)
        workflow.add_node("finalize", self._finalize)
        
        # Define flow
        workflow.set_entry_point("clone_repo")
        workflow.add_edge("clone_repo", "analyze_repo")
        workflow.add_edge("analyze_repo", "create_branch")
        workflow.add_edge("create_branch", "run_tests")
        
        # Conditional: if failures, fix; else finalize
        workflow.add_conditional_edges(
            "run_tests",
            self._should_fix,
            {
                "fix": "fix_code",
                "done": "finalize"
            }
        )
        
        workflow.add_edge("fix_code", "commit_fixes")
        workflow.add_edge("commit_fixes", "monitor_cicd")
        
        # Conditional: retry or finalize
        workflow.add_conditional_edges(
            "monitor_cicd",
            self._should_retry,
            {
                "retry": "run_tests",
                "done": "finalize"
            }
        )
        
        workflow.add_edge("finalize", END)
        
        return workflow.compile(checkpointer=MemorySaver())
    
    def _should_fix(self, state: AgentState) -> str:
        if state["failures"] and len(state["failures"]) > 0:
            return "fix"
        return "done"
    
    def _should_retry(self, state: AgentState) -> str:
        if (not state["all_tests_passed"] and 
            state["iteration"] < state["max_iterations"]):
            return "retry"
        return "done"
    
    async def _clone_repo(self, state: AgentState) -> AgentState:
        logger.info(f"Cloning repository: {state['repo_url']}")
        try:
            repo_path = await self.git_agent.clone(state["repo_url"])
            return {**state, "repo_path": repo_path, 
                    "messages": state["messages"] + [f"Cloned repo to {repo_path}"]}
        except Exception as e:
            return {**state, "error": str(e)}
    
    async def _analyze_repo(self, state: AgentState) -> AgentState:
        logger.info("Analyzing repository structure...")
        files, test_files = await self.repo_analyzer.analyze(state["repo_path"])
        return {
            **state,
            "files_discovered": files,
            "test_files": test_files,
            "messages": state["messages"] + [f"Found {len(test_files)} test files"]
        }
    
    async def _create_branch(self, state: AgentState) -> AgentState:
        logger.info(f"Creating branch: {state['branch_name']}")
        await self.git_agent.create_branch(state["repo_path"], state["branch_name"])
        return {**state, "messages": state["messages"] + [f"Created branch {state['branch_name']}"]}
    
    async def _run_tests(self, state: AgentState) -> AgentState:
        logger.info("Running test suite...")
        failures = await self.test_runner.run_all_tests(
            state["repo_path"], state["test_files"]
        )
        return {
            **state,
            "failures": failures,
            "total_failures": len(failures),
            "messages": state["messages"] + [f"Found {len(failures)} failures"]
        }
    
    async def _fix_code(self, state: AgentState) -> AgentState:
        logger.info(f"Fixing {len(state['failures'])} failures...")
        fixes = await self.code_fixer.fix_failures(
            state["repo_path"], state["failures"]
        )
        return {
            **state,
            "fixes_applied": state["fixes_applied"] + fixes,
            "total_fixes": state["total_fixes"] + len(fixes),
            "messages": state["messages"] + [f"Applied {len(fixes)} fixes"]
        }
    
    async def _commit_fixes(self, state: AgentState) -> AgentState:
        logger.info("Committing fixes...")
        commit_msg = f"[AI-AGENT] Fix {len(state['fixes_applied'])} issues - iteration {state['iteration'] + 1}"
        await self.git_agent.commit_and_push(
            state["repo_path"], commit_msg, state["branch_name"]
        )
        return {
            **state,
            "commit_count": state["commit_count"] + 1,
            "messages": state["messages"] + [f"Committed: {commit_msg}"]
        }
    
    async def _monitor_cicd(self, state: AgentState) -> AgentState:
        logger.info("Monitoring CI/CD pipeline...")
        run_result = await self.cicd_monitor.check_pipeline(
            state["repo_url"], state["branch_name"]
        )
        
        cicd_run = {
            "iteration": state["iteration"] + 1,
            "status": run_result["status"],
            "timestamp": datetime.now().isoformat(),
            "details": run_result.get("details", "")
        }
        
        # For local verification (no external CI/CD), don't mark as passed yet
        # The workflow will loop back to run_tests to verify
        all_passed = run_result["status"] == "passed"
        
        return {
            **state,
            "cicd_runs": state["cicd_runs"] + [cicd_run],
            "iteration": state["iteration"] + 1,
            "all_tests_passed": all_passed,
            "messages": state["messages"] + [f"CI/CD iteration {state['iteration'] + 1}: {run_result['status']}"]
        }
    
    async def _finalize(self, state: AgentState) -> AgentState:
        logger.info("Finalizing results...")
        score = calculate_score(state)
        
        # Determine final status:
        # - NO_ISSUES_FOUND if no failures were ever detected (healthy from start)
        # - PASSED if all tests passed after applying fixes
        # - FAILED if there are still failures after max iterations
        if state["total_failures"] == 0 and state["total_fixes"] == 0:
            # No failures detected at all - repository was already healthy
            final_status = "NO_ISSUES_FOUND"
        elif state["all_tests_passed"]:
            # Tests passed after fixes
            final_status = "PASSED"
        elif state["total_fixes"] > 0 and len(state["failures"]) == 0:
            # Had failures, applied fixes, and now no failures remain
            final_status = "PASSED"
        elif len(state["failures"]) > 0 and state["iteration"] >= state["max_iterations"]:
            # Still have failures after max iterations
            final_status = "FAILED"
        else:
            final_status = "FAILED"
        
        return {
            **state,
            "score": score,
            "final_status": final_status,
            "messages": state["messages"] + [f"Completed! Status: {final_status}, Score: {score['final_score']}"]
        }
    
    async def run(self, repo_url: str, team_name: str, leader_name: str) -> Dict[str, Any]:
        """Main entry point to run the healing agent"""
        branch_name = create_branch_name(team_name, leader_name)
        
        initial_state = AgentState(
            repo_url=repo_url,
            team_name=team_name,
            leader_name=leader_name,
            branch_name=branch_name,
            repo_path="",
            start_time=time.time(),
            files_discovered=[],
            test_files=[],
            failures=[],
            total_failures=0,
            fixes_applied=[],
            total_fixes=0,
            commit_count=0,
            cicd_runs=[],
            iteration=0,
            max_iterations=5,
            all_tests_passed=False,
            final_status="RUNNING",
            score={},
            error=None,
            messages=[]
        )
        
        config = {"configurable": {"thread_id": f"{team_name}_{int(time.time())}"}}
        
        final_state = await self.graph.ainvoke(initial_state, config)
        
        result = self._build_result(final_state)
        
        # Save results.json
        results_path = os.path.join(
            os.getenv("RESULTS_DIR", "/tmp/results"), 
            f"results_{int(time.time())}.json"
        )
        os.makedirs(os.path.dirname(results_path), exist_ok=True)
        with open(results_path, "w") as f:
            json.dump(result, f, indent=2)
        
        return result
    
    def _build_result(self, state: AgentState) -> Dict[str, Any]:
        elapsed = time.time() - state["start_time"]
        
        return {
            "repo_url": state["repo_url"],
            "team_name": state["team_name"],
            "leader_name": state["leader_name"],
            "branch_name": state["branch_name"],
            "total_failures": state["total_failures"],
            "total_fixes": state["total_fixes"],
            "commit_count": state["commit_count"],
            "final_status": state["final_status"],
            "elapsed_seconds": int(elapsed),
            "score": state["score"],
            "fixes_applied": state["fixes_applied"],
            "cicd_runs": state["cicd_runs"],
            "messages": state["messages"],
            "error": state["error"]
        }