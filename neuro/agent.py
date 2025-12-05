from langchain_openai import ChatOpenAI
from langchain.agents import create_agent
import os
from dotenv import load_dotenv
from neuro.tools_mws import get_tables, read_table
from neuro.tools_utils import time, creators, whoami

load_dotenv()

model = ChatOpenAI(
        openai_api_base="https://openrouter.ai/api/v1",
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        model_name="amazon/nova-2-lite-v1:free",
        temperature=0.9)

agent = create_agent(model, tools=[get_tables, read_table, time, creators, whoami])
