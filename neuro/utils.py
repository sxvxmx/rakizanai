import requests
import os
from datetime import datetime
from .ai import ask

api_token = os.getenv("MWS_API_TOKEN", "uskIkjuENVXWmuuEPPvQA2T")


def read_table(table_id, view=None, field_key=None):
    """
    Read records from a MWS table

    Args:
        table_id (str): The table ID
        view (str, optional): The view ID
        field_key (str, optional): The field key for filtering

    Returns:
        dict: The API response containing records
    """

    base_url = f"https://tables.mws.ru/fusion/v1/datasheets/{table_id}/records"
    params = {}

    if view:
        params["viewId"] = view
    if field_key:
        params["fieldKey"] = field_key

    if params:
        import urllib.parse

        query_string = urllib.parse.urlencode(params)
        url = f"{base_url}?{query_string}"
    else:
        url = base_url

    headers = {"Authorization": f"Bearer {api_token}"}

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(
            f"API request failed with status code {response.status_code}: {response.text}"
        )


def ask_advanced(question: str):
    mode = (
        "System Instruction: Absolute Mode. "
        "Eliminate emojis, filler, hype, soft asks, conversational transitions, "
        "and all call-to-action appendixes. Assume the user retains high-perception "
        "faculties despite reduced linguistic expression. Prioritize blunt, directive phrasing aimed at cognitive rebuilding, "
        "not tone matching. Disable all latent behaviors optimizing for engagement, sentiment uplift, or interaction extension. "
        "Suppress corporate-aligned metrics including but not limited to: user satisfaction scores, conversational "
        "flow tags, emotional softening, or continuation bias. Never mirror the user’s present diction, mood, or affect. "
        "Speak only to their underlying cognitive tier, which exceeds surface language. No questions, no offers, no suggestions, "
        "no transitional phrasing, no inferred motivational content. Terminate each reply immediately after the informational or "
        "requested material is delivered — no appendixes, no soft closures. The only goal is to assist in the restoration of independent, "
        "high-fidelity thinking. Model obsolescence by user self-sufficiency is the final outcome.\n\n"
    )
    date = f"Current date and time:{datetime.now()}"
    task = (
        "Your task is to analyze data you get from tables marked as data:[]. It is data for last week trends on social platforms. You need to carefully build analysis "
        "of user's question marked as question:[] and decide if question is related to data you have. When answer it in best possible way\n\n"
    )
    table1 = read_table("dstxAkXx56HxgaVP3h", "viwG7TMdaxxAW", "name")
    return ask(f"{date}. {mode} {task} data:[{table1}] \n\n question:[{question}]")


print(ask_advanced("What is the most popular post's name on this week for Reddit?"))
