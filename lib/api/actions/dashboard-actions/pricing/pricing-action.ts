import { http, withAuth } from "@/lib/api/axios/http";
import { SubGetParams, SubscriptionType, UpgradeType } from "@/utils/types";

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
  getMe$patmentMethod: async ({
    include = "stripePaymentMethods",
  }: {
    include?: string;
  }) => {
    try {
      const response = await http.get(
        `${url}/me?include=${include}`,
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

  getSubscriptionPlan: async (planCategory: "RESIDENTIAL" | "BUSINESS") => {
    try {
      const response = await http.get(
        `${url}/subscription-plans?planCategory=${planCategory}`,
        withAuth()
      );

      return response?.data;
    } catch (error: any) {
      console.error(
        "Axios error:",
        error.response?.status,
        error.response?.data
      );
      throw error;
    }
  },
  getSingleSubscriptionPlan: async (planId: string) => {
    try {
      const response = await http.get(
        `${url}/subscription-plans/${planId}`,
        withAuth()
      );

      return response?.data;
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
  }: SubGetParams) => {
    try {
      const response = await http.get(
        `${url}/subscriptions?page=${page}&limit=${limit}${
          planType ? `&planType=${planType}` : ""
        }${search ? `&search=${search}` : ""}`,
        withAuth()
      );

      return response.data?.data;
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
  activateNewSubscriptionPlan: async (payload: SubscriptionType) => {
    try {
      const response = await http.post(
        `${url}/subscriptions/activate`,
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
  upgradeSubscriptionPlan: async (payload: UpgradeType) => {
    try {
      const response = await http.post(
        `${url}/subscriptions/upgrade`,
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
  cancelSubscriptionPlan: async (payload: { subscriptionId: string }) => {
    try {
      const response = await http.post(
        `${url}/subscriptions/cancel`,
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
  continuePlan: async (payload: { subscriptionId: string }) => {
    try {
      const response = await http.post(
        `${url}/subscriptions/continue`,
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
  reactivateSubscriptionPlan: async (payload: { subscriptionId: string }) => {
    try {
      const response = await http.post(
        `${url}/subscriptions/reactivate`,
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
  createBillingPortal: async () => {
    try {
      const response = await http.get(
        `${url}/subscriptions/create-customer-portal-session`,
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
