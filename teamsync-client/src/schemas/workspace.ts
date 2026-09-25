import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(3, "Workspace name must be at least 3 characters")
    .max(100, "Workspace name must be under 100 characters"),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

export const inviteSchema = z.object({
  member_email: z.string().email("Invalid email address"),
  role: z.enum(["MEMBER", "ADMIN"]),
});
