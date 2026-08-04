# BaseCamp Frontend

Next.js frontend for the BaseCamp learning platform.

## Environment

Create an ignored `.env.local` file:

```powershell
copy .env.example .env.local
```

Set the deployed backend URL and Turnstile site key:

```text
NEXT_PUBLIC_API_BASE_URL=https://api.your-basecamp-domain.com
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<cloudflare-turnstile-site-key>
```

## Development

```powershell
npm install
npm run dev
```

## Production Build

```powershell
npm run build
npm run start
```
