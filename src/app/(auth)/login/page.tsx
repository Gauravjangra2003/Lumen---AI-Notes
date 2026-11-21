import type { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <Link href="/" className="text-2xl font-semibold tracking-tight">
            {siteConfig.name}
          </Link>
          <p className="text-sm text-muted-foreground">Sign in to your second brain</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
