export interface IGetMembersPayload {
  workspace_id: string;
  user_id: string;
}

export interface IDeleteMemberPayload {
  workspace_id: string;
  member_id: string;
  requested_by_user_id: string;
}
