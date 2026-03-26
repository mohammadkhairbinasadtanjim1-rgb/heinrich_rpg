# THE FATE OF HEINRICH — Setup Guide

**A complete, step-by-step guide for non-technical users**

This guide will walk you through setting up and running THE FATE OF HEINRICH on your computer. No programming experience required!

---

## Table of Contents

1. [What You Need Before Starting](#1-what-you-need-before-starting)
2. [Installing Node.js](#2-installing-nodejs)
3. [Downloading the Game](#3-downloading-the-game)
4. [Installing Dependencies](#4-installing-dependencies)
5. [Starting the Game](#5-starting-the-game)
6. [Configuring Your LLM](#6-configuring-your-llm)
7. [Playing the Game](#7-playing-the-game)
8. [Stopping and Restarting](#8-stopping-and-restarting)
9. [Updating the Game](#9-updating-the-game)
10. [Getting Help](#10-getting-help)

---

## 1. What You Need Before Starting

Before you begin, make sure you have:

### A Computer
- **Windows** (Windows 10 or later)
- **Mac** (macOS 10.15 or later)
- **Linux** (Ubuntu 20.04 or similar)

### An Internet Connection
- Required for downloading Node.js and the game files
- Required for connecting to LLM providers (OpenAI, Anthropic, etc.)

### An API Key from an LLM Provider
The game uses an AI to generate the story text. You need an API key from one of these providers:

#### Option A: OpenAI (Recommended for beginners)
1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Click "Sign Up" or "Log In"
3. Once logged in, click your profile picture (top right)
4. Click "View API keys"
5. Click "Create new secret key"
6. Copy the key (it starts with `sk-`)
7. **Important**: Save this key somewhere safe! You won't be able to see it again.

**Cost**: OpenAI charges per use. GPT-4o costs about $0.01-0.03 per turn (very cheap). You can start with $5 and play for months.

#### Option B: Anthropic (Claude)
1. Go to [https://console.anthropic.com](https://console.anthropic.com)
2. Click "Sign Up" or "Log In"
3. Go to "API Keys" in the left menu
4. Click "Create Key"
5. Copy the key (it starts with `sk-ant-`)
6. Save this key somewhere safe!

**Cost**: Similar to OpenAI. Claude Sonnet is excellent for this game.

#### Option C: Google (Gemini)
1. Go to [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API key"
4. Copy the key
5. Save this key somewhere safe!

**Cost**: Google offers free tier with generous limits.

#### Option D: Mistral
1. Go to [https://console.mistral.ai](https://console.mistral.ai)
2. Sign up or log in
3. Go to "API Keys"
4. Create a new key
5. Copy and save the key

**Cost**: Mistral is often cheaper than OpenAI/Anthropic.

#### Option E: Local (Ollama) — Free, No API Key Needed
If you have a powerful computer (16GB+ RAM), you can run AI locally:
1. Go to [https://ollama.ai](https://ollama.ai)
2. Download and install Ollama
3. Open terminal/command prompt
4. Type: `ollama pull llama3`
5. Wait for it to download (may take a while)
6. No API key needed! The game will connect to your local AI.

**Cost**: Completely free, but requires a powerful computer.

---

## 2. Installing Node.js

Node.js is the software that runs the game server. Here's how to install it:

### Windows

1. Open your web browser
2. Go to [https://nodejs.org](https://nodejs.org)
3. You'll see a big green button that says "LTS" (Long Term Support) — click it
4. A file will download (usually to your Downloads folder)
5. Find the file (it's called something like `node-v20.x.x-x64.msi`)
6. Double-click it to run the installer
7. Click "Next"
8. Check the box "I accept the terms in the License Agreement"
9. Click "Next"
10. Click "Next" again (leave the default installation location)
11. Click "Next" again (leave the default features)
12. Click "Install"
13. If Windows asks "Do you want to allow this app to make changes?", click "Yes"
14. Wait for installation to complete
15. Click "Finish"

**To verify it worked:**
1. Press the Windows key on your keyboard
2. Type `cmd` and press Enter
3. A black window will open (this is called "Command Prompt")
4. Type: `node --version`
5. Press Enter
6. You should see something like `v20.11.0`
7. Type: `npm --version`
8. Press Enter
9. You should see something like `10.2.4`

If both commands show version numbers, Node.js is installed correctly!

### Mac

1. Open your web browser
2. Go to [https://nodejs.org](https://nodejs.org)
3. Click the big green "LTS" button
4. A `.pkg` file will download
5. Find the file in your Downloads folder
6. Double-click it to open the installer
7. Click "Continue"
8. Click "Continue" again
9. Click "Agree" to accept the license
10. Click "Install"
11. Enter your Mac password when prompted
12. Click "Install Software"
13. Wait for installation to complete
14. Click "Close"

**To verify it worked:**
1. Press `Command + Space` on your keyboard
2. Type `Terminal` and press Enter
3. A white window will open (this is Terminal)
4. Type: `node --version`
5. Press Enter
6. You should see something like `v20.11.0`
7. Type: `npm --version`
8. Press Enter
9. You should see something like `10.2.4`

### Linux (Ubuntu/Debian)

1. Open Terminal (press `Ctrl + Alt + T`)
2. Type these commands one at a time, pressing Enter after each:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. Enter your password when prompted
4. Wait for installation to complete

**To verify:**
```bash
node --version
npm --version
```

---

## 3. Downloading the Game

### Option A: Download as ZIP (Easiest)

1. Go to the game's download page (where you got this guide)
2. Click the "Download ZIP" button
3. A file called `heinrich-rpg.zip` will download
4. Find the file in your Downloads folder
5. **Windows**: Right-click the file → "Extract All" → Click "Extract"
6. **Mac**: Double-click the file (it extracts automatically)
7. **Linux**: Right-click → "Extract Here"

You should now have a folder called `heinrich-rpg` with all the game files inside.

### Option B: Using Git (For advanced users)

If you have Git installed:
```bash
git clone [repository-url] heinrich-rpg
```

---

## 4. Installing Dependencies

Dependencies are additional software packages the game needs to run.

### Windows

1. Open Command Prompt (press Windows key, type `cmd`, press Enter)
2. Navigate to the game folder. Type:
   ```
   cd Downloads\heinrich-rpg\server
   ```
   (If you put the folder somewhere else, adjust the path accordingly)
3. Press Enter
4. Type: `npm install`
5. Press Enter
6. Wait for it to download packages (you'll see text scrolling)
7. When it's done, you'll see something like "added 50 packages"

**If you see an error:**
- "npm is not recognized" → Node.js isn't installed correctly. Go back to Step 2.
- "Permission denied" → Try running Command Prompt as Administrator:
  - Right-click Command Prompt → "Run as administrator"
  - Try the commands again

### Mac

1. Open Terminal (`Command + Space`, type `Terminal`, press Enter)
2. Navigate to the game folder. Type:
   ```
   cd Downloads/heinrich-rpg/server
   ```
3. Press Enter
4. Type: `npm install`
5. Press Enter
6. Wait for packages to download

**If you see an error:**
- "command not found: npm" → Node.js isn't installed. Go back to Step 2.
- "EACCES" permission error → Type: `sudo npm install` and enter your password

### Linux

1. Open Terminal (`Ctrl + Alt + T`)
2. Navigate to the game folder:
   ```bash
   cd ~/Downloads/heinrich-rpg/server
   ```
3. Type: `npm install`
4. Press Enter
5. Wait for packages to download

---

## 5. Starting the Game

### Windows

1. Make sure you're still in the `server` folder in Command Prompt
   (If not, repeat: `cd Downloads\heinrich-rpg\server`)
2. Type: `node server.js`
3. Press Enter
4. You should see:
   ```
   ═══════════════════════════════════════════════════════════════
   ⚔️  THE FATE OF HEINRICH — Medieval Text RPG
   ═══════════════════════════════════════════════════════════════

     Server running on http://localhost:3000
   ```
5. **Keep this window open!** The game runs in this window.
6. Open your web browser (Chrome, Firefox, Edge, Safari)
7. Go to: `http://localhost:3000`
8. The game should appear!

### Mac

1. Make sure you're still in the `server` folder in Terminal
2. Type: `node server.js`
3. Press Enter
4. You should see the server startup message
5. **Keep Terminal open!**
6. Open Safari/Chrome/Firefox
7. Go to: `http://localhost:3000`

### Linux

1. In Terminal, in the `server` folder:
2. Type: `node server.js`
3. Press Enter
4. Open your browser
5. Go to: `http://localhost:3000`

### Troubleshooting

**"It says port 3000 is already in use"**
- Another program is using port 3000
- Solution: Change the port:
  - Open `server.js` in a text editor
  - Find the line: `const PORT = process.env.PORT || 3000;`
  - Change `3000` to `3001` (or any other number)
  - Save the file
  - Restart the server
  - Go to `http://localhost:3001` instead

**"It says module not found"**
- You didn't run `npm install` or it failed
- Go back to Step 4 and run `npm install` again

**"Cannot find module 'express'"**
- Same as above — run `npm install` in the `server` folder

**The page loads but looks broken**
- Make sure you're going to `http://localhost:3000` (not `https`)
- Try refreshing the page (Ctrl+F5 or Cmd+Shift+R)
- Check the terminal for error messages

---

## 6. Configuring Your LLM

Once the game is running in your browser:

1. You'll see a configuration screen
2. **Provider**: Select your LLM provider from the dropdown
   - OpenAI
   - Anthropic
   - Google
   - Mistral
   - Ollama (for local)
   - Custom

3. **API Key**: Paste your API key
   - For Ollama, leave this blank

4. **Model**: Select a model (or use the default)
   - OpenAI: `gpt-4o` is recommended
   - Anthropic: `claude-sonnet-4-20250514` is recommended
   - Google: `gemini-pro`
   - Mistral: `mistral-large-latest`
   - Ollama: `llama3` (or whatever you downloaded)

5. **Base URL** (Ollama/Custom only):
   - For Ollama: `http://localhost:11434`
   - For Custom: Your custom API endpoint

6. Click **"Test Connection"**
   - If it says "Connected!" → You're ready!
   - If it fails, see troubleshooting below

### Troubleshooting LLM Connection

**"Invalid API key"**
- Double-check you copied the entire key
- Make sure there are no extra spaces
- Check if your API key has expired or has no credits

**"Connection timed out"**
- Check your internet connection
- For Ollama: Make sure Ollama is running (`ollama serve` in terminal)

**"Model not found"**
- Check the model name is spelled correctly
- Some models require special access (e.g., GPT-4 may require a waitlist)

**"Rate limit exceeded"**
- You've made too many requests too quickly
- Wait a minute and try again

---

## 7. Playing the Game

### Starting a New Game

1. Click **"New Game"**
2. Enter Heinrich's family name (default: Renard)
3. Enter what Heinrich wants more than anything
4. Enter what Heinrich fears above all
5. Click **"Begin"**
6. **IMPORTANT**: You'll see a session key like `HX7K9M2P`
   - **Write this down!** This is your save game key
   - Without it, you can't resume your game
   - The game also auto-saves every turn

### Resuming a Game

1. Click **"Resume Game"**
2. Enter your session key (the 8-character code)
3. Click **"Load"**
4. Your game continues exactly where you left off!

### Exporting a Backup

1. While playing, click the ⚙️ (settings) icon
2. Click **"Export Save"**
3. A JSON file will download to your computer
4. Keep this file safe as a backup!

### Importing a Backup

1. On the main screen, click **"Resume Game"**
2. Click **"Import Save"**
3. Select your saved JSON file
4. A new session will be created with your saved data

### The Interface

- **Left Panel**: Your stats (health, skills, inventory, etc.)
- **Center**: The story text (this is where the AI writes)
- **Right Panel**: NPCs, inventory, map, and other info tabs
- **Bottom**: Your choices and free text input

### How to Play

- Read the story text
- Click one of the choice buttons (A, B, C, D, etc.)
- OR type your own action in the text box and press Enter
- The game processes your action, runs the game logic, and asks the AI to write what happens
- Every action has consequences!

---

## 8. Stopping and Restarting

### To Stop the Game

1. Go to the terminal/command prompt window where the server is running
2. Press `Ctrl + C` on your keyboard
3. The server will stop
4. You can close the terminal window

**Your saves are safe!** They're stored in the `saves` folder.

### To Restart the Game

1. Open terminal/command prompt
2. Navigate to the server folder:
   - Windows: `cd Downloads\heinrich-rpg\server`
   - Mac/Linux: `cd Downloads/heinrich-rpg/server`
3. Type: `node server.js`
4. Press Enter
5. Open your browser to `http://localhost:3000`

### Your Saves

- All saves are in the `saves` folder inside the game directory
- Each save is a JSON file named after the session key (e.g., `HX7K9M2P.json`)
- You can copy these files to back them up
- You can move them to another computer to continue playing there

---

## 9. Updating the Game

When a new version is released:

1. Stop the server (Ctrl+C)
2. Download the new version
3. **Important**: Copy your `saves` folder from the old version to the new version
4. Open terminal in the new version's `server` folder
5. Run: `npm install` (to update dependencies)
6. Start the server: `node server.js`
7. Your saves will work with the new version!

---

## 10. Getting Help

### Common Issues

**The game is slow**
- The AI takes time to generate text (usually 2-10 seconds)
- If it's very slow, try a faster model (e.g., GPT-4o-mini instead of GPT-4)

**The AI says strange things**
- This can happen! The AI is generating creative fiction
- If it's completely broken, click "Retry Narrative" to get a new response

**I lost my session key**
- Check the `saves` folder — the files are named by session key
- Or start a new game (your old saves are still there)

**The server won't start**
- Make sure Node.js is installed: `node --version`
- Make sure you ran `npm install`
- Make sure you're in the `server` folder
- Try a different port if 3000 is busy

**I see a blank page**
- Make sure you're going to `http://localhost:3000` (not `https`)
- Check the terminal for error messages
- Try a different browser

### Getting More Help

- Check the game's README.md file for technical documentation
- Look for error messages in the terminal window
- Check your browser's developer console (F12 → Console tab)

---

## Quick Reference Card

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Start server | `node server.js` |
| Stop server | `Ctrl + C` |
| Check Node.js version | `node --version` |
| Check npm version | `npm --version` |
| Open game in browser | `http://localhost:3000` |

---

**Enjoy THE FATE OF HEINRICH!**

*May your choices echo through the ages...*
