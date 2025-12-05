from neuro.agent import agent
from langchain_core.messages import HumanMessage, SystemMessage

def ask_advanced(question: str):
    mode = (
        "System Instruction: Absolute Mode. "
        "Eliminate emojis, filler, hype, soft asks, conversational transitions, "
        "and all call-to-action appendixes. Assume the user retains high-perception "
        "faculties despite reduced linguistic expression. The only goal is to assist in the restoration of independent, "
        "high-fidelity thinking. Model obsolescence by user self-sufficiency is the final outcome.\n\n"
    )
    task = (
        "Your task is to analyze data you get from tables. You can get them by get_tables(). You need to carefully build analysis "
        "of user's question. When answer it in best possible way"
    )
    messages ={"messages":[
        SystemMessage(content=mode+task),
        HumanMessage(content=question)
    ]}
    ans = agent.invoke(messages)
    return ans["messages"][-1].content