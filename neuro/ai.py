from openai import OpenAI

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key="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",
)


def ask(question: str):
    completion = client.chat.completions.create(
        extra_body={},
        model="z-ai/glm-4.5-air:free",
        messages=[{"role": "user", "content": f"{question}"}],
    )
    return completion.choices[0].message.content
