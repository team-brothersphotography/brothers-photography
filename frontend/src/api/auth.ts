import { apiClient } from "./client";
import type { User } from "../types";

export interface AuthResponse {
  token: string;
  user: User;
}

export async function registerCustomer(payload: {
  full_name: string;
  phone_number: string;
  password: string;
  confirm_password: string;
  security_answers: SecurityAnswer[];
}): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/register/", payload);
  return data;
}


export interface GooglePrepareResponse {
  needs_phone: boolean;
  email?: string;
  full_name?: string;
  token?: string;
  user?: User;
}

export async function prepareGoogleSignIn(
  credential: string
): Promise<GooglePrepareResponse> {
  const { data } = await apiClient.post<GooglePrepareResponse>(
    "/auth/google/prepare/",
    { credential }
  );
  return data;
}

export async function completeGoogleSignUp(payload: {
  credential: string;
  phone_number: string;
}): Promise<{ needs_phone: false; token: string; user: User }> {
  const { data } = await apiClient.post(
    "/auth/google/complete/",
    payload
  );
  return data;
}


export async function login(payload: {
  identifier: string; // phone number for customers, email for the owner
  password: string;
}): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login/", payload);
  return data;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout/");
}

export async function fetchProfile(): Promise<User> {
  const { data } = await apiClient.get<User>("/auth/profile/");
  return data;
}

export async function changePassword(payload: {
  old_password: string;
  new_password: string;
  confirm_new_password: string;
}): Promise<{ detail: string }> {
  const { data } = await apiClient.post("/auth/change-password/", payload);
  return data;
}

// ---------- Forgot password / OTP recovery ----------

export async function requestPasswordResetOtp(
  phone_number: string
): Promise<{ detail: string; dev_otp?: string }> {
  const { data } = await apiClient.post("/auth/forgot-password/request-otp/", { phone_number });
  return data;
}


export const SECURITY_QUESTIONS = [
  { key: "first_school", text: "What was the name of your first school?" },
  {
    key: "childhood_friend",
    text: "What was the first name of your childhood best friend?",
  },
  {
    key: "favorite_teacher",
    text: "What was the surname of your favorite teacher?",
  },
  { key: "first_pet", text: "What was the name of your first pet?" },
  { key: "favorite_city", text: "What is the name of your favorite city?" },
  {
    key: "favorite_book",
    text: "What was the title of your favorite childhood book?",
  },
  {
    key: "childhood_nickname",
    text: "What was your childhood nickname?",
  },
] as const;

export type SecurityAnswer = {
  question_key: (typeof SECURITY_QUESTIONS)[number]["key"];
  answer: string;
};

export async function getPasswordRecoveryQuestions(
  phone_number: string
): Promise<{ questions: typeof SECURITY_QUESTIONS | []; recovery_available: boolean }> {
  const { data } = await apiClient.post(
    "/auth/forgot-password/questions/",
    { phone_number }
  );
  return data;
}

export async function verifyPasswordRecoveryAnswers(payload: {
  phone_number: string;
  security_answers: SecurityAnswer[];
}): Promise<{ reset_token: string }> {
  const { data } = await apiClient.post(
    "/auth/forgot-password/verify-answers/",
    payload
  );
  return data;
}

export async function resetPasswordWithToken(payload: {
  reset_token: string;
  new_password: string;
  confirm_password: string;
}): Promise<{ detail: string }> {
  const { data } = await apiClient.post(
    "/auth/forgot-password/reset/",
    payload
  );
  return data;
}
