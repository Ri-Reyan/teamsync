import z from "zod";

export const AIChat = z.object({
  user_prompt: z
    .string()
    .min(1, { message: "prompt can be empty" })
    .max(1500, { message: "Prompt must smaller than 1500 charecters" }),
});
