export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  createdAt: string;
}

export interface WorkspaceResponse {
  success: boolean;
  message: string;
  data: Workspace[];
}
