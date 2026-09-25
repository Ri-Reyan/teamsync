import Pusher from "pusher-js";
import { api } from "./axios";

let pusher: Pusher | null = null;

const getPusher = async () => {
  console.log("🔥 getPusher called");

  if (pusher) {
    console.log("♻️ Returning existing Pusher");
    return pusher;
  }

  console.log("📡 Calling realtime/config");

  const response = await api.get<{
    data: {
      key: string;
      cluster: string;
    };
  }>("/realtime/config");

  console.log("✅ realtime/config response", response.data);

  pusher = new Pusher(response.data.data.key, {
    cluster: response.data.data.cluster,

    channelAuthorization: {
      endpoint: `${process.env.NEXT_PUBLIC_API_URL}/realtime/auth`,
      transport: "ajax",

      customHandler: async (params, callback) => {
        try {
          console.log("🔐 Pusher auth request:", {
            socketId: params.socketId,
            channelName: params.channelName,
          });

          const response = await api.post(
            "/realtime/auth",
            {
              socket_id: params.socketId,
              channel_name: params.channelName,
            },
            {
              withCredentials: true,
            },
          );

          console.log("✅ Pusher auth success:", response.data);

          callback(null, response.data);
        } catch (error) {
          console.error("❌ Pusher auth failed:", error);

          callback(error as Error, null);
        }
      },
    },
  });

  // Monitor Pusher connection state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pusher.connection.bind("state_change", (states: any) => {
    console.log("🔌 Pusher state:", states.previous, "→", states.current);
  });

  // Monitor Pusher connection errors
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pusher.connection.bind("error", (error: any) => {
    console.error("❌ Pusher connection error:", error);
  });

  console.log("✅ Pusher instance created");

  return pusher;
};

export const subscribeToSprint = async (
  sprintId: string | number,
  handlers: Record<string, (data: never) => void>,
) => {
  console.log("🚀 subscribeToSprint called:", sprintId);

  const client = await getPusher();

  const channelName = `private-sprint-${sprintId}`;

  console.log("📡 Subscribing to:", channelName);

  const channel = client.subscribe(channelName);

  console.log("✅ subscribe() called");

  Object.entries(handlers).forEach(([event, handler]) => {
    console.log(`📥 Binding event: ${event}`);

    channel.bind(event, handler);
  });

  return () => {
    console.log("🧹 Pusher cleanup:", channelName);

    Object.entries(handlers).forEach(([event, handler]) => {
      channel.unbind(event, handler);
    });

    client.unsubscribe(channelName);
  };
};
