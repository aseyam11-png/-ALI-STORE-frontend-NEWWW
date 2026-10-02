import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const BACKEND_URL =
  process.env.BACKEND_API_INTERNAL_URL ?? "http://localhost:8080";

async function getAdminSession() {
  const cookieHeader = (await cookies()).toString();
  const response = await fetch(
    BACKEND_URL + "/api/v1/auth/session",
    {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    },
  );

  if (!response.ok) return null;

  const payload = await response.json();
  const user = payload?.data;
  return user?.role === "ROLE_ADMIN" ? user : null;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminSession();

  if (!user) {
    redirect("/login?next=/admin");
  }

  return children;
}
