import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string({ message: "Task title is required" }).min(1),
  description: z.string().optional(),
  status: z
    .enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"])
    .optional()
    .default("TODO"),
});

export const updateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]).optional(),
});
