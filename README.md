# 🤖 Beyond the Code: A Hands-On Workshop on MCP-ADK

Welcome to the official repository for the **Beyond the Code** organized by **Tinkers CodeCell, CMPN Department – VESIT** 🎓.  
Here, you’ll learn how to build intelligent agents using **Google’s Agent Development Kit (ADK)** and explore the **Model Context Protocol (MCP)** both of which are currently in high demand and used heavily in top AI hackathons.

---

## 📅 Day 1: MCP Deep Dive

- MCP architecture: Servers, clients & JSON-RPC
- Build Claude Desktop integrations (MCP client)
- Real-time communication projects

## 📅 Day 2: Agentic Revolution

- ADK vs. frameworks: Why Google's toolkit wins
- Design agents for Vertex AI/A2A ecosystems
- Build production-ready AI agents

---

## 🚀 What You'll Learn exactly ?

- Deep dive into **MCP architecture** (servers, clients, JSON-RPC)
- Building **Claude Desktop Integrations (MCP client)**
- Designing and deploying **AI Agents with Google ADK**
- Comparing ADK with other frameworks
- Production-ready **agent development for Vertex AI/A2A ecosystems**

---

## 🛠️ Prerequisites

Before you begin with repository, ensure the following are installed and ready:

### ✅ Accounts

- [GitHub](https://github.com/)
- [Discord](https://discord.com/download?)
- [Hugging Face](https://huggingface.co/)

### ✅ Tools

- [Git](https://git-scm.com/downloads)
- [Claude Desktop](https://support.anthropic.com/en/articles/10065433-installing-claude-desktop?) _(for Day 1)_
- [Python 3.12+](https://www.python.org/downloads/) & **Pip 25.2 ONLY** _(for Day 2)_

---

## 📂 Setting Up Locally

Follow these steps to use this repo and start learning on your own:


#### ⚡Steps for Day 1

We will be creating a MCP server integrating with claude so that there is no more need to run git commands to push code on github everthing would be done with our prompt.

1. **Go to [Hugging Face](https://huggingface.co/)**

- Create a new space with *selecting space SDK as **Gradio*** rest all keep default as it is.
- Go to files tab and *create app.py* and *requirement.txt* file and write mentioned code in repo in respective files

- Commit each file code properly then click on your username in right side humburger menu

- You can see your created space with name now click on that to see output.

- You will now see an UI interface with which you can interact.


2. **open VS code and Clone this repository**

   ```bash
   # Clone REPO to local
   git clone https://github.com/CMPN-CODECELL/MCP_ADK_Workshop_Repository
   cd MCP_ADK_Workshop_Repository

   # Change directory to dev_assistant_starter folder
   cd Day_1/dev_assistant_starter

   # Install required dependencies
   npm install
   ```

3. **Create a new *test_repo* folder on your desktop**
- Create a new repo on github
- Clone this new repo to created *test_repo* folder
- Copy the path of this test_repo folder and index.ts file in src folder --> paste both in *windows.json* file args in place of sample paths.

4. **Open discord desktop app/ website and login**
- Create a new channel with name *notification*
- Go to settings of the channel --> go to Integration --> Create a webhook --> Copy the webhook url
- Go to Day_1/dev_assistant_starter/src/index.ts and paste it.
- Then come to terminal and run:
  
   ```bash
   npm run build
   ```
5. **Go to Day_1/config/**
- If you are on windows --> copy *windows.json* content ELSE copy *mac.json* content
- Go to Claude desktop click (file --> settings) on topmost left humburger.
- Go to Developer section --> click config --> open windows.json redirected file --> paste previosly copied *windows.json* content here --> Save it (Ctrl+S) --> Close this file and Claude desktop --> Restart Claude
- Click tools icon just right to (+) icon on chat typing area if *web search* and *filesystem* are enabled ---> MCP is running

#### ⚡Steps for Day 2

1. **Clone this repository**

   ```bash
   git clone https://github.com/CMPN-CODECELL/MCP_ADK_Workshop_Repository
   cd MCP_ADK_Workshop_Repository

   ```

2. **Installing ADK**

   ✅[Official guide](https://google.github.io/adk-docs/get-started/installation/)

   ✅**We recommend creating a virtual Python environment using venv:**

   ```bash
   python -m venv .venv

   # Mac/Linux
   source .venv/bin/activate

   # Windows CMD
   .venv\Scripts\activate.bat

   # Windows PowerShell
   .venv\Scripts\Activate.ps1

   pip install google-adk

   # Verify installation
   pip show google-adk

   ```

3. **Install dependencies with Pip 25.2**

   ```bash
   pip install --upgrade pip==25.2
   pip install -r requirements.txt

   ```

4. **Run MCP examples**

   ```bash
   python main.py

   ```

5. **Explore & Experiment to learn!**

- Try modifying existing agent templates
- Connect with Claude Desktop integration
- Build your own custom AI agents

---

## 📘Missed the Workshop?

Don’t worry, if you missed the live sessions! You can still practice MCP with this repo:

- Start from the examples/ folder → run each sample project.

- Modify JSON-RPC calls to understand client-server communication.

- Use Claude Desktop to test your MCP integrations.

- Create a new branch and build your own agent idea.

---

## ⚡Speakers for the workshop

✅**Hannan Chougle**

- SIH 2024 Finalist
- Tech Manager at CodeCell

✅**Aanchal Gupta**

- Winner of Google Cloud Agentic AI Day
- PR Manager at CodeCell

✅**Harshavardhan Khamkar**

- Winner of Google Cloud Agentic AI Day
- Tech Manager at CodeCell

---

## 🤝 Organizers

- Student Head: Chinmay Desai (+91 70456 49922)
- Deputy Head: Eshan Vijay (+91 70216 56418)

## 🌐 Connect with Us

[![Instagram](https://img.shields.io/badge/Instagram-%23E4405F.svg?&logo=instagram&logoColor=white)](https://instagram.com/codecell_vesit?igshid=1tjq870hdehua)
[![Discord](https://img.shields.io/badge/Discord-%235865F2.svg?&logo=discord&logoColor=white)](https://discord.gg/5gv8CBV4pK)
[![Twitter](https://img.shields.io/badge/Twitter-%231DA1F2.svg?&logo=twitter&logoColor=white)](https://twitter.com/Codecell_cmpn)  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-%230077B5.svg?&logo=linkedin&logoColor=white)](https://www.linkedin.com/company/vesit-tinkers-codecell-computer-department/about/)
[![Website](https://img.shields.io/badge/Website-%23000000.svg?&logo=google-chrome&logoColor=white)](https://codecell-cmpn-vesit.ves.ac.in/)

✨Let’s build the next generation of intelligent agents together! 🚀
