# TeamSync

TeamSync is a full-stack collaboration platform for organizing work across workspaces, projects, sprints, and tasks. It combines a responsive web experience with a structured API, relational persistence, secure authentication, real-time task updates, invitations, billing, and AI-assisted project workflows.

The repository is organized as two applications:

- `teamsync-client`: Next.js web application
- `teamsync-server`: Express API and application services

## The Problem

In real-world software projects, work is often spread across chat messages, spreadsheets, meetings, and disconnected task lists. That makes it difficult to answer basic delivery questions with confidence:

- What needs to be done next?
- Who is responsible for each task?
- Which work is in progress, under review, or complete?
- Is the project moving quickly enough to meet its deadline?
- What changed since the last stand-up?
- What should the team do when progress falls behind schedule?

When these answers are delayed or require manual reporting, teams lose time coordinating instead of delivering. A task may be completed in one person's view while the rest of the team continues working with outdated information.

## The Solution

TeamSync gives teams one shared workspace for planning, execution, and delivery visibility. Projects are organized into sprints and tasks, with task status and sprint progress visible on a Kanban board. Every task change is persisted by the API and distributed through private Pusher channels, so connected team members see updates live without refreshing the page.

The integrated AI project assistant adds a second layer of project intelligence. It uses the current project description, task list, and previous conversation context to generate useful summaries and answer project-management questions about:

- What has been completed and what remains
- Current task and sprint status
- Potential blockers and project risks
- Possible next steps when work is behind schedule
- A concise summary for stand-ups, planning sessions, and status updates

Sprint start and end dates are stored with each sprint, allowing the AI assistant to discuss schedule context when that information is relevant. TeamSync does not currently calculate delivery velocity or automatically change the plan; its recommendations are generated from the project information provided to the assistant.

This combination of reliable task data, live collaboration, and AI-assisted analysis helps teams replace guesswork with a current view of the work and a clearer path to delivery.

## Core Capabilities

- Create workspaces and manage members
- Organize work into projects and sprints
- Track tasks on a Kanban board
- Move tasks between statuses with drag and drop
- See task creation, updates, status changes, and deletions in real time
- Generate AI project summaries and discuss project risks and next steps
- Invite collaborators by email
- Manage authentication, verification, and password recovery
- Connect billing and checkout workflows
- Provide separate user and administrative capabilities

## Product Tour

### Workspace collaboration

A workspace is the collaboration boundary for a team. Members can work together on projects, sprints, and tasks while access is controlled by authenticated sessions and role-aware authorization.

### Project and sprint planning

Projects group related work. Sprints provide a focused delivery cycle, including task status tracking, progress calculations, and task counts that support planning and reporting.

### Kanban execution

The sprint board presents tasks visually and supports drag-and-drop status changes. Mutations are sent to the API first; the server persists the change and then broadcasts the resulting event to the sprint channel.

### Real-time coordination

Connected users subscribed to the same sprint can see task creation, updates, status moves, and deletions without refreshing the page. The database remains the source of truth, while Pusher distributes successful changes to active sessions.

## Architecture

```mermaid
flowchart LR
    Browser[Next.js web app] -->|HTTP with cookies| API[Express API]
    Browser -->|Private channel subscription| Pusher[Pusher Channels]
    API -->|Publish after successful mutation| Pusher
    API --> Database[(PostgreSQL via Prisma)]
    API --> Redis[(Redis)]
    API --> Email[SMTP email delivery]
    API --> Payments[Stripe]
    API --> AI[Gemini / Groq]
    API --> OAuth[Google OAuth]
```

### Request and authentication flow

1. The web application sends requests to the versioned API under `/api/v1`.
2. The API authenticates users with access and refresh tokens stored in HTTP-only cookies.
3. Middleware validates the session and applies authorization rules before protected operations.
4. Business modules validate input, perform database work through Prisma, and return consistent API responses.
5. For task mutations, the API publishes a realtime event only after the database operation succeeds.

### Realtime flow

The sprint board uses private Pusher channels named:

```text
private-sprint-{sprintId}
```

