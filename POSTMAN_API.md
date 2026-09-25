# TeamSync API - Postman Guide

This document is a Postman-ready reference for the TeamSync API.

## Importable Postman Collection

Import [TeamSync.postman_collection.json](TeamSync.postman_collection.json) directly into Postman using **Import > File**. The collection includes endpoint groups, sample JSON request bodies, collection variables, and post-response scripts that save newly created resource IDs automatically.

After importing:

1. Select the collection and set `baseUrl` to your API URL if it is not running locally.
2. Run the login request first. Postman will keep the `accessToken` and `refreshToken` HTTP-only cookies in its cookie jar.
3. Run the create requests in order to populate `workspaceId`, `projectId`, `sprintId`, and `taskId`.

Keep Postman's cookie jar enabled. Do not add JWT secrets or manually copy the HTTP-only cookies into request headers.

## 1. Postman Environment

Create a Postman environment named `TeamSync Local` or `TeamSync Production` with these variables:

| Variable                   | Local value                            | Production value                         |
| -------------------------- | -------------------------------------- | ---------------------------------------- |
| `baseUrl`                  | `http://localhost:5000/api/v1`         | `https://your-backend.vercel.app/api/v1` |
| `baseUrlWithoutApiVersion` | `http://localhost:5000`                | `https://your-backend.vercel.app`        |
| `workspaceId`              | Replace after creating a workspace     | Replace after creating a workspace       |
| `projectId`                | Replace after creating a project       | Replace after creating a project         |
| `sprintId`                 | Replace after creating a sprint        | Replace after creating a sprint          |
| `taskId`                   | Replace after creating a task          | Replace after creating a task            |
| `memberId`                 | Replace from the members response      | Replace from the members response        |
| `invitationId`             | Replace from the invitation response   | Replace from the invitation response     |
| `userId`                   | Replace from `/auth/me` or admin users | Replace from `/auth/me` or admin users   |
| `stripeSessionId`          | Set after Stripe checkout              | Set after Stripe checkout                |

Use `{{baseUrl}}` in every request URL. Set the request header below on requests with a JSON body:

```text
Content-Type: application/json
```

## 2. Authentication

Authentication uses secure HTTP-only cookies. Postman must preserve cookies for the backend domain. After a successful login, confirm that cookies named `accessToken` and `refreshToken` appear in Postman's cookie manager. Do not manually place JWT secrets in request headers.

### Demo Accounts

The backend seed creates these accounts when they do not already exist:

| Role  | Email               | Password    |
| ----- | ------------------- | ----------- |
| User  | `user@example.com`  | `user1234`  |
| Admin | `admin@example.com` | `admin1234` |

These are development/demo credentials only. Do not use them in a production deployment.

### Login as Demo User

```http
POST {{baseUrl}}/auth/login
```

Body, `raw` -> `JSON`:

```json
{
  "email": "user@example.com",
  "password": "user1234"
}
```

### Login as Demo Admin

```http
POST {{baseUrl}}/auth/login
```

```json
{
  "email": "admin@example.com",
  "password": "admin1234"
}
```

### Get Current User

```http
GET {{baseUrl}}/auth/me
```

Requires the cookies from login. Save the returned user ID as `userId` when needed.

### Register a New User

Registration sends a six-digit OTP to the supplied email. The username must be at least five characters and the password at least eight characters.

```http
POST {{baseUrl}}/auth/register
```

```json
{
  "username": "postmanuser",
  "email": "new.user@example.com",
  "password": "newuser1234",
  "role": "USER"
}
```

Allowed `role` values: `USER`, `ADMIN`. In normal applications, use the default `USER` role.

### Verify Registration Email

Use the OTP received by email:

```http
POST {{baseUrl}}/auth/verify-email
```

```json
{
  "email": "new.user@example.com",
  "otp": "123456"
}
```

A successful verification sets authentication cookies.

### Forgot Password

```http
POST {{baseUrl}}/auth/forgot-password
```

```json
{
  "email": "user@example.com"
}
```

### Reset Password

Use the reset token received through the email link:

```http
POST {{baseUrl}}/auth/reset-password
```

```json
{
  "token": "reset-token-from-email",
  "newPassword": "newpassword123"
}
```

### Logout

```http
POST {{baseUrl}}/auth/logout
```

## 3. Health and Realtime Configuration

### Health Check

```http
GET {{baseUrlWithoutApiVersion}}/
```

For local use, `{{baseUrlWithoutApiVersion}}` is `http://localhost:5000`.

### Get Browser-Safe Pusher Configuration

```http
GET {{baseUrl}}/realtime/config
```

