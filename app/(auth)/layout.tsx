import Auth_Layout from "@/components/ui/auth-layout";
import { isToken } from "@/utils/isAuth";
import { redirect } from "next/navigation";

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  const token = await isToken();

  if (token?.value) redirect("/dashboard");
  console.log(token);

  return <Auth_Layout>{children}</Auth_Layout>;
};

export default AuthLayout;