| Event          | Payload                |
| -------------- | ---------------------- |
| `task_created` | `{ sprintId, task }`   |
| `task_updated` | `{ sprintId, task }`   |
| `task_deleted` | `{ sprintId, taskId }` |

The browser receives only the public Pusher key and cluster. Private-channel authentication and event publishing remain server-side responsibilities.

## Technology Stack

### Web application

- Next.js 16 with the App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Axios for API communication
- React Hook Form and Zod for form validation
- Pusher JS for realtime subscriptions
- `@hello-pangea/dnd` for Kanban interactions
- Framer Motion, GSAP, and Lenis for motion and interaction
- Lucide React for interface icons

### API and services

- Node.js 20+
- Express 5 with TypeScript and native ES modules
- Prisma 7 with PostgreSQL
- Argon2 and JSON Web Tokens for authentication support
- Passport with Google OAuth
- Redis for rate limiting and supporting infrastructure
- Pusher Channels for private realtime events
- Stripe for payment workflows
- Nodemailer and EJS templates for transactional email
- Gemini and Groq integrations for AI features
- tsup for production bundling

## Repository Structure

```text
TeamSync/
├── README.md
├── teamsync-client/
│   ├── public/
│   ├── src/
│   │   ├── app/                    Routes, layouts, and page-level UI
│   │   ├── context/                Authentication context
│   │   ├── global_components/      Shared landing and interface components
│   │   ├── lib/                    Axios, Pusher, toast, and utility helpers
│   │   ├── schemas/                Client-side validation schemas
│   │   └── type/                   Client-side TypeScript types
│   ├── package.json
│   └── README.md
└── teamsync-server/
    ├── prisma/                     Schema files and migrations
    ├── src/
    │   ├── app.ts                  Express middleware and route registration
    │   ├── server.ts                Server and infrastructure startup
    │   ├── config/                 Environment-backed configuration
    │   ├── global/                 Errors, responses, and async helpers
    │   ├── lib/                    Prisma, Redis, Pusher, AI, and seed helpers
    │   ├── middleware/             Authentication and rate limiting
    │   ├── module/                 Auth, user, and admin domain modules
    │   ├── utils/                  Tokens, hashing, OTP, and email helpers
    │   └── views/                  EJS email templates
    ├── package.json
    └── README.md
```

## Requirements

- Node.js 20 or newer
- npm
- PostgreSQL
- Redis
- A Pusher Channels application
- SMTP credentials for email workflows
- Google OAuth credentials if Google sign-in is enabled
- Stripe credentials if billing is enabled
- Gemini and/or Groq credentials if AI features are enabled

## Local Setup

### 1. Install dependencies

Open two terminals from the repository root:

```bash
cd teamsync-server
npm install
npm run prisma:generate
```

```bash
cd teamsync-client
npm install
```

### 2. Configure the API

Create `teamsync-server/.env`:

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

Use real values for the services required by the features you want to run. Never commit this file.

### 3. Configure the web application

