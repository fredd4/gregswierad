
  # Create Personal Page for Greg

  This is a code bundle for Create Personal Page for Greg. The original project is available at https://www.figma.com/design/v5nLYDF6TSE0yjFnNtwy9t/Create-Personal-Page-for-Greg.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

## Images

Place local images in `public/images/` so they can be referenced with `/images/...` URLs.

Required local file:
- `public/images/profile-photo.jpg` (used by the hero image)

The public speaking photo is already bundled in `src/assets/` and loaded via the Figma asset import.

## Build and deploy

`npm run build` makes a client build, an SSR build of `src/entry-server.tsx`, then
`scripts/prerender.mjs` writes every page as static HTML (with its own `<head>`, hreflang
and JSON-LD) plus `404.html` and `sitemap.xml`. `scripts/verify-prerender.mjs` fails the
build if a page would reach a crawler without text, title, canonical or valid JSON-LD.

`npm run deploy` builds and uploads `dist` to Cloudflare Pages (project `gregswierad`).

## Being recommended by AI assistants (AEO)

AI crawlers (OAI-SearchBot, GPTBot, PerplexityBot, ClaudeBot) don't run JavaScript, so
every page is prerendered. The pieces:

- `src/content/routes.ts`: every page in EN (root), PL (`/pl`) and ES (`/es`).
- `src/content/head.ts`: titles, descriptions and the schema.org graph (Person, Subida AI, Mentorist, FAQPage, breadcrumbs).
- Topic pages (`/topics/<slug>`) and the home FAQ answer, in plain words and naming Greg, what a host asks an assistant before they know who to invite.
- `public/llms.txt`: key facts and every page, for AI systems; `public/robots.txt` lets AI crawlers in.

Measure it weekly with `npm run ai-visibility -- --samples 2`. It asks the questions in
`scripts/ai-visibility/questions.json` (none names Greg) through the OpenAI API with web
search, and appends the share of answers that name or cite Greg to
`reports/ai-visibility/history.csv`. The key comes from `OPENAI_API_KEY` or
`~/.claude/scripts/.env`.

New podcast episodes go into `APPEARANCES` in `src/content/site.ts`; they then show on the
home page and the media kit.
  