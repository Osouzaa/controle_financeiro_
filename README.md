# Sistema Financeiro Pessoal

Monorepo full stack para controle financeiro pessoal com React, TypeScript, Vite, MUI, TanStack Query, NestJS, TypeORM, PostgreSQL, JWT e Swagger.

## Rodando localmente

1. Instale as dependencias:

```bash
npm install
```

2. Os arquivos de ambiente ja estao exemplificados em:

```bash
apps/api/.env.example
apps/web/.env.example
```

Neste workspace, `apps/api/.env` ja foi criado para o banco local via Docker.

3. Suba o PostgreSQL:

```bash
docker compose up -d
```

O Compose cria o banco `financeiro` e o usuario da aplicacao:

```env
DATABASE_USER=financeiro_user
DATABASE_PASSWORD=financeiro_pass
DATABASE_NAME=financeiro
DATABASE_PORT=5433
```

Se o volume do PostgreSQL ja existia antes dessa configuracao, recrie o banco local:

```bash
docker compose down -v
docker compose up -d
```

4. Rode a API:

```bash
npm run dev:api
```

5. Rode o frontend:

```bash
npm run dev:web
```

Frontend: `http://localhost:5173`
API: `http://localhost:3000/api`
Swagger: `http://localhost:3000/docs`

## Funcionalidades

- Login, cadastro, JWT, refresh token e logout.
- Dashboard mensal com cards, graficos, alertas e seletor de mes/ano.
- Receitas, despesas, transacoes, categorias, contas, cartoes, parcelas, metas e relatorios.
- Lancamento rapido mobile first.
- Parcelamento automatico com parcelas futuras.
- Cartoes com limite, gasto, percentual usado e limite restante.
- Exportacao CSV compativel com Excel.
- Dark mode, skeleton/loading states e layout responsivo.

## Deploy

- Frontend: Vercel usando `apps/web` como root e `npm run build`.
- Backend: Render usando `apps/api`, comando de build `npm run build --workspace apps/api` e start `npm run start:prod --workspace apps/api`.
- Banco: Supabase PostgreSQL. Configure `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` e `DATABASE_SSL=true`.
