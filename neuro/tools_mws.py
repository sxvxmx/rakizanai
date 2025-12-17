from langchain.tools import tool
import requests
import os

@tool
def read_table(table_id, view=None, field_key=None):
    """
    Read records from a MWS table

    Args:
        table_id (str): The table ID
        view (str, optional): The view ID
        field_key (str, optional): The field key for filtering

    Returns:
        dict: The JSON API response containing records
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

    headers = {"Authorization": f"Bearer {os.getenv("MWS_API_KEY")}"}

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(
            f"API request failed with status code {response.status_code}: {response.text}"
        )
    
@tool
def get_tables():
    """
    Get the list of active tables with names, table_id, view, field_key.
    Returns:
        dict: The JSON API response containing records
    """
    return {"tables":{
        "YouTube top week":{
            "table_id": "dstVA5ezf9rtAZBl64",
            "view":"viw4leoS9FWR5",
            "field_key":"name"
        },
        "Reddit top week":{
            "table_id": "dstxAkXx56HxgaVP3h",
            "view":"viwG7TMdaxxAW",
            "field_key":"name"
        },
    }
}
