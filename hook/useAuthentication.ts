"use client";

import { useState } from "react";
import { usePageNavigator } from "./navigator";
import toast from "react-hot-toast";
import {
  formatError,
  getUserTimezone,
  readCookie,
  removeCookie,
  setCookie,
} from "@/lib/helpers";
import { authActions } from "@/lib/api/actions/auth-actions/auth";

export const useAuthentication = () => {
  const { navigator } = usePageNavigator();
  const [isVing, setIsVing] = useState({
    verify: false,
    resend: false,
    otp: "",
    error: "",
  });

  const usr = process.env.NEXT_PUBLIC_USER_COOKIE!;
  const tok = process.env.NEXT_PUBLIC_TOKEN_COOKIE!;
  const OTP_STRING = "otp";
  const IS_OTP = "isOtp";
  const resetOtp = sessionStorage.getItem(OTP_STRING);
  const userInfo = readCookie(usr);

  // console.log(userInfo);

  // console.log(usr);
  const handleLogout = () => {
    removeCookie(tok);
    navigator.navigate("/login", "replace");
  };

  const handleEmailVerification = async (otp: string) => {
    setIsVing((vy) => ({
      ...vy,
      verify: true,
      error: "",
    }));
    try {
      const isOtp = sessionStorage.getItem(IS_OTP);

      const isRest = Boolean(isOtp);

      if (isRest) {
        // setCookie();
        const res = await authActions.resetVerifyEmail({
          email: userInfo?.email,
          otp: otp.trim(),
        });
        sessionStorage.setItem(OTP_STRING, otp);
        navigator.navigate("/resetPassword", "replace");
        toast.success(res?.message || "Successfully verified otp");

        return;
      }
      const res = await authActions.verifyEmail({
        email: userInfo?.email,
        otp: otp.trim(),
      });

      // console.log(res);

      const token = process.env.NEXT_PUBLIC_TOKEN_COOKIE!;
      toast.success(res?.message || "Successfully verified otp");

      removeCookie(usr);
      await setCookie(token, JSON.stringify(res?.accessToken));

      const plan = res?.data?.subscription;
      if (
        plan?.planId ||
        plan?.equipmentAgeCategory.toLowerCase().includes("unknown")
      ) {
        navigator.navigate("/dashboard", "replace");
      }

      navigator.navigate("/pricing", "replace");
    } catch (error: any) {
      const errMsg = formatError(error);
      console.error("Otp error", error);
      toast.error(errMsg);
      setIsVing((vy) => ({
        ...vy,
        error: errMsg,
      }));
    } finally {
      setIsVing((vy) => ({
        ...vy,
        verify: false,
      }));
    }
  };
  // const handleResetEmailVerification = async (otp: string) => {
  //   setIsVing((vy) => ({
  //     ...vy,
  //     verify: true,
  //     error: "",
  //   }));
  //   try {
  //     const isOtp = sessionStorage.getItem(IS_OTP);

  //     const isRest = Boolean(isOtp);
  //     const res = await authActions.verifyEmail({
  //       email: userInfo?.email,
  //       otp: otp.trim(),
  //     });

  //     // console.log(res);

  //     const token = process.env.NEXT_PUBLIC_TOKEN_COOKIE!;
  //     toast.success(res?.message || "Successfully verified otp");

  //     if (isRest) {
  //       // setCookie();
  //       sessionStorage.setItem(OTP_STRING, otp);
  //       navigator.navigate("/resetPassword", "replace");
  //       return;
  //     }

  //     navigator.navigate("/pricing", "replace");

  //     removeCookie(usr);
  //     setCookie(token, JSON.stringify(res?.accessToken));
  //   } catch (error: any) {
  //     const errMsg = formatError(error);
  //     console.error("Otp error", error);
  //     toast.error(errMsg);
  //     setIsVing((vy) => ({
  //       ...vy,
  //       error: errMsg,
  //     }));
  //   } finally {
  //     setIsVing((vy) => ({
  //       ...vy,
  //       verify: false,
  //     }));
  //   }
  // };

  const handleResendCode = async (email?: string) => {
    setIsVing((vy) => ({
      ...vy,
      resend: true,
      error: "",
    }));
    try {
      toast.loading("Resending code to your email...");
      const res = await authActions.resendVerificationMail({
        email: email || userInfo?.email,
      });
      // console.log(res);
      toast.remove();

      toast.success(res?.message || "Successfully resent otp");
    } catch (error: any) {
      const errMsg = formatError(error);
      console.error("Otp error", error);
      toast.remove();

      toast.error(errMsg);
    } finally {
      setIsVing((vy) => ({
        ...vy,
        resend: false,
      }));
    }
  };

  const handleForgotPassword = async (data: { email: string }) => {
    setIsVing((vy) => ({
      ...vy,
      verify: true,
    }));
    try {
      const res = await authActions.forgotPassword(data);

      toast.success(res?.message || "Reset Otp sent successfully");

      navigator.navigate("/otp", "replace");
      setCookie(
        usr,
        JSON.stringify({
          email: data?.email,
        })
      );

      sessionStorage.setItem(IS_OTP, "true");
    } catch (error) {
      const errMsg = formatError(error);
      console.error("Otp error", error);
      toast.remove();

      toast.error(errMsg);
    } finally {
      setIsVing((vy) => ({
        ...vy,
        verify: false,
      }));
    }
  };
  const handleResetPassword = async (data: { password: string }) => {
    setIsVing((vy) => ({
      ...vy,
      verify: true,
    }));
    try {
      const email = userInfo?.email;
      const payload = {
        email,
        password: data?.password,
        otp: resetOtp,
      };
      const res = await authActions.resetPassword(payload);

      toast.success(res?.message || "Reset password successful");
      removeCookie(usr);
      sessionStorage.removeItem(OTP_STRING);
      sessionStorage.removeItem(IS_OTP);
      navigator.navigate("/login", "replace");
    } catch (error) {
      const errMsg = formatError(error);
      console.error("reset password error", error);
      toast.remove();

      toast.error(errMsg);
    } finally {
      setIsVing((vy) => ({
        ...vy,
        verify: false,
      }));
    }
  };

  const handleUserLogin = async (data: { email: string; password: string }) => {
    sessionStorage.removeItem(OTP_STRING);
    sessionStorage.removeItem(IS_OTP);
    readCookie(usr);
    setIsVing((vy) => ({
      ...vy,
      verify: true,
    }));
    try {
      const timezone = getUserTimezone();

      const payload = {
        ...data,
        currentTimezone: timezone,
      };
      const res = await authActions.loginUser(payload);

      toast.success(res?.message || "Login successful");

      // console.log(res);

      const accessToken = res?.accessToken;

      await setCookie(tok, accessToken);
      const plan = res?.data?.subscription;
      if (
        plan?.planId ||
        plan?.equipmentAgeCategory.toLowerCase().includes("unknown")
      ) {
        navigator.navigate("/dashboard", "replace");
      } else {
        navigator.navigate("/pricing", "replace");
      }
    } catch (error) {
      const errMsg = formatError(error);
      console.error("Login error", error);
      toast.error(errMsg);

      if (errMsg === "The email is not verified") {
        handleResendCode(data?.email);
        navigator.navigate("/otp", "push");
        setCookie(
          usr,
          JSON.stringify({
            email: data?.email,
          })
        );
      }
    } finally {
      setIsVing((vy) => ({
        ...vy,
        verify: false,
      }));
    }
  };

  return {
    verifying: isVing.verify,
    resending: isVing.resend,
    handleEmailVerification,
    email: userInfo?.email,
    handleResendCode,
    otpEror: isVing.error,
    handleLogout,
    handleUserLogin,
    handleForgotPassword,
    handleResetPassword,
  };
};
