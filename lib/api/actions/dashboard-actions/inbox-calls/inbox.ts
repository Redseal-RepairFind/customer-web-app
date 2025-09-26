import { http, withAuth } from "@/lib/api/axios/http";
const url = "/customer/conversations";

export const inbox = {
  getConversations: async ({
    page,
    limit,
    sort,
    jobId,
  }: {
    page: number;
    limit: number;
    sort?: "createdAt" | "-createdAt";
    jobId?: string;
  }) => {
    const params = new URLSearchParams();

    params.append("page", String(page));
    params.append("limit", String(limit));

    if (sort) params.append("sort", String(sort));
    if (jobId) params.append("jobId", jobId);
    try {
      const response = await http.get(
        `${url}?${params.toString()}`,
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
  getSingleConversation: async (id: string) => {
    try {
      const response = await http.get(`${url}/${id}`, withAuth());

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
  getSingleConversationMessages: async ({
    page,
    limit,
    sort,
    id,
  }: {
    page: number;
    limit: number;
    id: string;
    sort?: string;
  }) => {
    const params = new URLSearchParams();

    params.append("page", String(page));
    params.append("limit", String(limit));

    if (sort) params.append("sort", String(sort));
    try {
      const response = await http.get(
        `${url}/${id}/messages?${params.toString()}`,
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
  getMessageTemplates: async (id: string) => {
    try {
      const response = await http.get(
        `${url}/${id}/quick-messages`,
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
  sendMessages: async ({
    id,
    message,
  }: {
    id: string;
    message: {
      type: "TEXT" | "MEDIA";
      message?: string;
      media?: {
        url: string;
        duration?: number;
        metrics?: string[];
      }[];
    };
  }) => {
    try {
      const response = await http.post(
        `${url}/${id}/messages`,
        message,
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
  editMessages: async ({
    id,
    message,
    messageId,
  }: {
    id: string;
    message: {
      type: "TEXT" | "MEDIA";
      message?: string;
      media?: {
        url: string;
        duration?: number;
        metrics?: string[];
      }[];
    };
    messageId: string;
  }) => {
    try {
      const response = await http.patch(
        `${url}/${id}/messages/${messageId}`,
        message,
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
  readAllMessages: async ({
    id,
    message,
  }: {
    id: string;
    message?: {
      type: "TEXT" | "MEDIA";
      message?: string;
      media?: {
        url: string;
        duration?: number;
        metrics?: string[];
      }[];
    };
  }) => {
    try {
      const response = await http.patch(
        `${url}/${id}/mark-all-read}`,
        message,
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
