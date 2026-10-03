"use client";

import Link from "next/link";
import { MessageSquareText, ShieldCheck } from "lucide-react";

import { AdminShell } from "@/components/layout/AdminShell";

export default function AdminReviewsPage() {
  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F8FAFC]">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-500">
              Administration
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-[#0F172A]">
              Review moderation
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Moderation requires a server-side admin review contract. The current backend exposes customer review read/write endpoints only.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8">
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm">
                <MessageSquareText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-amber-900">
                  Moderation API is not available
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-amber-800">
                  تم إيقاف بيانات المراجعات التجريبية وتغييرات الحالة المحلية. لن يتم عرض أو تعديل مراجعات مزيفة من الواجهة.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-amber-200 bg-white p-4">
                <p className="text-xs font-black text-slate-900">
                  Customer reviews
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Live product reviews are available on product detail pages.
                </p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-slate-500" />
                  <p className="text-xs font-black text-slate-900">
                    Admin moderation
                  </p>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Waiting for backend endpoints for listing and changing moderation status.
                </p>
              </div>
            </div>

            <Link
              href="/admin/products"
              className="mt-6 inline-flex h-11 items-center rounded-xl bg-[#2563EB] px-5 text-sm font-black text-white"
            >
              Return to product management
            </Link>
          </section>
        </div>
      </main>
    </AdminShell>
  );
}
