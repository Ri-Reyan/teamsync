# TeamSync Client

The TeamSync client is a Next.js application for collaborative workspace, project, sprint, and task management. It provides authentication screens, workspace dashboards, Kanban sprint boards, invitations, billing, and an AI project assistant.

## Features

- Email/password authentication and Google SSO callback handling
- Workspace and member management
- Project and sprint management
- Drag-and-drop Kanban task board
- Real-time task updates with Pusher private channels
- Invitation acceptance flow
- Stripe pricing and checkout screens
- AI project assistant interface
- Responsive interface built with Tailwind CSS, Framer Motion, GSAP, and Lucide icons

## Technology

- Next.js `16` with the App Router
- React `19` and TypeScript
- Axios for API requests
- Pusher JS for real-time subscriptions
- `@hello-pangea/dnd` for Kanban drag and drop
- React Hook Form and Zod for form validation
- Tailwind CSS `4`

## Requirements

- Node.js 20 or newer
- npm
- A running TeamSync server, locally or on Vercel

## Installation

```bash
npm install
```

Create `.env` in this directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

For production, use the deployed backend URL, including `/api/v1`:

```env
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api/v1
```

`NEXT_PUBLIC_API_URL` is embedded into the browser bundle at build time. Add it in Vercel and redeploy after changing it.

## Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The backend must be running and its `CLIENT_URL` must match the client origin. For local development, use `http://localhost:3000`.

## Available Scripts

| Command         | Description                       |
| --------------- | --------------------------------- |
| `npm run dev`   | Start Next.js in development mode |
| `npm run lint`  | Run ESLint                        |
| `npm run build` | Create a production build         |
| `npm run start` | Start the production build        |

## Real-Time Updates

The sprint board subscribes to a Pusher private channel named:

```text
private-sprint-{sprintId}
```

The client obtains the public Pusher key and cluster from the backend endpoint `/realtime/config`. It authenticates private-channel access through `/realtime/auth`, sending the existing HTTP-only authentication cookies.

The backend publishes these events after successful task mutations:

| Event          | Payload                |
| -------------- | ---------------------- |
| `task_created` | `{ sprintId, task }`   |
| `task_updated` | `{ sprintId, task }`   |
| `task_deleted` | `{ sprintId, taskId }` |

Task changes should be made through the REST API. The server is the source of truth and publishes events only after the database mutation succeeds.

## Project Structure

```text
src/
├── app/
│   ├── (auth)/                 Authentication pages and components
│   ├── (user)/                 Authenticated dashboard pages
│   ├── admin/                  Admin pages
│   ├── layout.tsx              Root layout and providers
│   └── globals.css             Global styles
├── context/                    React authentication context
├── global_components/          Shared marketing and UI components
├── lib/
│   ├── axios.ts                Configured API client
│   ├── socket.ts               Pusher client and sprint subscriptions
│   └── toast.tsx               Toast helpers
├── schemas/                    Client-side schemas
└── type/                       Shared client types
```

## Production Deployment on Vercel

1. Import this repository into Vercel.
2. Set the project root to `teamsync-client` if the repository contains both applications.
3. Set the framework preset to Next.js.
4. Add `NEXT_PUBLIC_API_URL` with the deployed backend API URL.
5. Deploy or redeploy the project.

The backend `CLIENT_URL` must be set to the exact frontend URL, including the protocol and without an extra trailing slash.

## Troubleshooting

### API requests fail

Check that `NEXT_PUBLIC_API_URL` points to the deployed backend and ends in `/api/v1`. Rebuild after changing the variable.

### Private Pusher subscription fails

Check the browser Network tab for:

- `GET /api/v1/realtime/config` returning `200`
- `POST /api/v1/realtime/auth` returning `200`
- Authentication cookies being sent with the auth request

Also verify that the backend `CLIENT_URL` exactly matches the deployed frontend URL and that both deployments use the same Pusher app and cluster.

### Updates do not appear on another board

Confirm both users are viewing the same sprint, task REST mutations return success, and the backend logs contain no Pusher publish errors.

## Security

- Never commit `.env` files.
- Only the Pusher app key and cluster belong in browser-accessible responses.
- Never expose `PUSHER_SECRET`, database credentials, JWT secrets, email passwords, or payment provider secrets to the client.
- Rotate any secret that has been exposed publicly.