This returns only the public Pusher key and cluster. It does not require authentication.

### Authenticate a Pusher Private Channel

This is normally called by `pusher-js`, not manually. It requires the logged-in user's cookies.

```http
POST {{baseUrl}}/realtime/auth
Content-Type: application/x-www-form-urlencoded
```

Body, `x-www-form-urlencoded`:

| Key            | Value              |
| -------------- | ------------------ |
| `socket_id`    | `123456.789012`    |
| `channel_name` | `private-sprint-1` |

Only channel names beginning with `private-sprint-` are accepted.

## 4. Workspace Endpoints

All workspace requests require a logged-in user cookie.

### List My Workspaces

```http
GET {{baseUrl}}/user/workspace
```

### Create Workspace

```http
POST {{baseUrl}}/user/workspace
```

```json
{
  "name": "Postman Demo Workspace"
}
```

Save the returned workspace ID as `workspaceId`.

### Update Workspace

```http
PATCH {{baseUrl}}/user/workspace/{{workspaceId}}
```

```json
{
  "name": "Updated Demo Workspace"
}
```

### Delete Workspace

```http
DELETE {{baseUrl}}/user/workspace/{{workspaceId}}
```

### Leave Workspace

Workspace owners cannot leave their own workspace.

```http
DELETE {{baseUrl}}/user/workspace/{{workspaceId}}/leave
```

### Transfer Workspace Ownership

Use the target user's ID as `newOwnerId`:

```http
PATCH {{baseUrl}}/user/workspace/{{workspaceId}}/transfer-ownership
```

```json
{
  "newOwnerId": "target-user-id"
}
```

## 5. Member Endpoints

### List Workspace Members

```http
GET {{baseUrl}}/user/workspace/{{workspaceId}}/members
```

Save a member table ID from the response as `memberId`.

### Remove a Workspace Member

```http
DELETE {{baseUrl}}/user/workspace/{{workspaceId}}/members/{{memberId}}
```

## 6. Project Endpoints

### List Workspace Projects

```http
GET {{baseUrl}}/user/workspace/{{workspaceId}}/project
```

### Create Project

```http
POST {{baseUrl}}/user/workspace/{{workspaceId}}/project
```

```json
{
  "name": "Postman API Demo Project",
  "description": "A project created while testing the TeamSync API with Postman."
}
```

Save the returned project ID as `projectId`.

### Update Project

```http
PATCH {{baseUrl}}/user/workspace/{{workspaceId}}/project/{{projectId}}
```

```json
{
  "name": "Updated API Demo Project",
  "description": "The project description was updated through Postman."
}
```

Both fields are optional for update requests.

### Delete Project

```http
DELETE {{baseUrl}}/user/workspace/{{workspaceId}}/project/{{projectId}}
```

## 7. Sprint Endpoints

### List Project Sprints

```http
GET {{baseUrl}}/user/workspace/{{workspaceId}}/project/{{projectId}}/sprint
```

### Create Sprint

```http
POST {{baseUrl}}/user/workspace/{{workspaceId}}/project/{{projectId}}/sprint
```

```json
{
  "name": "Sprint 1 - API Testing",
  "startDate": "2026-09-18T00:00:00.000Z",
  "endDate": "2026-10-02T23:59:59.000Z"
}
```

Save the returned sprint ID as `sprintId`.

### Update Sprint

```http
PUT {{baseUrl}}/user/workspace/{{workspaceId}}/project/{{projectId}}/sprint/{{sprintId}}
```

```json
{
  "name": "Sprint 1 - Updated",
  "startDate": "2026-09-19T00:00:00.000Z",
  "endDate": "2026-10-03T23:59:59.000Z"
}
```

All update fields are optional.

### Delete Sprint

```http
DELETE {{baseUrl}}/user/workspace/{{workspaceId}}/project/{{projectId}}/sprint/{{sprintId}}
```

## 8. Task Endpoints

### List Sprint Tasks

```http
GET {{baseUrl}}/user/workspace/{{workspaceId}}/project/{{projectId}}/sprint/{{sprintId}}/tasks
```

### Create Task

```http
POST {{baseUrl}}/user/workspace/{{workspaceId}}/project/{{projectId}}/sprint/{{sprintId}}/tasks
```

```json
{
  "title": "Verify task creation event",
  "description": "Confirm the REST response and Pusher update in a second browser session.",
  "status": "TODO"
}
```

Allowed `status` values: `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`. Save the returned task ID as `taskId`.

### Update Task

```http
PATCH {{baseUrl}}/user/workspace/{{workspaceId}}/project/{{projectId}}/sprint/{{sprintId}}/tasks/{{taskId}}
```

