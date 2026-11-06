# SHIV AI — GitHub-ready project

Mobile-first AI Q&A app powered by Gemini through a server.

## Features
- Real AI answers from Gemini
- Hindi/English response preference
- Student and General modes
- Image question upload/camera (JPEG, PNG, WebP, max 5 MB)
- Browser voice-to-text where supported
- Local browser chat history
- Render deployment blueprint

## Deploy from your phone
1. Download and unzip this project.
2. On GitHub, create a repository named `shiv-ai`.
3. Upload the *contents* of this folder (not the ZIP file). `server.js`, `package.json`, `render.yaml`, `.gitignore`, `README.md`, and `public/index.html` must be in the right paths.
4. Create your own Gemini API key at https://aistudio.google.com/app/apikey
5. On Render, create a Web Service from your GitHub repository. Set build command `npm install` and start command `npm start`.
6. In Render Environment settings add `GEMINI_API_KEY` with your key. Never commit `.env` or put the key in public frontend code.
7. Deploy and open the Render URL.

## Local run (Node.js 18+)
`npm install`, set `GEMINI_API_KEY` environment variable, then `npm start`; open `http://localhost:3000`.

This project does not contain an API key. API access, free tier, quotas and model availability depend on Google's current terms/account/region. Browser voice recognition varies by browser/device.
