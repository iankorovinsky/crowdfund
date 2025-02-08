from typing_extensions import TypedDict
from langgraph.graph import START, StateGraph, END

# Define the state schema
class State(TypedDict):
    value_1: str
    value_2: int
    value_3: int
    value_4: int
    result: int

# Define the steps
def step_1(state: State):
    return {"value_1": "a"}

def step_2(state: State):
    current_value_1 = state["value_1"]
    return {"value_2": len(current_value_1)}

def step_3(state: State):
    return {"value_3": 10}

def step_4(state: State):
    return {"value_4": 20}

def step_5(state: State):
    return {
        "value_1": state["value_1"],
        "value_2": state["value_2"],
        "value_3": state["value_3"],
        "value_4": state["value_4"],
        "result": state["value_2"] + state["value_3"] + state["value_4"]
    }

# Initialize the graph builder
graph_builder = StateGraph(State)

# Add nodes
graph_builder.add_node(step_1)
graph_builder.add_node(step_2)
graph_builder.add_node(step_3)
graph_builder.add_node(step_4)
graph_builder.add_node(step_5)

# Add edges
graph_builder.add_edge(START, "step_1")
graph_builder.add_edge("step_1", "step_2")
graph_builder.add_edge("step_1", "step_3")
graph_builder.add_edge("step_1", "step_4")
graph_builder.add_edge("step_2", "step_5")
graph_builder.add_edge("step_3", "step_5")
graph_builder.add_edge("step_4", "step_5")
graph_builder.add_edge("step_5", END)

# Compile the graph
graph = graph_builder.compile()

# Invoke the graph with initial state
print(graph.invoke({"value_1": "c"}))