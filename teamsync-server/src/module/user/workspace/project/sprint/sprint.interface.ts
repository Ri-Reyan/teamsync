export type GetSprintPayloadType = {
  projectId: string;
  userId: string;
};

export type CreateSprintPayloadType = GetSprintPayloadType & {
  name: string;
  startDate: string;
  endDate: string;
};

export type UpdateSprintPayloadType = GetSprintPayloadType & {
  sprintId: number; // নির্দিষ্ট Sprint ID পাঠানো জরুরি
  name?: string;
  startDate?: string;
  endDate?: string;
};

export type DeletedSprintPayloadType = GetSprintPayloadType & {
  sprintId: number;
};
