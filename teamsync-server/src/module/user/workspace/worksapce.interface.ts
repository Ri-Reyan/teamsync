import { PlatformRole } from "../../../generated/prisma/enums.js";

export type CreateWorkspacePayload = {
  id: string;
  email: string;
  platformRole: PlatformRole;
  isPremium: boolean;
  name: string;
};

export type UpdateWorkspacePayload = CreateWorkspacePayload & {
  workspace_id: string;
};

export type TransferWorkspacePayload = {
  currentUserId: string;
  workspaceId: string;
  newOwnerId: string;
};
