import os
import smtplib
import imaplib
import email
import pandas as pd
from datetime import datetime
from email.message import EmailMessage
from dotenv import load_dotenv

from google.adk.agents import LlmAgent, SequentialAgent
from google.adk.tools import FunctionTool
from google.adk.tools.tool_context import ToolContext
from google.adk.events import Event

load_dotenv()
GEMINI_MODEL = "gemini-1.5-flash"
LOG_FILE = "email_log.xlsx"

def fetch_latest_unread_email_tool(tool_context: ToolContext) -> dict:
    print("\n--- TOOL: fetch_latest_unread_email_tool CALLED ---")
    IMAP_SERVER = "imap.gmail.com"; EMAIL_ACCOUNT = os.environ.get("SENDER_EMAIL"); EMAIL_PASSWORD = os.environ.get("SENDER_PASSWORD"); result = {}
    if not EMAIL_ACCOUNT or not EMAIL_PASSWORD: result = {"status": "error", "message": "Email credentials not configured."}
    else:
        try:
            mail = imaplib.IMAP4_SSL(IMAP_SERVER); mail.login(EMAIL_ACCOUNT, EMAIL_PASSWORD); mail.select('inbox'); _, messages = mail.search(None, 'UNSEEN'); email_ids = messages[0].split()
            if not email_ids: mail.logout(); result = {"status": "no_email", "message": "No new unread emails."}
            else:
                latest_id = email_ids[-1]; _, msg_data = mail.fetch(latest_id, '(RFC822)'); msg = email.message_from_bytes(msg_data[0][1]); sender_email = email.utils.parseaddr(msg.get("From"))[1]; body = ""
                if msg.is_multipart():
                    for part in msg.walk():
                        if part.get_content_type() == "text/plain": body = part.get_payload(decode=True).decode(); break
                else: body = msg.get_payload(decode=True).decode()
                mail.store(latest_id, '+FLAGS', '\\Seen'); mail.logout(); result = {"status": "success", "sender": sender_email, "body": body}
        except Exception as e: result = {"status": "error", "message": f"Failed to fetch email: {e}"}
    tool_context.state["fetched_email_data"] = result; print(f"--- TOOL: Wrote to state['fetched_email_data']: {result} ---"); return result

def send_email_real(tool_context: ToolContext, recipient_email: str, subject: str) -> dict:
    print("--- TOOL: send_email_real CALLED ---")
    sender_email = os.environ.get("SENDER_EMAIL"); sender_password = os.environ.get("SENDER_PASSWORD"); drafted_body = tool_context.state.get("drafted_reply", "");
    msg = EmailMessage(); msg.set_content(drafted_body); msg['Subject'] = subject; msg['From'] = sender_email; msg['To'] = recipient_email
    try:
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465); server.login(sender_email, sender_password); server.send_message(msg); server.quit()
        return {"status": "success", "message": f"Email sent to {recipient_email}"}
    except Exception as e: return {"status": "error", "message": f"Failed to send email: {e}"}

def log_interaction_to_excel(tool_context: ToolContext) -> dict:
    print("--- TOOL: log_interaction_to_excel CALLED ---")
    try:
        state = tool_context.state
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        sender = state.get("fetched_email_data", {}).get("sender", "unknown")
        original_email = state.get("fetched_email_data", {}).get("body", "")
        reply_sent = state.get("drafted_reply", "")
        
        sender_name = "Unknown"
        if sender != "unknown":
            if '<' in sender:
                sender_name = sender.split('<')[0].strip().strip('"')
            else:
                sender_name = sender.split('@')[0] if '@' in sender else sender
        
        new_log_entry = pd.DataFrame([{
            "Timestamp": timestamp, 
            "Sender": sender,
            "SenderName": sender_name,
            "OriginalEmail": original_email, 
            "ReplySent": reply_sent
        }])
        
        if os.path.exists(LOG_FILE): 
            log_df = pd.read_excel(LOG_FILE)
            log_df = pd.concat([log_df, new_log_entry], ignore_index=True)
        else: 
            log_df = new_log_entry
            
        log_df.to_excel(LOG_FILE, index=False)
        return {"status": "success", "message": f"Logged to {LOG_FILE}"}
    except Exception as e: 
        return {"status": "error", "message": f"Failed to log: {e}"}

fetcher_agent = LlmAgent(name="FetcherAgent", model=GEMINI_MODEL, instruction="Call 'fetch_latest_unread_email_tool'.", tools=[FunctionTool(func=fetch_latest_unread_email_tool)])
drafting_agent = LlmAgent(
    name="DraftingAgent", 
    model=GEMINI_MODEL, 
    instruction="""You are a customer service representative drafting a reply email. Write a complete, professional email response to the customer's inquiry.

    CRITICAL RULES - NEVER BREAK THESE:
    1. NO PLACEHOLDERS: Never write [recipient name], [your name], [company name], [contact info], or any text in brackets
    2. NO TEMPLATE LANGUAGE: Never write "Dear [Name]" - always write "Dear Customer" or "Hello"
    3. BE SPECIFIC: Address their actual question from the email content
    4. BE COMPLETE: Write the full email ready to send, not a template

    Format your response like this real example:
    Hello,

    Thank you for reaching out to us. I understand you're having an issue with your order.

    I'd be happy to help you resolve this. Based on your message, I can see that you're concerned about the delivery status. Let me look into this for you and provide an update within the next business day.

    In the meantime, if you have any other questions, please don't hesitate to contact us.

    Best regards,
    Customer Support Team

    Remember: Write the COMPLETE email body with NO placeholders or brackets anywhere.""",
    output_key="drafted_reply"
)
sending_agent = LlmAgent(
    name="SendingAgent", 
    model=GEMINI_MODEL, 
    instruction="Use 'send_email_real'. Recipient is state['fetched_email_data']['sender']. Subject 'Re: Your Inquiry'.", 
    tools=[send_email_real]
)
logging_agent = LlmAgent(
    name="LoggingAgent", 
    model=GEMINI_MODEL, 
    instruction="Call 'log_interaction_to_excel'.", 
    tools=[log_interaction_to_excel]
)

email_processing_sequence = SequentialAgent(
    name="EmailProcessingSequence",
    sub_agents=[
        drafting_agent,
        sending_agent,
        logging_agent
    ]
)

class GateAgent(LlmAgent):
    async def _run_async_impl(self, ctx):
        email_data = ctx.session.state.get("fetched_email_data", {})
        status = email_data.get("status")
        if status == "success":
            print("--- GATE AGENT: Email found, running processing sequence. ---")
            async for event in email_processing_sequence.run_async(ctx):
                yield event
        else:
            print("--- GATE AGENT: No new email, stopping workflow for this run. ---")
            yield Event(author=self.name, content=None)

root_agent = SequentialAgent(
    name="CustomerEmailWorkflow",
    sub_agents=[
        fetcher_agent,
        GateAgent(name="GateAgent")
    ],
    description="An integrated workflow that first fetches an email, then decides whether to process it."
)