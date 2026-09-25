import Pusher from "pusher";
import { credentials } from "../config/credentials.js";

const pusherConfig = [
  credentials.pusher_app_id,
  credentials.pusher_key,
  credentials.pusher_secret,
  credentials.pusher_cluster,
];

if (pusherConfig.some((value) => !value)) {
  throw new Error(
    "Missing Pusher configuration. Set PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, and PUSHER_CLUSTER.",
  );
}

export const pusher = new Pusher({
  appId: credentials.pusher_app_id as string,
  key: credentials.pusher_key as string,
  secret: credentials.pusher_secret as string,
  cluster: credentials.pusher_cluster as string,
  useTLS: true,
});

export const publishTaskEvent = async (
  sprintId: number,
  event: string,
  data: unknown,
) => {
  try {
    await pusher.trigger(`private-sprint-${sprintId}`, event, data);
  } catch (error) {
    console.error(`Failed to publish Pusher event: ${event}`, error);
    throw error;
  }
};
