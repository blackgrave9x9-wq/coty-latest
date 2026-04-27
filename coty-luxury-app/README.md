<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/782b1bd9-1fa0-40f3-a09d-9bb302811750

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `OPENAI_API_KEY` in [.env.local](.env.local) to your OpenAI API key
3. Run the app:
   `npm run dev`

## Deploy on Cloudflare Pages

1. Push this project to GitHub.
2. In Cloudflare Dashboard, go to **Pages** and create a new project from this repo.
3. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Add environment variable in Pages project:
   - `OPENAI_API_KEY` = your OpenAI key
5. Deploy.

### Local preview with Cloudflare Functions

1. Copy `.dev.vars.example` to `.dev.vars`
2. Put your real key inside `.dev.vars`
3. Run:
   `npm run cf:dev`

### Deploy from local using Wrangler

1. Login:
   `npx wrangler login`
2. Deploy:
   `npm run cf:deploy -- --project-name=coty-luxury-app`
