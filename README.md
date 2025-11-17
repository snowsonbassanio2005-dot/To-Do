# Modern ToDo - Netlify Ready (with Tasks API)

This project is a React + Netlify Functions ToDo app. It now includes a **Tasks API** (netlify/functions/tasks.js) which stores tasks per authenticated user in MongoDB.

## Quick notes
- Environment variables required in Netlify:
  - MONGODB_URI
  - JWT_SECRET
  - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL (for sendReminder)
- For local dev, you can use Netlify CLI and export env vars in your shell.

## Deploy
See deploy instructions in the original instructions. You can drag & drop the zip or use GitHub.

