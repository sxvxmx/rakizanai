from datetime import datetime
from langchain.tools import tool

@tool
def time():
    """
    Get current time and date
    Returns:
        str: current date and time string
    """
    return f"Current date and time:{datetime.now()}"

@tool
def whoami():
    """
    Information about you (agent) on how you should present yourself if asked
    Returns:
        str: self description/introduction
    """
    return "He who knows other is wise. He who knows himself is enlightened"

@tool
def creators():
    """
    Information about creators
    Returns:
        str: github nicknames
    """
    return "ML: sxvxmx, frontend: m5tshift"