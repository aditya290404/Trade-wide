# 🚀 Deployment Guide: Stellar Trade UI

This guide contains step-by-step instructions to deploy your full-stack Monorepo (React/Vite Frontend + Express Backend + Postgres) to either **Render** or **Railway**.

> [!TIP]
> **Recommended approach:** We recommend deploying to **Render** using the provided `render.yaml` Blueprint file. It automatically provisions the Database, Backend, and Frontend for you with a single click.

---

## 🌩️ Option 1: Deploying to Render (Easiest)

I have already configured a `render.yaml` Blueprint in the root of your project. This automates the entire infrastructure setup.

### Step-by-Step Instructions

1. **Commit and Push Changes:**
   Push the latest changes (including the `render.yaml` I just created and the fix in `src/lib/api.ts`) to your GitHub repository.
   ```bash
   git add .
   git commit -m "chore: add render blueprint and fix API url"
   git push origin main
   ```

2. **Connect to Render:**
   - Go to [Render Dashboard](https://dashboard.render.com).
   - Click on **New +** and select **Blueprint**.
   - Connect your GitHub account (if not already connected) and select your repository (`stellar-trade-ui-main`).

3. **Deploy:**
   - Render will automatically read the `render.yaml` file.
   - It will configure three services:
     - `tradewide-db`: A PostgreSQL Database.
     - `tradewide-backend`: Your Node/Express API running from the `backend/` directory.
     - `tradewide-ui`: Your React/Vite Frontend hosted globally.
   - **Important Configuration:** Once the services are created, go to the `tradewide-backend` settings in Render under the **Environment** tab, and explicitly add your `SENDGRID_API_KEY` (since we cannot hardcode it safely).

> **IMPORTANT**
> The backend URL is injected automatically into the frontend as `VITE_API_URL`. However, the frontend deployment is a **Static Site**. Vite requires the `VITE_API_URL` variable at **Build Time**.
> If your frontend URL fails to hit the backend initially, you just need to trigger a manual redeploy of the `tradewide-ui` service once the backend is successfully up and running.

---

## 🛤️ Option 2: Deploying to Railway

Railway is fantastic for full-stack deployments. It requires a slightly more manual setup since we don't have a structured template file for it like Render, but it's very visual and straightforward.

### Step 1: Provision the Database
1. Go to [Railway Dashboard](https://railway.app/).
2. Click **New Project** -> **Provision PostgreSQL**.
3. Once provisioned, Railway will generate a `DATABASE_URL` environment variable.

### Step 2: Deploy the Backend
1. In your Railway project, click **New +** -> **GitHub Repo** and select your repository.
2. Railway will likely detect a single project. To split it:
   - Go to the **Settings** tab of this new service.
   - Change the **Root Directory** to `/backend`.
   - Railway will automatically detect Node.js and run `npm install` and `npm start`.
   - Explicitly define the build command if needed: `npm install && npx prisma generate && npm run build && npm run db:push`
   - Start command: `npm start`
3. Go to the **Variables** tab for this backend service and add:
   - `DATABASE_URL` (Reference it from the Postgres database).
   - `JWT_SECRET` (A strong random string).
   - `SENDGRID_API_KEY` (Your Sendgrid key).
4. Go to **Networking** in settings and generate a Public Domain for your backend.

### Step 3: Deploy the Frontend
1. Click **New +** -> **GitHub Repo** again and select the same repository.
2. In this new service's **Settings**:
   - Keep **Root Directory** as `/` (root level).
   - Railway will detect Vite and build the static site.
   - Build command: `npm run build`
3. Go to the **Variables** tab for the frontend service and add:
   - `VITE_API_URL`: Paste the Public Domain URL of the backend you generated in Step 2.
4. Go to **Networking** in settings and generate Public Domain for the frontend.

> **NOTE**
> Regardless of which platform you choose, your frontend's API connectivity is now protected. I updated `src/lib/api.ts` so it automatically reads `import.meta.env.VITE_API_URL` instead of relying solely on `localhost:3000`.
