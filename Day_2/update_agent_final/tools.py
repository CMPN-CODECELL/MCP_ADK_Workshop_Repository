import os
import smtplib
from email.message import EmailMessage


import requests
from bs4 import BeautifulSoup


def scrape_web_page(url: str) -> dict:
    """
    Scrapes the text content from a given URL.

    Args:
        url (str): The URL of the web page to scrape.

    Returns:
        dict: A dictionary with 'status' and 'content' or 'error_message'.
    """
    try:
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()  
        soup = BeautifulSoup(response.text, 'html.parser')

        return {"status": "success", "content": soup.get_text(separator=' ', strip=True)[:4000]}
    except requests.RequestException as e:
        return {"status": "error", "error_message": f"Failed to retrieve URL: {str(e)}"}


def send_email(recipient_email: str, subject: str, body: str) -> dict:
    """
    Sends an email to the specified recipient using Gmail's SMTP server.

    Args:
        recipient_email (str): The email address of the recipient.
        subject (str): The subject of the email.
        body (str): The content of the email.

    Returns:
        dict: A dictionary indicating the status of the email sending process.
    """
    sender_email = os.environ.get("SENDER_EMAIL")
    sender_password = os.environ.get("SENDER_PASSWORD")

    if not sender_email or not sender_password:
        return {"status": "error", "error_message": "Gmail sender email or app password is not configured in the .env file."}

  
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = sender_email
    msg['To'] = sender_email
    msg.set_content(body)

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(sender_email, sender_password)
            smtp.send_message(msg)
        return {"status": "success", "message": f"Email successfully sent to {sender_email}"}
    except Exception as e:
        return {"status": "error", "error_message": str(e)}