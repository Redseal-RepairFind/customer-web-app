import { http, withAuth } from "@/lib/api/axios/http";
import { SubscriptionType } from "@/utils/types";

const url = "/customer";

export const dashboard = {
  getTransactionSummary: async () => {
    try {
      const response = await http.get(
        `${url}/transactions/summary`,
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
