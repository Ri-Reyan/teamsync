# TeamSync Server

The TeamSync server is the Express API for the TeamSync collaboration platform. It handles authentication, authorization, workspaces, members, projects, sprints, tasks, invitations, payments, AI requests, persistence, and real-time task events.

## Features

- JWT authentication stored in secure HTTP-only cookies
- Google OAuth via Passport
- Role-based access control for platform users and administrators
- Workspace, member, project, sprint, and task APIs
- Sprint progress and task-count calculations
- Invitation email and acceptance workflows
- Stripe checkout integration
- Redis-backed rate limiting and cache/client support
- Prisma database access with PostgreSQL
- Pusher private-channel authentication and server-side event publishing
- Security headers with Helmet and cross-origin cookie support

## Technology

- Node.js with TypeScript and native ES modules
- Express `5`
- Prisma `7` with PostgreSQL
- Pusher server SDK
- Redis
- Passport and Google OAuth
- JSON Web Tokens and Argon2
- Stripe
- Gemini and Groq integrations
- tsup for production bundling

## Requirements

- Node.js 20 or newer
- npm
- PostgreSQL database
- Redis instance
- Pusher Channels application
- SMTP credentials for email workflows

## Installation

```bash
npm install
npm run prisma:generate
```

Create `.env` in this directory. Use placeholders and keep the file out of version control:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
CLIENT_URL=http://localhost:3000
PORT=5000
NODE_ENV=development

EMAIL_USER=your-smtp-user
EMAIL_PASS=your-smtp-password

REDIS_USER=default
REDIS_PASSWORD=your-redis-password
REDIS_HOST=your-redis-host
REDIS_PORT=6379

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

JWT_REFRESH_TOKEN_SECRET=replace-with-a-long-random-secret
JWT_ACCESS_TOKEN_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_TOKEN_EXPIRES=7d
JWT_ACCESS_TOKEN_EXPIRES=1d

STRIPE_SECRET_KEY=your-stripe-secret-key
GEMINI_API_KEY=your-gemini-api-key
GROQ_API_KEY=your-groq-api-key

PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=your-pusher-cluster
```

## Database

Generate the Prisma client:

```bash
npm run prisma:generate
```

Create and apply a development migration:

```bash
npm run prisma:migrate
```

Production deployments should run migrations as an explicit release step using the deployment platform's database migration workflow. Do not use a destructive reset against production data.

## Development

Start the API with file watching:

```bash
npm run dev
```

The API is available at `http://localhost:5000`. The health response is `GET /`.

## Available Scripts

| Command                   | Description                          |
| ------------------------- | ------------------------------------ |
| `npm run dev`             | Start the server with `tsx watch`    |
| `npm run build`           | Bundle the server into `dist/`       |
| `npm start`               | Run the production bundle            |
| `npm run prisma:generate` | Generate Prisma client code          |
| `npm run prisma:migrate`  | Create/apply a development migration |

## API Overview

For copy-paste Postman requests, demo accounts, sample request bodies, environment variables, and the recommended smoke-test sequence, see [POSTMAN_API.md](POSTMAN_API.md).

All application routes are prefixed with `/api/v1`.

| Area            | Base path          | Purpose                                                             |
| --------------- | ------------------ | ------------------------------------------------------------------- |
| Authentication  | `/auth`            | Register, login, logout, verification, password reset, Google OAuth |
| Workspaces      | `/user/workspace`  | Workspace lifecycle and membership                                  |
| Payments        | `/user/payment`    | Checkout and billing workflows                                      |
| Admin           | `/admin/panel`     | Administrative operations                                           |
| Realtime config | `/realtime/config` | Returns browser-safe Pusher key and cluster                         |
| Realtime auth   | `/realtime/auth`   | Authenticates private Pusher channels                               |

Authenticated routes use the `accessToken` and `refreshToken` HTTP-only cookies. Requests from the frontend must send credentials.

## Pusher Real-Time Architecture

The server owns all event publishing. After a successful task database mutation, it publishes to:

```text
private-sprint-{sprintId}
```

Events:

| Event          | Published after            | Payload                |
| -------------- | -------------------------- | ---------------------- |
| `task_created` | Task creation              | `{ sprintId, task }`   |
| `task_updated` | Task update or status move | `{ sprintId, task }`   |
| `task_deleted` | Task deletion              | `{ sprintId, taskId }` |

The client receives the public key and cluster from `GET /api/v1/realtime/config`. It authenticates a private subscription through `POST /api/v1/realtime/auth`. That endpoint requires a valid user session and accepts only channels beginning with `private-sprint-`.

The Pusher secret is used only by the server and must never be returned to the client.

## Project Structure

```text
src/
├── app.ts                     Express middleware and route registration
├── server.ts                  HTTP server startup and infrastructure boot
├── config/                    Environment-backed credentials
├── generated/prisma/          Generated Prisma client code
├── global/                    Errors, async handlers, responses, user types
├── lib/
│   ├── prisma.ts              Prisma connection
│   ├── pusher.ts              Pusher client and event publisher
│   ├── redis.ts               Redis connection
│   └── seed.ts                Seed data
├── middleware/                Authentication and rate limiting
├── module/
│   ├── auth/                  Authentication and OAuth
│   ├── admin/                 Admin APIs
│   └── user/                  Workspace, project, sprint, task, and payment APIs
├── utils/                     Tokens, hashing, OTP, and email helpers
└── views/                     EJS email templates
```

## Production Deployment on Vercel

1. Import this repository into Vercel.
2. Set the project root to `teamsync-server` if both applications share a repository.
3. Configure every server environment variable in Vercel. Do not rely on a local `.env`.
4. Set `CLIENT_URL` to the exact deployed frontend origin.
5. Set `GOOGLE_CALLBACK_URL` to the deployed callback URL and register it with Google.
6. Set `DATABASE_URL`, Redis values, provider credentials, JWT secrets, and all four Pusher values.
7. Deploy and verify `GET /` returns the health response.

Required production realtime variables:

```env
CLIENT_URL=https://your-frontend.vercel.app
PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=your-pusher-cluster
```

The server intentionally fails at startup when a required Pusher value is missing. This prevents a deployment that appears healthy but cannot publish or authenticate realtime events.

## Troubleshooting

### CORS or authentication errors

Ensure `CLIENT_URL` exactly matches the browser origin and that the client uses the correct backend URL. The server enables credentialed CORS and cookies are configured as `secure` and `sameSite: none` for cross-origin production use.

### Pusher configuration errors

Verify `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, and `PUSHER_CLUSTER` are configured for the same Pusher application. Redeploy after changing Vercel variables.

### Private-channel auth returns `401`

The browser must already have a valid authentication cookie. Check cookie domain, HTTPS, `CLIENT_URL`, and the request's credentials policy. Inspect `POST /api/v1/realtime/auth` in the browser Network tab.

### Events publish but the board does not update

Confirm both clients use the same sprint ID and channel name, and inspect backend logs for Pusher publish errors. Task events are emitted only after the REST mutation succeeds.

## Security

- Never commit `.env` files or provider credentials.
- Rotate credentials that have been exposed in logs, screenshots, chat, or source control.
- Keep `PUSHER_SECRET`, JWT secrets, database credentials, SMTP passwords, and payment keys server-side.
- Use HTTPS in production.
- Keep CORS restricted to the deployed frontend origin.
