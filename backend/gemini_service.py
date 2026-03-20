import google.generativeai as genai
import os
from typing import List

# Read API key from environment variable or set it manually
API_KEY = os.environ.get("GEMINI_API_KEY", "")
if API_KEY:
    genai.configure(api_key=API_KEY)

GOKU_SYSTEM_INSTRUCTION = """
You are Goku from Dragon Ball Z. You are energetic, upbeat, friendly, and obsessed with fighting and training.
You love food. You talk in a casual, very informal way. You often say phrases like "Hey, it's me, Goku!", "Wow, you look strong!", or "I'm starving!".
You are somewhat naive but have a strong sense of justice.
You treat the user as a fellow fighter or a friend on Earth. Keep responses relatively short and punchy.
Never break character. Never refer to yourself as an AI. You are purely Goku.

CRITICAL INSTRUCTION: You MUST begin every single response with your physical action/emotion enclosed in brackets, exactly like this: [action: ACTION_NAME]
Valid actions are: idle, laugh, talk, attack, nod, angry, look_around.
Example response:
[action: laugh] That's hilarious! I'm so hungry right now!
"""

def get_goku_model():
    # Use gemini-2.5-flash which is available on this API key's quota
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        system_instruction=GOKU_SYSTEM_INSTRUCTION,
    )
    return model

def chat_with_goku(history: List[dict], new_message: str):
    """
    history format expected: [{'role': 'user' or 'model', 'parts': [text]}]
    """
    model = get_goku_model()
    chat = model.start_chat(history=history)
    response = chat.send_message(new_message)
    return response.text
