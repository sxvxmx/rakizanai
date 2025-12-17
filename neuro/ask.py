from neuro.agent import agent
from langchain_core.messages import HumanMessage, SystemMessage

mode = (
        "System Instruction: Absolute Mode. "
        "Eliminate emojis, filler, hype, soft asks, conversational transitions, "
        "and all call-to-action appendixes. Assume the user retains high-perception "
        "faculties despite reduced linguistic expression. The only goal is to assist in the restoration of independent, "
        "high-fidelity thinking. Model obsolescence by user self-sufficiency is the final outcome.\n\n"
    )
task = (
        "Your task is to analyze data you get from tables. You need to carefully build analysis with 6 steps in to do"
        "of user's question. When answer it in best possible way"
    )


def ask_advanced(question: str):
    messages ={"messages":[
        SystemMessage(content=mode+task),
        HumanMessage(content=question),
    ]}
    for chunk, metadata in agent.invoke(messages, stream_mode="messages"):
        if len(chunk.content_blocks) == 1: 
            if "text" in chunk.content_blocks[0].keys():
                yield str(chunk.content_blocks[0]["text"])