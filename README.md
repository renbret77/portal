This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Git & Cloud Deployment (Vercel)

Este proyecto está preparado para ser desplegado en Vercel con integración continua desde GitHub.

### 1. Preparación Local
Asegúrate de tener un repositorio Git inicializado en esta carpeta:
```bash
git init
git add .
git commit -m "Initial commit: SaaS Portal Seguros"
```

### 2. Variables de Entorno en Vercel
Al configurar el proyecto en Vercel, debes agregar las siguientes variables de entorno manualmente:
- `NEXT_PUBLIC_SUPABASE_URL`: Tu URL del proyecto de Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Tu llave anónima de Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: (Opcional, para scripts de backend seguros).

### 3. Despliegue
Simplemente conecta tu cuenta de GitHub a Vercel, selecciona el repositorio y dale a **Deploy**.
