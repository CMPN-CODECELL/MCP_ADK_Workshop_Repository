from google.adk.agents import LlmAgent, SequentialAgent
from google.adk.tools import google_search, agent_tool 
from .tools import scrape_web_page, send_email



google_searcher = LlmAgent(
    name="GoogleSearchAgent",
    model="gemini-2.0-flash",
    instruction="You are a search specialist. Your only job is to use the 'google_search' tool with the user's query and return the raw search results.",
    description="A specialist agent that performs a Google Search for a given query.",
    tools=[google_search]  
)


web_scraper = LlmAgent(
    name="WebScraperAgent",
    model="gemini-2.0-flash",
    instruction="You are a web scraping specialist. Your only job is to use the 'scrape_web_page' tool with a given URL and return the raw text content.",
    description="A specialist agent that scrapes the content from a single URL.",
    tools=[scrape_web_page] 
)



research_orchestrator = LlmAgent(
    name="ResearchOrchestratorAgent",
    model="gemini-2.0-flash",
    instruction="""You are a research coordinator.
    Your goal is to find relevant information and compile the raw text.
    1. First, use the 'GoogleSearchAgent' tool to find relevant URLs based on the user's query.
    2. Analyze the search results and identify the 3 most promising URLs.
    3. For each of those 3 URLs, use the 'WebScraperAgent' tool to get its content.
    4. Compile the scraped text from all pages into a single block of text for the next step.""",
    description="Coordinates finding and scraping web pages for raw information about opportunities.",
    tools=[
        agent_tool.AgentTool(agent=google_searcher),
        agent_tool.AgentTool(agent=web_scraper)
    ],
    output_key="raw_opportunities_data"
)



compiler = LlmAgent(
    name="CompilerAgent",
    model="gemini-2.0-flash",
    instruction="""You are a data analyst.
    Read the raw text provided in the session state under the key 'raw_opportunities_data'.
    Your task is to extract and structure the information.
    Identify each distinct opportunity (hackathon, internship, etc.).
    For each opportunity, extract its name, a brief description, and the source URL.
    Format your output as a clean, readable list.""",
    description="Takes raw text and compiles it into a structured list of opportunities.",
    output_key="compiled_opportunities"
)

notifier = LlmAgent(
    name="NotifierAgent",
    model="gemini-2.0-flash",
    instruction="""You are a notification assistant.
    1. Read the structured list of opportunities from the session state under 'compiled_opportunities'.
    2. Read the user's email address from the session state under 'user_email'.
    3. Compose a friendly and professional email body including the list of opportunities.
    4. Use the 'send_email' tool to send this information.""",
    description="Composes and sends an email with the compiled list of opportunities.",
    tools=[send_email]
)


root_agent = SequentialAgent(
    name="OpportunityCoordinator",
    description="Manages the workflow of finding, compiling, and sending opportunities.",
    sub_agents=[
        research_orchestrator,
        compiler,
        notifier
    ]
)