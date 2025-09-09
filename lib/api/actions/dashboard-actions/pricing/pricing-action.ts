import { http, withAuth } from "@/lib/api/axios/http";
import { SubscriptionType } from "@/utils/types";

const url = "/customer";
export const pricingActions = {
  getMe: async () => {
    try {
      const response = await http.get(`${url}/me`, withAuth());

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

  getSubscriptionPlan: async () => {
    try {
      const response = await http.get(`${url}/subscription-plans`, withAuth());

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

  getUserSubscriptions: async ({
    page,
    limit,
    planType,
    search,
  }: {
    page: number;
    limit: number;
    planType?: string;
    search?: string;
  }) => {
    try {
      const response = await http.get(
        `${url}/subscriptions?page=${page}&limit=${limit}${
          planType ? `&planType=${planType}` : ""
        }${search ? `&search=${search}` : ""}`,
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
  checkoutSubscriptionPlan: async (payload: SubscriptionType) => {
    try {
      const response = await http.post(
        `${url}/subscriptions/stripe-checkout`,
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
};
