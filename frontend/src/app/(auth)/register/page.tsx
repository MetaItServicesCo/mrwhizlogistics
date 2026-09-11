import AuthForm from "@/components/auth/AuthForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | Terminal",
  robots: { index: false },
};

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
