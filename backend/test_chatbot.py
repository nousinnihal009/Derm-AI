import asyncio
import os
import sys

# add parent directory to path so imports work
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.chatbot import stream_chat_response

async def main():
    print("Testing stream_chat_response...")
    async for event in stream_chat_response(
        user_id="test_user",
        session_id="test_session",
        user_message="Is this mole something to worry about?",
        location=None,
        image_id=None
    ):
        print(event, end="")

if __name__ == "__main__":
    asyncio.run(main())