Create `teamsync-client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

The value must include `/api/v1`. Because it is exposed to the browser bundle, it must contain only a public API URL and no secrets.

### 4. Prepare the database

For local development, generate the Prisma client and apply development migrations:

```bash
cd teamsync-server
npm run prisma:generate
npm run prisma:migrate
```

Do not use a destructive database reset against production data.

### 5. Run both applications

Start the API:

```bash
cd teamsync-server
npm run dev
```

Start the web application in a second terminal:

```bash
cd teamsync-client
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). The API health endpoint is available at [http://localhost:5000](http://localhost:5000).

## Useful Commands

### Web application

| Command         | Purpose                              |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the Next.js development server |
| `npm run lint`  | Run ESLint                           |
| `npm run build` | Create a production build            |
| `npm run start` | Start the production build           |

### API

| Command                   | Purpose                                  |
| ------------------------- | ---------------------------------------- |
| `npm run dev`             | Start the API with file watching         |
| `npm run build`           | Bundle the API into `dist/`              |
| `npm start`               | Run the production bundle                |
| `npm run prisma:generate` | Generate the Prisma client               |
| `npm run prisma:migrate`  | Create and apply a development migration |

## API Overview

All application routes are prefixed with `/api/v1`.

| Area                    | Base path          | Responsibility                                                              |
| ----------------------- | ------------------ | --------------------------------------------------------------------------- |
| Authentication          | `/auth`            | Registration, login, logout, verification, password reset, and Google OAuth |
| Workspaces              | `/user/workspace`  | Workspace lifecycle and membership                                          |
| Payments                | `/user/payment`    | Checkout and billing workflows                                              |
| Administration          | `/admin/panel`     | Administrative operations                                                   |
| Realtime configuration  | `/realtime/config` | Returns browser-safe Pusher configuration                                   |
| Realtime authentication | `/realtime/auth`   | Authorizes private sprint-channel subscriptions                             |

For request examples, demo accounts, request bodies, environment variables, and a smoke-test sequence, see [teamsync-server/POSTMAN_API.md](teamsync-server/POSTMAN_API.md).

## Security Practices

- Authentication cookies are HTTP-only and are used with credentialed cross-origin requests.
- Passwords are protected with Argon2 rather than stored in plain text.
- Access and refresh token secrets remain on the server.
- Private Pusher credentials, database credentials, SMTP passwords, and payment secrets never belong in browser code.
- Helmet supplies security headers, while CORS is restricted through `CLIENT_URL`.
- Rate limiting is backed by Redis.
- The server validates private realtime channels and only accepts the expected sprint-channel format.
- Production environments should use HTTPS and independently managed secrets.
- Rotate any credential exposed in source control, logs, screenshots, or chat.

## Deployment

The two applications can be deployed independently.

### Web application deployment

1. Create a deployment project with the root directory set to `teamsync-client`.
2. Select the Next.js framework preset.
3. Set `NEXT_PUBLIC_API_URL` to the deployed API URL, including `/api/v1`.
4. Deploy again whenever this public environment variable changes.

### API deployment

1. Create a deployment project with the root directory set to `teamsync-server`.
2. Configure the database, Redis, JWT, OAuth, email, Stripe, AI, and Pusher variables.
3. Set `CLIENT_URL` to the exact deployed web origin, including the protocol and without a trailing slash.
4. Register the deployed Google callback URL with the OAuth provider.
5. Run database migrations as an explicit release step.
6. Verify that `GET /` returns the health response.

For production realtime support, all four Pusher values must belong to the same application:

```env
PUSHER_APP_ID=your-pusher-app-id
PUSHER_KEY=your-pusher-key
PUSHER_SECRET=your-pusher-secret
PUSHER_CLUSTER=your-pusher-cluster
```

## Troubleshooting

### API requests fail

Check that the API is running and that `NEXT_PUBLIC_API_URL` points to the correct host and ends in `/api/v1`. Rebuild the web application after changing a public environment variable.

### CORS or authentication fails

Confirm that `CLIENT_URL` exactly matches the browser origin. Check HTTPS, cookie settings, and that requests include credentials.

### Private realtime subscriptions fail

Verify that:

- `GET /api/v1/realtime/config` returns `200`.
- `POST /api/v1/realtime/auth` returns `200` for an authenticated session.
- The browser sends authentication cookies.
- The Pusher key and cluster match the server configuration.
- The channel name follows `private-sprint-{sprintId}`.

### Task updates do not appear

Confirm that all sessions are viewing the same sprint, the REST mutation succeeds, and the API can publish to Pusher. Events are emitted only after the database mutation succeeds.

### Database setup fails

Check `DATABASE_URL`, confirm PostgreSQL is reachable, then run `npm run prisma:generate` before applying migrations.

## Documentation Map

- [Web application README](teamsync-client/README.md): frontend-specific setup and realtime details
- [API README](teamsync-server/README.md): backend-specific configuration and deployment details
- [API request collection guide](teamsync-server/POSTMAN_API.md): request examples and smoke-test workflow

## Project Status

The repository contains an actively developed full-stack implementation with the core collaboration workflow, authentication, persistence, integrations, and realtime task experience in place. Feature-specific behavior is documented in the application-level READMEs and API request guide.

## License

No license has been specified for this repository.
