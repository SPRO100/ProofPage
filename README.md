# ProofPage

One public page that proves what an indie founder builds and what their projects earn.

## Stack

Next.js 15 · TypeScript · Supabase · Tailwind CSS · shadcn/ui · Vercel

## Local development

```bash
# 1. Clone
git clone https://github.com/SPRO100/ProofPage.git
cd ProofPage

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## Branch strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production — stable releases only |
| `dev` | Integration — all PRs merge here |
| `claude/PP-###-*` | Claude's feature branches |
| `codex/PP-###-*` | Codex's feature branches |

All changes go through Pull Requests into `dev`. Direct pushes to `main` and `dev` are blocked.

## Documentation

| File | Contents |
|------|---------|
| `docs/PRODUCT.md` | Product definition and trust model |
| `docs/PRD.md` | MVP feature requirements |
| `docs/ARCHITECTURE.md` | Technical design and stack |
| `docs/DATABASE.md` | Supabase schema and RLS rules |
| `docs/DESIGN.md` | Design system and visual rules |
| `docs/ROADMAP.md` | Phase-by-phase roadmap |
| `docs/tasks.json` | Task registry (synced with GitHub Issues) |
| `AGENTS.md` | Collaboration rules for Claude and Codex |
