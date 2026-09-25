import { createClient } from "redis";
import { credentials } from "../config/credentials.js";

const redisClient = createClient({
  username: credentials.redis_user || "default",
  password: credentials.redis_password,
  socket: {
    host: credentials.redis_host,
    port: Number(credentials.redis_port),
    reconnectStrategy: (retries) => {
      return Math.min(retries * 100, 3000);
    },
  },
});

// Event Listeners for Better Debugging
redisClient.on("connect", () => {
  console.log("◇ [Redis]: Connected successfully");
});

redisClient.on("error", (err) => {
  console.error("❌ [Redis Error]:", err);
});

// Auto-connect function
export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

export default redisClient;
