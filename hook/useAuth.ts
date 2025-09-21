"use client";

import { formatError, setCookie } from "@/lib/helpers";
import { ExtraInfo, SignupType } from "@/utils/types";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupValues } from "@/lib/signup-schema";
import { countriesPhoneCodes } from "@/lib/countries";
import { authActions } from "@/lib/api/actions/auth-actions/auth";
import { usePageNavigator } from "./navigator";
import { useSearchParams } from "next/navigation";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const initCnt = countriesPhoneCodes.find((cnt) => cnt.name === "Canada");
  const { navigator } = usePageNavigator();
  const params = useSearchParams();
  const field = params.get("type");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    setValue, // use this for dropdowns/place-autocomplete to write into the form
    watch,
    reset,
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      acctType: "",
      businessName: "",
      firstName: "",
      lastName: "",
      email: "",
      number: "", // local phone part
      homeAddress: "",
      eqAge: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [extraInfo, setExtraInfo] = useState<ExtraInfo>({
    acceptTerms: false,
    subscriptionType: field as "BUSINESS",
    equipmentAgeCategory: "",
    coverageAddress: {
      latitude: "",
      longitude: "",
      address: "",
      city: "",
      country: "",
      state: "",
    },
    country: initCnt,
  });

  // console.log(extraInfo);

  const [extraError, setExtraError] = useState({
    businessName: "",
    acctType: "",
    homeAddress: "",
    eqAge: "",
  });

  const handleSetExtraInfo = (
    name:
      | "acceptTerms"
      | "subscriptionType"
      | "equipmentAgeCategory"
      | "coverageAddress"
      | "country",
    item: any
  ) => {
    setExtraInfo((ext) => ({ ...ext, [name]: item }));
  };
  const handleExtraErrors = (
    name: "businessName" | "acctType" | "homeAddress" | "eqAge" | "acceptTerms",
    item: string
  ) => {
    setExtraError((ext) => ({ ...ext, [name]: item }));
  };

  const handleSignup = async (data: SignupValues) => {
    sessionStorage.removeItem("isOtp");

    // console.log(extraInfo);
    if (data?.acctType === "BUSINESS" && !data.businessName) {
      const msg = "Please provide a business name";
      handleExtraErrors("businessName", msg);

      toast.error(msg);
      return;
    }
    if (!extraInfo.coverageAddress.address) {
      const msg = "Please provide an address";
      handleExtraErrors("homeAddress", msg);
      handleExtraErrors("businessName", "");

      toast.error(msg);
      return;
    }
    // if (!extraInfo.equipmentAgeCategory) {
    //   const msg = "Please select your equipment age range";
    //   handleExtraErrors("eqAge", msg);
    //   handleExtraErrors("homeAddress", "");

    //   toast.error(msg);
    //   return;
    // }
    if (!extraInfo.acceptTerms) {
      const msg = "Please accept our T&cs";
      handleExtraErrors("acceptTerms", msg);
      handleExtraErrors("eqAge", "");
      toast.error(msg);
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        subscriptionType: extraInfo.subscriptionType || "BUSINESS",
        equipmentAgeCategory: "1-4",
        coverageAddress: extraInfo.coverageAddress,
        email: data.email,
        firstName: data?.firstName,
        lastName: data?.lastName,
        password: data?.password,
        passwordConfirmation: data.confirmPassword,
        phoneNumber: {
          code: extraInfo?.country?.dial_code,
          number: data.number,
        },
        acceptTerms: extraInfo.acceptTerms,
        // ...(extraInfo?.subscriptionType === "BUSINESS"
        //   ? { businessName: data?.businessName }
        //   : null),
        businessName: data?.businessName,
      };

      // console.log(payload);

      const res = await authActions.signup(payload as SignupType);
      // reset();

      // console.log(res);

      const USR = process.env.NEXT_PUBLIC_USER_COOKIE!;

      setCookie(USR, JSON.stringify(res?.data));
      navigator.navigate("/otp", "replace");

      toast.success(res.message);
    } catch (error: any) {
      const errMsg = formatError(error);
      console.error("signup error", error);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    isValid,
    isLoading: isLoading || isSubmitting,
    setValue,
    watch,
    handleSignup,
    setExtraInfo,
    handleSetExtraInfo,
    initCnt,
    extraError,
  };
};
