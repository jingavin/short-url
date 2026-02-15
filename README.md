# URL Shortener

## Installation

From the root of the repository:

```bash
npm install
```

---

## Development

Run both frontend and backend together:

```bash
npm run dev
```

- Frontend → [http://localhost:5173](http://localhost:5173)
- Backend → [http://localhost:3000](http://localhost:3000)

---

## Run Frontend Only

```bash
npm run dev:web
```

Frontend runs at:

```
http://localhost:5173
```

---

## Run Backend Only

```bash
npm run dev:api
```

Backend runs at:

```
http://localhost:3000
```

---

## Build

Build both applications:

```bash
npm run build
```

This builds:

- `apps/web` (Vite production build)
- `apps/api` (TypeScript compiled to `dist/`)

---
