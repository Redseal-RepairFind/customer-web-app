import { http, withAuth } from "@/lib/api/axios/http";

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
  getSkillTypes: async () => {
    try {
      const response = await http.get(`/common/skills`, withAuth());

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
  getCompanyInspectionAvailability: async ({
    year,
    month,
  }: {
    year?: string;
    month?: number;
  }) => {
    const params = new URLSearchParams();
    if (year) params.append("year", year);
    if (month) params.append("month", month.toString());
    try {
      const res = await http.get(
        `/customer/inspection-schedule?${params.toString()}`,
        withAuth()
      );

      return res?.data;
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
