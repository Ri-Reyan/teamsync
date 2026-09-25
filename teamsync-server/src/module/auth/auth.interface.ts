export type RegisterPayloadType = {
  username: string;
  email: string;
  password: string;
  role: string;
};

export type VerifyOtpPayloadType = {
  email: string;
  otp: string;
};

export type LoginPayloadType = {
  email: string;
  password: string;
};
