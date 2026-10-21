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
}): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/register/", payload);
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

export async function verifyPasswordResetOtp(
  phone_number: string,
  otp: string
): Promise<{ reset_token: string }> {
  const { data } = await apiClient.post("/auth/forgot-password/verify-otp/", { phone_number, otp });
  return data;
}

export async function resetPasswordWithToken(payload: {
  reset_token: string;
  new_password: string;
  confirm_password: string;
}): Promise<{ detail: string }> {
  const { data } = await apiClient.post("/auth/forgot-password/reset/", payload);
  return data;
}
