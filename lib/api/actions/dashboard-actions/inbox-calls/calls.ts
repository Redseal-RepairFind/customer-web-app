import { http, withAuth } from "@/lib/api/axios/http";
const url = "/customer/voicecall";

type AgoraType = {
  channelName: string;
  role: string;
};

type MakeCallType = {
  toUser: string;
  toUserType: string;
};

type EndCall = {
  event: "missed" | "declined" | "ended";
  id: string;
};
// type data = AgoraType;

export const callApi = {
  createAgoraToken: async (data: AgoraType) => {
    try {
      const response = await http.post(`${url}/agora-rtc}`, data, withAuth());

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
  startCall: async (data: MakeCallType) => {
    try {
      const response = await http.post(`${url}}`, data, withAuth());

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
  endCall: async (data: EndCall) => {
    try {
      const response = await http.post(
        `${url}/${data?.id}/end`,
        {
          event: data?.event,
        },
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
  getSingleCall: async (id: string) => {
    try {
      const response = await http.get(
        `${url}/${id}`,

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
  getLastCall: async () => {
    try {
      const response = await http.get(`${url}/lastcall`, withAuth());
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
