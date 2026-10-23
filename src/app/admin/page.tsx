import { redirect } from "next/navigation";

export default function AdminPage() {
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "https://bas-advertising-admin.vercel.app";
  redirect(adminUrl);
}
