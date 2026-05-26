# Geo AI

Assistant IA géographique propulsé par Groq (Llama 3.3 70B).

## Stack

- **Frontend** : React + Vite
- **Backend** : Vercel Serverless Function (`api/chat.js`)
- **LLM** : Groq API (llama-3.3-70b-versatile)

## Développement local

1. **Installe les dépendances**
   ```bash
   npm install
   ```

2. **Configure la clé API**
   ```bash
   cp .env.example .env
   # Édite .env et remplis GROQ_API_KEY
   ```

3. **Lance l'app**
   ```bash
   # Terminal 1 — frontend
   npm run dev

   # Terminal 2 — serveur proxy local
   node server.dev.js
   ```

   Ouvre http://localhost:5173

## Déploiement sur Vercel

1. Push sur GitHub
2. Importe le repo sur [vercel.com](https://vercel.com)
3. Dans les settings du projet → **Environment Variables** :
   - `GROQ_API_KEY` = ta clé Groq
4. Clique **Deploy** — c'est tout !

> Le fichier `api/chat.js` devient automatiquement une fonction serverless sur Vercel.
> Le `.env` local n'est **jamais** uploadé (voir `.gitignore`).

## Obtenir une clé Groq

Gratuit sur https://console.groq.com/keys
