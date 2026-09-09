# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

[Migration from Express API and Mongo](https://claude.ai/code/artifact/c1cd5084-997c-4200-b5f0-f31b0c641981?via=auto_preview) report.

Docker
```bash
# build the image
docker build -t polygon-30 .                                             

# run it                                                                                                                                   
docker run -d --name polygon-30 -p 3000:3000 --env-file .env polygon-30                                                                                                                                                                        

# watch it
docker logs -f polygon-30                              

# tear down                                                                                                                                                                                      
docker stop polygon-30 && docker rm polygon-30         
```      