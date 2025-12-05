from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENAI_API_KEY")
)


def ask(question: str):
    completion = client.chat.completions.create(
        extra_body={},
        model="amazon/nova-2-lite-v1:free",
        messages=[{"role": "user", "content": f"{question}"}],
    )
    return completion.choices[0].message.content
