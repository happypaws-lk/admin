<a href="https://github.com/happypaws-lk/admin" align="center">
    <img src=".github/assets/banner.jpg" alt="HappyPaws Admin Platform">
</a>

<p align="center">The internal admin portal for HappyPaws.lk.</p>
  
<!-- Badges -->
<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-000000?style=flat&logo=next.js&labelColor=171717" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61dafb?style=flat&logo=react&labelColor=171717" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&labelColor=171717" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat&logo=tailwind-css&labelColor=171717" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-000000?style=flat&logo=vercel&labelColor=171717" alt="Vercel" />
  <img src="https://img.shields.io/badge/License-Proprietary-c03dfe?style=flat&labelColor=171717" alt="License" />
</p>

<h4 align="center">
    <a href="#introduction">Introduction</a> 
    <span> · </span>    
    <a href="#tech-stack">Tech stack</a>
    <span> · </span>    
    <a href="#getting-started">Getting started</a>
    <span> · </span>
    <a href="#secret-management">Secret management</a>
    <span> · </span>
    <a href="#deployment">Deployment</a>
</h4>

<br />

## Introduction

HappyPaws.lk is an animal rescue and rehoming platform in Sri Lanka. This repository contains the Admin Portal. It gives staff and volunteers the tools they need to review KYC applications, manage rescue cases, moderate listings, and coordinate transport tasks. 

The portal uses Cloudflare Zero Trust for network protection and JWT authentication for API operations.

## Tech stack

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- [Vercel](https://vercel.com/) (Hosting)

## Getting started

Follow these steps to run the admin portal locally.

1. Clone the repository.
   ```bash
   git clone https://github.com/happypaws-lk/admin.git
   cd admin
   ```

2. Install dependencies.
   ```bash
   npm install
   ```

3. Create a local environment file named `.env.local`.
   ```env
   NEXT_PUBLIC_API_URL=https://api.happypaws.lk
   AUTH_COOKIE_DOMAIN=.happypaws.lk
   AUTH_COOKIE_SECURE=true
   ```

4. Start the development server.
   ```bash
   npm run dev
   ```

Open `http://localhost:3000` in your browser.

## Secret management

You need to add specific GitHub Actions secrets to deploy the app to Vercel. Add these in your repository settings under **Settings > Secrets and variables > Actions**.

| Secret Name | Description | Source |
| --- | --- | --- |
| `VERCEL_TOKEN` | Vercel Personal Access Token | [Vercel Account Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel Organization ID | Run `npx vercel link` to generate `.vercel/project.json` and copy `orgId` |
| `VERCEL_PROJECT_ID` | Vercel Project ID | Run `npx vercel link` to generate `.vercel/project.json` and copy `projectId` |

## Deployment

We deploy the admin portal to Vercel automatically using GitHub Actions.

The deployment pipeline runs on every push or pull request to the `main` and `staging` branches. It executes in two stages.

1. The CI pipeline runs `npm run lint` and `npm run type-check`.
2. Once the checks pass, the deployment job triggers Vercel to build and deploy the application. 

Pushes to `main` deploy directly to production. Pushes to `staging` deploy to a preview environment.

## Contact

Contact the development team if you have questions.
