import { http, withAuth } from "@/lib/api/axios/http";

const url = "/customer";

export const notifications = {
  submitBrowserToken: async (payload: {
    deviceToken: string;
    deviceType: "WEB";
  }) => {
    try {
      const response = await http.post(
        `${url}/me/devices`,
        payload,
        withAuth()
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

  getUserNotification: async ({
    limit,
    page,
    status,
    read,
  }: {
    limit: number;
    page: number;
    status?: "unseen" | "seen";
    read?: boolean;
  }) => {
    try {
      const params = new URLSearchParams();

      // Required
      params.append("page", String(page));
      params.append("limit", String(limit));

      // Optional
      if (status) params.append("date", String(status));
      if (read) params.append("status", String(read));

      const response = await http.get(
        `${url}/notifications?${params.toString()}`,
        withAuth()
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

  readNotification: async (id: string) => {
    try {
      const response = await http.post(
        `${url}/notifications/${id}`,
        null,
        withAuth()
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

  readAllNotification: async () => {
    try {
      const response = await http.post(
        `${url}/notifications/mark-all-read`,
        null,
        withAuth()
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

  getBadgeCounts: async () => {
    try {
      const response = await http.get(
        `${url}/notifications/alerts`,
        withAuth()
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
};
