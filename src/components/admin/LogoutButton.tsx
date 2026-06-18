"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg border border-cream-dark px-3 py-1.5 text-sm text-espresso/70 transition-colors hover:bg-cream-dark hover:text-espresso"
    >
      Sign out
    </button>
  );
}
