import z from "zod";

export const CreateProjectSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Project name cannot be empty" })
    .max(100, { message: "Name must be smaller than 100 charecters" }),
  description: z
    .string()
    .min(1, { message: "Project description cannot be empty" })
    .max(999, { message: "Description must be smaller than 1000 charecters" }),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(1, "Project name cannot be empty").optional(),
  description: z.string().optional(),
});
