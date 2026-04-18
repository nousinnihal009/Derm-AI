import ast, sys

try:
    with open("app/services/chatbot.py", "r", encoding="utf-8") as f:
        src = f.read()
    tree = ast.parse(src)
    print("AST parse: OK")
except SyntaxError as e:
    print(f"SYNTAX ERROR: {e}")
    sys.exit(1)

# ── Check dead code is gone ───────────────────────────────────────────
checks = {
    "GPT_MODEL not present":              "GPT_MODEL" not in src,
    "GPT_MINI_MODEL not present":         "GPT_MINI_MODEL" not in src,
    "tool_calls_accumulated not present": "tool_calls_accumulated" not in src,
    "openai not imported":                "import openai" not in src and "from openai" not in src,
    "AsyncOpenAI not present":            "AsyncOpenAI" not in src,
}

# ── Check required symbols exist ──────────────────────────────────────
required_names = [
    "stream_chat_response", "_apply_safety_filter", "_to_gemini_history",
    "classify_intent", "generate_suggestion_chips", "_sse_event",
    "IntentType", "IntentResult", "TurnMetadata", "GEMINI_TOOLS",
    "_build_gemini_tools", "get_turn_index", "GEMINI_PRO_MODEL",
    "GEMINI_FLASH_MODEL", "_GEMINI_READY", "_SAFETY_TRIGGERS",
    "build_messages", "dispatch_tool_call", "SYSTEM_PROMPT",
    "TOOL_SCHEMAS", "router",
]

all_names = {node.name for node in ast.walk(tree)
             if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef))}
all_names |= {node.targets[0].id for node in ast.walk(tree)
              if isinstance(node, ast.Assign) and node.targets
              and isinstance(node.targets[0], ast.Name)}
# Also capture type-annotated assignments (e.g., GEMINI_TOOLS: list[Tool] = ...)
all_names |= {node.target.id for node in ast.walk(tree)
              if isinstance(node, ast.AnnAssign)
              and isinstance(node.target, ast.Name)}

for name in required_names:
    checks[f"'{name}' defined"] = name in all_names

# ── Check all 6 SSE types exist in source ─────────────────────────────
for evt in ["text_delta", "tool_call", "structured_routine", "suggestion_chips", "done", "error"]:
    checks[f"SSE type '{evt}' in source"] = f'"{evt}"' in src or f"'{evt}'" in src

# ── Print results ─────────────────────────────────────────────────────
passed = 0
failed = 0
for desc, ok in checks.items():
    status = "PASS" if ok else "FAIL"
    if ok:
        passed += 1
    else:
        failed += 1
        print(f"  [{status}] {desc}")

# Only print all if everything passes
if failed == 0:
    for desc, ok in checks.items():
        print(f"  [PASS] {desc}")

print(f"\nResults: {passed}/{len(checks)} checks passed")
sys.exit(0 if failed == 0 else 1)
