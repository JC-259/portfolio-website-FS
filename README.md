# Portfolio Website Monorepo

A full-stack personal portfolio website designed to showcase projects, skills, and allow for direct contact while maintaining security and privacy.

## 🌐 Overview

This project is a monorepo containing both the frontend and backend of a personal portfolio. It features a clean, responsive design with dynamic content sourced from GitHub and visitor metrics powered by Umami.

## 🧱 Architecture

- **Frontend**: Built with Vite, React 19, and TailwindCSS.
- **Backend**: AWS Serverless (API Gateway, Lambda, SQS, SES, DynamoDB).
- **CI/CD**: AWS CodePipeline triggered from GitHub.
- **Security**: Cloudflare Turnstile + Access protects CV download and contact form.
- **Analytics**: Umami self-hosted on a private NAS with Tailscale & Cloudflare Tunnel (optional).

## 📁 Repository Structure

```
/
├── cdk/              # CDK infrastructure (backend)
├── frontend/         # Vite React frontend
├── package.json      # Root workspace config
```

## 🚀 Features

- 🔐 Verification-gated CV download and contact form using Cloudflare Turnstile
- 📬 Contact form masks user email with AWS SES
- 🛠 Dynamic "open to work" status toggle, backed by DynamoDB
- 📈 GitHub projects automatically displayed via GitHub API
- 📊 Optional Umami analytics tracking (remove script to disable)
- ☁️ Fully deployable within AWS, utilising free tier, primarily

## 🛠 Deployment

### 1. Prerequisites

- AWS account (with roles managed via Assume or AWS CLI)
- GitHub account (with PAT token for codepipeline access)
- Cloudflare account for DNS and Turnstile
- Node.js ≥ 18, CDK installed
- .env file setup with correct values
- Domain name (namecheap, cloudflare, etc.)

### 2. Bootstrap CDK

First, bootstrap AWS environments; `us-east-1` is required for the certs

```bash
cd cdk && npx ts-node --prefer-ts-exts bin/cdk.ts && cdk bootstrap --app "npx ts-node --prefer-ts-exts bin/cdk.ts" --profile <PROFILENAMEHERE> aws://<AWS_ACCOUNT>/us-east-1      # For certs
cd cdk && npx ts-node --prefer-ts-exts bin/cdk.ts && cdk bootstrap --app "npx ts-node --prefer-ts-exts bin/cdk.ts" --profile <PROFILENAMEHERE> aws://<AWS_ACCOUNT>/<AWS_REGION>      # For backend
```

### 3. Deploy Stacks in Order
Adjust values for your own AWS account in the `package.json` before running these.

```bash
npm run deploy:certificates
npm run deploy:domain
npm run deploy:pipeline
```

`npm run deploy:backend` is available for testing or manual deployments. However, the backend is fully deployed as part of the `portfolio-pipeline-stack`.

## 🔧 Environment Variables

Populate the `.env` file with your own values as required. Some of the set values don't necessarily need to be stored within the .env

Be sure to exclude the `.env` file from version control to protect secrets.

## 💻 Local Development

```sh
cd frontend
npm install
npm run dev
```

This launches the site locally at `http://localhost:5173`.

## 📦 Deployment Notes

- This repo avoids AWS Secrets Manager for cost reasons; keys are stored in `.env`.
- All backend logic is in Lambdas defined in CDK.
- Umami is optional, just remove the umami script from the `index.html` if not using. 

## 🤷 Tests?

No tests — it’s a personal project 😄.

---

## Notes

- Note: In a production environment, environment variables would be managed through secure configuration.
- (e.g. Secrets Manager or SSM). Here, a `.env` file is used for simplicity, portability, and the sharing of a deployed codebase.
- For [Umami](https://umami.is/) metrics to run, this needs to be configured for your own setup.

---

# 📂 Additional READMEs

- [`frontend/README.md`](frontend/README.md) – frontend details & setup
- [`cdk/README.md`](cdk/README.md) – CDK stacks & infra notes

---
