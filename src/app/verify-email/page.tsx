import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { CustomerShell } from "@/components/commerce/CustomerShell";
import { EmailOtpForm } from "@/components/auth/EmailOtpForm";

export const metadata: Metadata = {
  title: "تأكيد البريد الإلكتروني — ALI STORE",
  description: "أكد بريدك الإلكتروني لإكمال المصادقة في ALI STORE.",
};

export default function VerifyEmailPage() {
  return (
    <CustomerShell>
      <section className="bg-background">
        <div className="mx-auto flex max-w-[1600px] justify-center px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
          <div className="w-full max-w-md">
            <div className="inline-flex items-center gap-2 rounded-sm bg-primary-50 px-3 py-1.5 text-label font-medium text-brand">
              <ShieldCheck className="h-3.5 w-3.5" />
              ALI STORE
            </div>

            <h1 className="mt-6 text-h1 font-bold tracking-tight text-foreground">
              تأكيد البريد الإلكتروني
            </h1>

            <p className="mt-2 text-body text-muted-foreground">
              أدخل الرمز الذي أرسلناه إلى بريدك لإكمال عملية المصادقة.
            </p>

            <div className="mt-8">
              <EmailOtpForm />
            </div>

            <p className="mt-8 text-center text-body-sm text-muted-foreground">
              تريد البدء من جديد؟{" "}
              <Link
                href="/login"
                className="font-medium text-brand hover:text-brand-hover"
              >
                العودة لتسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </section>
    </CustomerShell>
  );
}
