import { http, withAuth } from "@/lib/api/axios/http";
import { RepaairsGetParams, RepairType } from "@/utils/types";
import { boolean } from "zod";

const url = "/customer";

export const repairActions = {
  createRepairRequest: async (data: RepairType) => {
    try {
      const response = await http.post(`${url}/jobs/repairs`, data, withAuth());

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
  fetchRepairRequest: async ({
    page,
    limit,
    type,
    date,
    status,
    startDate,
    endDate,
    sorting,
    contractorId,
  }: RepaairsGetParams) => {
    try {
      const params = new URLSearchParams();

      // Required
      params.append("page", String(page));
      params.append("limit", String(limit));
      params.append("type", type || "REPAIR");

      // Optional
      if (date) params.append("date", String(date));
      if (status) params.append("status", status);
      if (startDate) params.append("startDate", String(startDate));
      if (endDate) params.append("endDate", String(endDate));
      if (sorting) params.append("sorting", sorting);
      if (contractorId) params.append("contractorId", contractorId);

      const response = await http.get(
        `${url}/jobs?${params.toString()}`,
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
  fetchPaymentMethods: async () => {
    try {
      const response = await http.get(
        `${url}/stripe/payment-methods`,
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

  acceptQuotes: async ({
    jobId,
    quotationsId,
  }: {
    jobId: string;
    quotationsId: string;
  }) => {
    try {
      const response = await http.post(
        `${url}/jobs/${jobId}/quotations/${quotationsId}/accept`,
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
  rejectQuotes: async ({
    jobId,
    quotationsId,
  }: {
    jobId: string;
    quotationsId: string;
  }) => {
    try {
      const response = await http.post(
        `${url}/jobs/${jobId}/quotations/${quotationsId}/decline`,
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
  payQuotes: async ({
    jobId,
    quotationId,
    paymentMethodId,
  }: {
    quotationId: string;
    paymentMethodId: string;
    jobId: string;
  }) => {
    try {
      const response = await http.post(
        `${url}/jobs/${jobId}/pay`,
        {
          quotationId,
          paymentMethodId,
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

  rateRepairs: async ({
    jobId,
    reviews,
  }: {
    jobId: string;
    reviews: {
      review: string;
      rattings: { item: string; rating: number };
    };
    favouriteContractor?: boolean;
  }) => {
    try {
      const response = await http.post(
        `${url}/bookings/${jobId}/review`,
        reviews,
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
  disputeRepairs: async ({
    jobId,
    description,
  }: {
    jobId: string;
    description: string;
  }) => {
    try {
      const response = await http.post(
        `${url}/bookings/${jobId}/dispute`,
        {
          description,
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
};
