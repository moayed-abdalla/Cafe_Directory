import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth/admin-session";
import { getAdminData } from "@/lib/admin-data";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/login");
  }

  const { cafes, categoryPicks, yetToTry } = await getAdminData();

  return (
    <AdminDashboard
      cafes={cafes}
      categoryPicks={categoryPicks}
      yetToTry={yetToTry}
    />
  );
}
