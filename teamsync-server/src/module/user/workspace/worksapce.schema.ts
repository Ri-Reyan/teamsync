import z from "zod";

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Workspace name must be at least 3 characters" })
    .max(100, {
      message: "Workspace name must be smaller than 100 characters",
    }),
});

export const updateWorkspaceSchema = createWorkspaceSchema;
