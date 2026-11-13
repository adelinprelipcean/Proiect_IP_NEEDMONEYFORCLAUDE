# RRM - Frontend

React + Vite (SPA).

## Pornire

Backend-ul trebuie sa ruleze pe `http://localhost:8000` (vezi `rrm-backend`).

```
npm install
npm run dev
```

Aplicatia: http://localhost:5173

Cererile catre `/api` sunt trimise de Vite catre backend (proxy in
`vite.config.js`), deci nu trebuie configurat nimic in plus.

## Structura

```
src/
  api/          apeluri catre backend (client.js pune tokenul JWT)
  components/   componente reutilizabile (Layout, ResourceCard, dialoguri)
  hooks/        useCurrentUser (GET /api/users/me)
  pages/        paginile aplicatiei
  utils/        formatare preturi si date
```

## Pagini

| Ruta | Pagina |
| --- | --- |
| `/` | Catalog resurse, filtrare pe categorii |
| `/resources/:id` | Detaliile resursei si mentenanta programata |
| `/reservations` | Rezervarile echipei, anulare (Team Lead) |
| `/admin/maintenance` | Setare perioada de mentenanta (Admin) |

## Autentificare

Dupa login, tokenul se salveaza cu `saveToken(token)` din `src/api/client.js`.
Toate cererile urmatoare il trimit automat in headerul `Authorization`.
