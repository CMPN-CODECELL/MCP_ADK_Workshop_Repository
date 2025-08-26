import asyncio
import time
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types


from customer_email_agent.agent import root_agent


APP_NAME = "customer_email_agent"
USER_ID = "system_user" 

async def main():
    """Sets up the ADK runner and runs the workflow in a loop."""
    session_service = InMemorySessionService()
    runner = Runner(
        agent=root_agent,
        app_name=APP_NAME,
        session_service=session_service
    )
    
    print("Starting integrated email processing workflow...")
    print("Press Ctrl+C to stop.")

    while True:
        
        session_id = f"workflow_run_{int(time.time())}"
        await session_service.create_session(
            app_name=APP_NAME,
            user_id=USER_ID,
            session_id=session_id
        )
        
       
        trigger_message = types.Content(role="user", parts=[types.Part(text="Check for new emails and process.")])
        
     
        async for event in runner.run_async(
            user_id=USER_ID,
            session_id=session_id,
            new_message=trigger_message
        ):
           
            if event.is_final_response() and event.content:
                if event.content.parts[0].text:
                     print(f"Workflow finished. Final message: {event.content.parts[0].text}")

      
        print("\nWaiting for 30 seconds before next check...")
        await asyncio.sleep(30)

if _name_ == "_main_":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nWorkflow stopped by user.")