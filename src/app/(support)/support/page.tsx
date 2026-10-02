import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function SupportPage() {
  const hasSession = Boolean((await cookies()).get("ali_store_session")?.value);

  redirect(
    hasSession
      ? "/buyer/support"
      : "/login?next=/buyer/support",
  );
}
