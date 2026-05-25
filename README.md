# Cartman PR Bot

A GitHub bot that automatically comments on your pull requests with Eric Cartman quotes from South Park.

When you open a PR, update it, request a review, get approved, get changes requested, or close it, Cartman comments.

---

## Table of Contents

- [How It Works](#how-it-works)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Step-by-Step Setup](#step-by-step-setup)
  - [1. Clone the Repo](#1-clone-the-repo)
  - [2. Create a GitHub Personal Access Token](#2-create-a-github-personal-access-token)
  - [3. Deploy](#3-deploy)
  - [4. Create a GitHub Webhook](#4-create-a-github-webhook)
  - [5. Test It](#5-test-it)
- [Local Development](#local-development)
- [Quote Mapping](#quote-mapping)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## How It Works

1. You add a webhook to any GitHub repo you own
2. When a PR event happens, GitHub sends a POST request to this bot
3. The bot picks a Cartman quote based on the event type
4. The bot posts the quote as a comment on the PR

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A [GitHub](https://github.com/) account
- A GitHub repository to install the bot on
- A hosting provider ([Railway](https://railway.app), [Heroku](https://heroku.com), [Render](https://render.com), etc.) **OR** [ngrok](https://ngrok.com) for local testing

---

## Quick Start

If you've done this kind of thing before:

```bash
git clone https://github.com/YOUR_USERNAME/cartman-bot.git
cd cartman-bot
npm install
cp .env.example .env
# Fill in GITHUB_TOKEN and WEBHOOK_SECRET in .env
npm start
```

Then add a webhook to your repo pointing at `https://your-deployed-url/webhook`. Done.

---

## Step-by-Step Setup

### 1. Clone the Repo

```bash
git clone https://github.com/YOUR_USERNAME/cartman-bot.git
cd cartman-bot
npm install
```

### 2. Create a GitHub Personal Access Token

You need a token so the bot can post comments on your behalf.

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Give it a name like `cartman-bot`
4. Under **Select scopes**, check the `repo` box (this gives access to read/write on your repos)
5. Click **Generate token**
6. **Copy the token immediately** -- you won't see it again

> **Keep this token secret.** Never commit it to your repo.

### 3. Deploy

Pick one of these hosting options. The bot needs to be publicly accessible so GitHub can send it webhooks.

#### Option A: Railway (Recommended -- free tier available)

1. Push this repo to your own GitHub account
2. Go to [railway.app](https://railway.app) and sign in with GitHub
3. Click **New Project** > **Deploy from GitHub repo** > select your `cartman-bot` repo
4. Go to your project's **Variables** tab and add:
   - `GITHUB_TOKEN` = the token you created in step 2
   - `WEBHOOK_SECRET` = make up a random string (e.g. `cartman-secret-123`) -- you'll use this same string in step 4
5. Railway will auto-deploy. Click on your deployment to find your public URL (e.g. `https://cartman-bot-production-abc123.up.railway.app`)
6. Visit that URL in your browser -- you should see: *"Cartman PR Bot is running! Respect my authoritah!"*

#### Option B: Heroku

```bash
# Install Heroku CLI if you haven't: https://devcenter.heroku.com/articles/heroku-cli
heroku login
heroku create cartman-pr-bot
heroku config:set GITHUB_TOKEN=ghp_your_token_here
heroku config:set WEBHOOK_SECRET=your_secret_here
git push heroku main
```

Your URL will be `https://cartman-pr-bot-xxxxx.herokuapp.com`.

#### Option C: Render

1. Go to [render.com](https://render.com) and sign in
2. Click **New** > **Web Service** > connect your GitHub repo
3. Set **Build Command** to `npm install`
4. Set **Start Command** to `node index.js`
5. Add environment variables `GITHUB_TOKEN` and `WEBHOOK_SECRET`
6. Deploy

### 4. Create a GitHub Webhook

This tells GitHub to notify your bot when PR events happen.

1. Go to the GitHub repo where you want Cartman to comment
2. Click **Settings** > **Webhooks** > **Add webhook**
3. Fill in:
   - **Payload URL**: your deployed URL + `/webhook`
     - Example: `https://cartman-bot-production-abc123.up.railway.app/webhook`
   - **Content type**: select `application/json`
   - **Secret**: enter the **same secret** you used in your environment variables
4. Under **Which events would you like to trigger this webhook?**, select **Let me select individual events** and check:
   - **Pull requests**
   - **Pull request reviews**
5. Make sure **Active** is checked
6. Click **Add webhook**

GitHub will send a ping event. If you see a green checkmark next to your webhook, you're good.

### 5. Test It

1. Go to the repo where you added the webhook
2. Create a new branch and open a Pull Request
3. You should see a comment from the bot: *"Respect my authoritah!"*
4. Push another commit to the PR branch -- a random update quote should appear
5. Request a review from someone -- *"But Mooooom!"* or *"How do I reach these keeeeds?"*
6. Approve the PR (or have someone approve it) -- *"I'm Not Just Sure, I'm HIV Positive"*
7. Close the PR -- *"Screw you guys, I'm going home."*

---

## Local Development

You can run the bot locally and use ngrok to expose it to the internet for testing.

```bash
# 1. Copy the example env file and fill in your values
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Start the server
npm start
# Output: Cartman bot listening on port 3000
```

In a separate terminal, expose your local server:

```bash
# Install ngrok: https://ngrok.com/download
ngrok http 3000
```

Ngrok will give you a public URL like `https://abc123.ngrok-free.app`. Use that as your webhook Payload URL in GitHub (don't forget to add `/webhook` at the end).

> **Note:** The ngrok URL changes every time you restart it (on the free plan), so you'll need to update your webhook URL each time.

---

## Quote Mapping

| PR Event | Quote(s) |
|---|---|
| PR Opened / Reopened | "Respect my authoritah!" |
| PR Updated (new commits pushed) | Random: "Whateva! I do what I want!" / "No Kitty, that's my pot pie!" / "I Want My Cheesy Poofs!" / "Cartmanbrah!" |
| Review Requested | Random: "But Mooooom!" / "How do I reach these keeeeds?" |
| PR Approved | "I'm Not Just Sure, I'm HIV Positive" |
| Changes Requested | "Boo, Wendy Testaburger! Boo!" |
| PR Closed / Merged | "Screw you guys, I'm going home." |
| 5% Bonus (any event) | "Tsst!" / "HOW WOULD YOU LIKE TO SUCK MY BALLS...Mr. Garrison" / "Stan, don't you know the first law of physics? Anything that's fun costs at least eight dollars." |

---

## Project Structure

```
cartman-bot/
├── index.js          # Express server, webhook handler, signature verification
├── quotes.js         # All 14 Cartman quotes, event mapping, random selection
├── github.js         # GitHub API wrapper (posts comments via Octokit)
├── package.json      # Dependencies and scripts
├── Procfile          # Entry point for Heroku/Railway
├── .env.example      # Template for environment variables
├── .gitignore        # Ignores node_modules and .env
└── README.md         # You are here
```

---

## Troubleshooting

**Bot isn't commenting:**
- Check your webhook delivery log: repo **Settings** > **Webhooks** > click your webhook > **Recent Deliveries**
- Make sure the webhook shows a `200` response. If it shows an error, check the response body for details
- Verify your `GITHUB_TOKEN` has `repo` scope
- Make sure the token belongs to an account that has write access to the repo

**Webhook shows 401 "Invalid signature":**
- Your `WEBHOOK_SECRET` in your environment variables doesn't match the secret in your GitHub webhook settings. They must be identical.

**Webhook shows 500 error:**
- Check your deployment logs (Railway: click deployment > logs, Heroku: `heroku logs --tail`)
- Most likely the `GITHUB_TOKEN` is missing or invalid

**Bot comments on wrong events:**
- Make sure you only have **Pull requests** and **Pull request reviews** checked in your webhook event settings

---

## License

MIT -- do whatever you want with it. Whateva! I do what I want!
