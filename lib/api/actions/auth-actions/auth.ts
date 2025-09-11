import { SignupType } from "@/utils/types";
import { http, withAuth } from "../../axios/http";

const url = "/customer";
export const authActions = {
  signup: async (payload: SignupType) => {
    try {
      const response = await http.post(`${url}/signup`, payload);

      return response.data;
    } catch (error: any) {
      console.error(
        "Axios error:",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  verifyEmail: async (payload: { email: string; otp: string }) => {
    try {
      const response = await http.post(`${url}/email-verification`, payload);

      return response.data;
    } catch (error: any) {
      console.error(
        "Axios error:",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },
  resetVerifyEmail: async (payload: { email: string; otp: string }) => {
    try {
      const response = await http.post(
        `${url}/reset-password-verification`,
        payload
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Axios error:",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },
  resendVerificationMail: async (payload: { email: string }) => {
    try {
      const response = await http.post(
        `${url}/resend-email-verification`,
        payload
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "Axios error:",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },
  forgotPassword: async (payload: { email: string }) => {
    try {
      const response = await http.post(`${url}/forgot-password`, payload);

      return response.data;
    } catch (error: any) {
      console.error(
        "Axios error:",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },
  resetPassword: async (payload: {
    email: string;
    password: string;
    otp: string;
  }) => {
    try {
      const response = await http.post(`${url}/reset-password`, payload);

      return response.data;
    } catch (error: any) {
      console.error(
        "Axios error:",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },

  loginUser: async (payload: {
    email: string;
    password: string;
    currentTimezone: string;
  }) => {
    try {
      const response = await http.post(`${url}/login`, payload);

      return response.data;
    } catch (error: any) {
      console.error(
        "Axios error:",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },
};
