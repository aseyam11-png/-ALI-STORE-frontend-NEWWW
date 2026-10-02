import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const BACKEND_URL =
  process.env.BACKEND_API_INTERNAL_URL ?? "http://localhost:8080";

async function hasAdminSession() {
  const cookieHeader = (await cookies()).toString();
  const response = await fetch(
    BACKEND_URL + "/api/v1/auth/session",
    {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    },
  );

  if (!response.ok) return false;

  const payload = await response.json();
  return payload?.data?.role === "ROLE_ADMIN";
}

export default async function SystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await hasAdminSession())) {
    redirect("/login?next=/system");
  }

  return children;
}
