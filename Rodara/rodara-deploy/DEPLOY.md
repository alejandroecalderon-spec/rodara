# Deploying rodara

This turns rodara from a Claude-preview-only prototype into a real link you
can send to testers. It takes about 10 minutes and the cheapest tiers cover
Phase 2 outreach comfortably.

## What you're deploying

```
rodara-deploy/
  public/index.html     <- the app (frontend)
  api/anthropic.js      <- serverless proxy that holds your API key
  package.json
```

The frontend never touches your API key directly — every AI call goes to
`/api/anthropic`, which is a small server function that adds the key and
forwards the request to Anthropic. This is the standard, safe pattern for
shipping an app that uses an API key without exposing it in the browser.

## Step 1 — Get an Anthropic API key

1. Go to https://console.anthropic.com and sign up / log in.
2. Go to **API Keys** and create a new key.
3. Copy it somewhere safe — you'll paste it into Vercel in Step 3, not into
   any file in this project.
4. Note: this is pay-as-you-go. For Phase 2 testing (a handful of people
   trying it a few times each), cost should be small, but keep an eye on
   usage in the console, especially with the AI-vision path (page images
   cost more per call than plain text).

## Step 2 — Push this project to GitHub

1. Create a new (private is fine) GitHub repo.
2. Push this folder's contents to it. If you're comfortable with git:
   ```
   cd rodara-deploy
   git init
   git add .
   git commit -m "rodara v1"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
   If you're not comfortable with git yet, GitHub's website lets you drag
   and drop files to create a repo without using the command line.

## Step 3 — Deploy on Vercel

1. Go to https://vercel.com and sign up / log in (GitHub login is easiest).
2. Click **Add New → Project**, then import the GitHub repo from Step 2.
3. Vercel will auto-detect the `public/` and `api/` structure — you don't
   need to change any build settings.
4. Before deploying, add an environment variable:
   - Name: `ANTHROPIC_API_KEY`
   - Value: the key you copied in Step 1
5. (Optional but recommended while testing) Add a second environment
   variable:
   - Name: `ACCESS_CODE`
   - Value: any word/phrase you make up, e.g. `rodara-beta`
   This means only people you give the code to can use your deployed app —
   without it, anyone who finds the URL could rack up API costs on your key.
   If you set this, also open `public/index.html`, find the line
   `const ACCESS_CODE = '';` near the top of the `<script>` block, and put
   the same value there before deploying.
6. Click **Deploy**. Vercel gives you a live URL
   (like `rodara-yourname.vercel.app`) once it finishes — that's your real,
   shareable link.

## Step 4 — Test it yourself first

Open the live URL, paste the sample scene, and run a breakdown before
sending it to anyone. Confirm PDF upload, AI vision fallback, and the Excel
export all still work in the real deployed environment — occasionally
something that worked in preview behaves slightly differently once deployed.

## Updating later

Any time you want to change the app, edit `public/index.html` (or
`api/anthropic.js`) and push to GitHub — Vercel redeploys automatically on
every push to `main`.

## Cost and abuse notes

- Keep the `ACCESS_CODE` in place until you're ready for a fully public
  launch. A leaked link without an access code, posted somewhere public,
  could run up real API costs.
- Vercel's free tier comfortably covers a small number of testers. You will
  only pay Anthropic for actual API usage, not Vercel itself, at this scale.
