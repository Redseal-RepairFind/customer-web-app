import Auth_Layout from "@/components/ui/auth-layout";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return <Auth_Layout>{children}</Auth_Layout>;
};

export default AuthLayout;
