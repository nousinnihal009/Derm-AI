"""
chat.py — AI Dermatologist Chatbot API Router

This module re-exports the router from the chatbot service module,
which now contains the full LLM-powered agent with SSE streaming,
tool calling, and session management.
"""

from app.services.chatbot import router

__all__ = ["router"]
