import z from "zod";

export const createSprintSchema = z.object({
  name: z.string().min(1, { message: "Name cannot be empty" }),
  startDate: z.string(),
  endDate: z.string(),
});

export const updateSprintSchema = z.object({
  name: z.string().min(1, { message: "Name cannot be empty" }).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
