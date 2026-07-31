# BaseCamp Frontend

Next.js frontend for the BaseCamp learning demo.

## Run Locally

Start the backend first from `../backend` with the `local` Spring profile, then run:

```powershell
cd F:\basecamp\backend\frontend
npm install
copy .env.example .env.local
npm run dev:local
```

Open:

```text
http://127.0.0.1:3100
```

The frontend talks to:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081
```

Demo login:

```text
demo@basecamp.local
password
```

## Build

```powershell
npm run build
```
