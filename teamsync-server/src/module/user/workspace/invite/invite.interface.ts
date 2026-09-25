import { Role } from "../../../../generated/prisma/enums.js";

export interface GetInvitationPayloadType {
  id: string;
  user_id: string;
}

export interface SendInvitationPayloadType {
  workspace_id: string;
  sender_id: string;
  member_email: string;
  role: Role;
}

export interface AcceptInvitationPayloadType {
  id: string;
  user_id: string;
}

export interface DeleteInvitationPayloadType {
  id: string;
  user_id: string;
  inviteId: string;
}