```json
{
  "title": "Verify task update event",
  "description": "The task was updated through Postman.",
  "status": "IN_PROGRESS"
}
```

All fields are optional in an update request.

### Delete Task

```http
DELETE {{baseUrl}}/user/workspace/{{workspaceId}}/project/{{projectId}}/sprint/{{sprintId}}/tasks/{{taskId}}
```

## 9. Invitation Endpoints

### List Workspace Invitations

```http
GET {{baseUrl}}/user/workspace/{{workspaceId}}/invite
```

### Send Invitation

The invited address must belong to an existing user account.

```http
POST {{baseUrl}}/user/workspace/{{workspaceId}}/invite
```

```json
{
  "member_email": "admin@example.com",
  "role": "MEMBER"
}
```

Allowed invitation roles: `MEMBER`, `ADMIN`.

### Accept Invitation

Use the invitation ID returned by the invitation list or send response. Log in as the invited user before sending this request.

```http
POST {{baseUrl}}/user/workspace/invitations/{{invitationId}}/accept
```

No body is required.

### Cancel Invitation

```http
DELETE {{baseUrl}}/user/workspace/{{workspaceId}}/invite
```

```json
{
  "inviteId": "invitation-id"
}
```

## 10. AI Endpoints

These requests require a logged-in user and valid AI provider configuration. The chat endpoint is rate limited to 20 requests per minute and summary to 10 requests per minute.

### Send AI Chat Message

```http
POST {{baseUrl}}/user/workspace/{{workspaceId}}/project/{{projectId}}/ai/chat
```

```json
{
  "user_prompt": "Summarize the current sprint risks and suggest the next three actions."
}
```

The server also accepts `prompt` as an alias.

### Generate Project Summary

```http
POST {{baseUrl}}/user/workspace/{{workspaceId}}/project/{{projectId}}/ai/summary
```

No body is required.

### Get Previous AI Conversations

```http
GET {{baseUrl}}/user/workspace/{{workspaceId}}/project/{{projectId}}/ai/conversations
```

## 11. Payment Endpoints

Payment requests require a logged-in user. Stripe must be configured on the server.

### Create Checkout Session

Supported plans are `PROFESSIONAL` and `ENTERPRISE`.

```http
POST {{baseUrl}}/user/payment/checkout
```

```json
{
  "package": "PROFESSIONAL"
}
```

Open the `url` returned by the response in a browser, complete Stripe checkout, and save the returned session ID as `stripeSessionId`.

### Confirm Payment

```http
POST {{baseUrl}}/user/payment/confirm
```

```json
{
  "sessionId": "{{stripeSessionId}}"
}
```

Do not use a made-up session ID. It must be a paid Stripe Checkout session belonging to the logged-in user.

## 12. Admin Endpoints

Log in with the demo admin account before using these endpoints. Admin routes require the admin user's authentication cookies.

### Admin Dashboard

```http
GET {{baseUrl}}/admin/panel/dashboard
```

### List Users

```http
GET {{baseUrl}}/admin/panel/users
```

Save a target user's ID as `userId` before suspending an account.

### Suspend User

```http
PATCH {{baseUrl}}/admin/panel/users/{{userId}}/suspend
```

No body is required.

## 13. Recommended Test Sequence

Use this order for a clean Postman smoke test:

1. Login as `user@example.com`.
2. Call `GET /auth/me` and confirm the session.
3. Create a workspace and set `workspaceId`.
4. Create a project and set `projectId`.
5. Create a sprint and set `sprintId`.
6. Create a task and set `taskId`.
7. List tasks and update the task status.
8. Test project, sprint, and workspace list endpoints.
9. Login as `admin@example.com` in a separate Postman session.
10. Call the admin dashboard and users endpoints.

## 14. Common Errors

| Status | Meaning                                | Check                                                         |
| ------ | -------------------------------------- | ------------------------------------------------------------- |
| `400`  | Invalid input or path ID               | Compare the body with the examples and use real IDs           |
| `401`  | Missing or expired session             | Login again and confirm cookies are enabled                   |
| `403`  | Insufficient role or membership        | Use the correct user/workspace role                           |
| `404`  | Resource does not exist                | Verify the workspace, project, sprint, task, or invitation ID |
| `429`  | Rate limit exceeded                    | Wait for the rate-limit window to reset                       |
| `500`  | Server or provider configuration error | Check backend logs and environment variables                  |

## Security Notice

The demo credentials in this file are intentionally public test values. Never document or commit real database passwords, API keys, JWT secrets, Pusher secrets, SMTP passwords, or Stripe secret keys. Rotate any credentials that have already been exposed.
