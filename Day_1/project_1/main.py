from mcp.server.fastmcp import FastMCP
import gradio as gr

# Create a MCP Server
mcp = FastMCP("My first MCP server")

# Defining weather tools
@mcp.tool()
def get_weather(location: str) -> str:
    """
    Get the current weather for a given location.
    
    Args:
        location (str) : The name of the location to get the weather for.

    Returns:
        str: The current weather information for the specified location.
    """

    return f"The weather for the given {location} : Sunny, 72 F"

@mcp.resource("weather://{location}")
def get_weather_resource(location: str) -> str:
    """
    Resource to get the current weather for the given location
    
    Args:
        location (str) : The name of the location to get the weather for.
    """
    
    return f"The weather for the given {location} : Sunny, 72 F"

@mcp.prompt()
def weather_prompt(location: str) -> str:
    """
    Create a weather report prompt
    """

    return f"You are an weather expert and you are supposed to provide weather informat for the given location {location}."

@mcp.tool()
def add_two_numbers(a: int, b: int) -> int:
    """
    Add two numbers 
    
    Args:
    a : int
    b : int
    
    Returns:
    int: The sum of the two numbers.
    """
    return a + b

# Here will be defining the Gradio UI

def weather_ui(location: str) -> str:
    return get_weather(location)

def math_ui(a: int, b: int) -> int:
    return add_two_numbers(a, b)

with gr.Blocks(title="My first MCP server") as demo:
    gr.Markdown("## Weather + Math MCP Server")

    with gr.Tab("Weather Service"):
        location_input = gr.Textbox(label="Enter Location")
        weather_output = gr.Textbox(label="Weather Result")
        weather_btn = gr.Button("Get Weather")
        weather_btn.click(fn=weather_ui, inputs=location_input, outputs=weather_output)

    with gr.Tab("Math Service"):
        num_1_input = gr.Number(label="Enter First Number")
        num_2_input = gr.Number(label="Enter Second Number")
        math_output = gr.Number(label="Sum")
        math_btn = gr.Button("Add Numbers")
        math_btn.click(fn=math_ui, inputs=[num_1_input, num_2_input], outputs=math_output)
    
# Running the MCP server
if __name__ == "__main__":
    demo.launch(mcp_server=True)