import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth/admin-session";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  const params = await searchParams;
  const redirectTo = params.from?.startsWith("/admin") ? params.from : "/admin";

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm rounded-2xl border border-cream-dark bg-white p-8 shadow-sm">
        <h1 className="mb-6 font-display text-2xl text-espresso">Admin sign in</h1>
        <LoginForm redirectTo={redirectTo} />
      </div>
    </div>
  );
}
