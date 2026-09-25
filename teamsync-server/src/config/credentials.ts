import dotenv from "dotenv";
import { SignOptions } from "jsonwebtoken";
dotenv.config();

export const credentials = {
  database_url: process.env.DATABASE_URL,
  client_url: process.env.CLIENT_URL,
  port: process.env.PORT,
  email_user: process.env.EMAIL_USER,
  email_pass: process.env.EMAIL_PASS,
  redis_user: process.env.REDIS_USER,
  redis_password: process.env.REDIS_PASSWORD,
  redis_host: process.env.REDIS_HOST,
  redis_port: process.env.REDIS_PORT,
  google_client_id: process.env.GOOGLE_CLIENT_ID,
  google_client_secret: process.env.GOOGLE_CLIENT_SECRET,
  google_client_callback_url: process.env.GOOGLE_CALLBACK_URL,
  jwt_refresh_token_secret: process.env.JWT_REFRESH_TOKEN_SECRET as string,
  jwt_access_token_secret: process.env.JWT_ACCESS_TOKEN_SECRET as string,
  jwt_refresh_token_expires: process.env
    .JWT_REFRESH_TOKEN_EXPIRES as SignOptions["expiresIn"],
  jwt_access_token_expires: process.env
    .JWT_ACCESS_TOKEN_EXPIRES as SignOptions["expiresIn"],
  stripe_secret_key: process.env.STRIPE_SECRET_KEY,
  gemini_api_key: process.env.GEMINI_API_KEY,
  groq_api_key: process.env.GROQ_API_KEY,
  node_env: process.env.NODE_ENV,
  pusher_app_id: process.env.PUSHER_APP_ID,
  pusher_key: process.env.PUSHER_KEY,
  pusher_secret: process.env.PUSHER_SECRET,
  pusher_cluster: process.env.PUSHER_CLUSTER,
};
