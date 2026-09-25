import z from "zod";

export const sendInvitationSchema = z.object({
  //   workspace_id: z.string(),
  member_email: z.string().email(),
  role: z.enum(["MEMBER", "ADMIN"], {
    error: "Select a valid role",
  }),
});
