export type GetProjectPayloadType = {
  workspaceId: string;
  userId: string;
};

export type CreateProjectPayloadType = {
  workspaceId: string;
  userId: string;
  name: string;
  description: string;
};

export interface UpdateProjectPayloadType {
  workspaceId: string;
  projectId: string;
  userId: string;
  name?: string;
  description?: string;
}

// Delete Payload Interface
export interface DeleteProjectPayloadType {
  workspaceId: string;
  projectId: string;
  userId: string;
}
