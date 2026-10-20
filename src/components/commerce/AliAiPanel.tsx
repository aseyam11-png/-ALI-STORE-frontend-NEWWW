"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";
import { ArrowLeft, Loader2, Search, ShieldCheck, Sparkles, WandSparkles } from "lucide-react";

import {
  askAli,
  discoverWithAli,
  type AiCatalogProduct,
} from "@/features/ai/services/ask-ali.service";
import { formatCurrency } from "@/features/localization/services/currency.service";

type AliAiPanelProps = {
  mode?: "ask" | "discover";
  className?: string;
};

const QUICK_PROMPTS = [
  "ساعة أنيقة تناسب الاستخدام اليومي",
  "حقيبة عملية بلون محايد",
  "حذاء مريح للإطلالات اليومية",
];

function formatAiProductPrice(product: AiCatalogProduct): string {
  const amount = Number(product.price);
  const currency =
    typeof product.currency === "string" ? product.currency.trim().toUpperCase() : "";

  if (!Number.isFinite(amount) || amount < 0 || !/^[A-Z]{3}$/.test(currency)) {
    return "السعر غير متاح";
  }

  try {
    return formatCurrency(amount, currency);
  } catch {
    return "السعر غير متاح";
  }
}

function AiProductCard({ product }: { product: AiCatalogProduct }) {
  const image = product.primaryImageUrl ?? product.images?.[0];
  const quantity = Number(product.availableQuantity ?? 0);
  const inStock = product.availability === "IN_STOCK" && quantity > 0;

  return (
    <article className="group overflow-hidden rounded-2xl border border-neutral-200 bg-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-floating">
      <Link
        href={("/shop/products/" + encodeURIComponent(String(product.id))) as Route}
        className="block outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
      >
        <div className="relative aspect-square overflow-hidden bg-neutral-50">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
              className="object-contain p-5 transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-300">
              <Search className="h-8 w-8" aria-hidden="true" />
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 truncate text-caption font-medium text-brand">
              {product.brandName || "ALI STORE"}
            </span>
            <span className={"shrink-0 rounded-full px-2 py-1 text-label font-medium " + (inStock ? "bg-success-surface text-success-700" : "bg-neutral-100 text-neutral-500")}>
              {inStock ? "متوفر" : "غير متوفر"}
            </span>
          </div>
          <h3 className="mt-2 line-clamp-2 min-h-12 text-body-sm font-medium leading-6 text-foreground group-hover:text-brand">
            {product.name}
          </h3>
          <p className="mt-1 truncate text-caption text-muted-foreground">
            {[product.categoryName].filter(Boolean).join(" · ")}
          </p>
          <p className="mt-3 text-h4 text-brand-ink">
            {formatAiProductPrice(product)}
          </p>
        </div>
      </Link>
    </article>
  );
}

export function AliAiPanel({ mode = "discover", className = "" }: AliAiPanelProps) {
  const isAsk = mode === "ask";
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [products, setProducts] = useState<AiCatalogProduct[]>([]);
  const [suggestedQuery, setSuggestedQuery] = useState("");
  const [aiGenerated, setAiGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (value = prompt) => {
    const clean = value.trim();
    if (!clean || loading) return;
    setPrompt(clean);
    setLoading(true);
    setError("");

    try {
      const response = isAsk ? await askAli(clean) : await discoverWithAli(clean);
      setAnswer(response.answer);
      setProducts(response.products);
      setSuggestedQuery(response.suggestedQuery);
      setAiGenerated(response.aiGenerated);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "خدمة Ask Ali غير متاحة حاليًا. حاول مرة أخرى لاحقًا.");
      setAnswer("");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={"bg-background " + className}>
      <div className="container-shell py-14 sm:py-16 lg:py-20">
        <div className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-surface shadow-raised">
          <div className="border-b border-white/10 bg-gradient-to-br from-ink-950 to-ink-900 px-5 py-8 text-white sm:px-8 sm:py-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-label font-medium text-white/80">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  AI Discovery
                </div>
                <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                  {isAsk ? "اسأل علي قبل أن تشتري" : "دع علي يساعدك تكتشف الأنسب"}
                </h2>
                <p className="mt-2 max-w-xl text-body-sm leading-7 text-white/65">
                  {isAsk
                    ? "صف ما تبحث عنه، وسأستخدم المنتجات الموجودة فعليًا في كتالوج ALI STORE فقط."
                    : "حوّل رغبتك بجملة واحدة إلى منتجات حقيقية من الكتالوج، مع الحفاظ على السعر والتوفر كما يرسلهما النظام."}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 text-caption text-white/55">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                معلومات الكتالوج فقط
              </div>
            </div>

            <form
              className="mt-7 flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-md sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                void submit();
              }}
            >
              <input
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                maxLength={1200}
                type="text"
                placeholder="مثال: لابتوب للدراسة بسعر مناسب ومتوفر الآن"
                aria-label="اسأل علي"
                className="min-h-12 min-w-0 flex-1 rounded-xl border border-transparent bg-white px-4 text-body-sm text-foreground outline-none placeholder:text-neutral-400 focus:border-primary-200 focus:ring-4 focus:ring-primary-100"
              />
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-body-sm font-medium text-white transition-all hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-neutral-400"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <WandSparkles className="h-4 w-4" aria-hidden="true" />}
                {loading ? "جارٍ التحليل…" : isAsk ? "اسأل علي" : "اكتشف الآن"}
              </button>
            </form>

            {!answer && !loading ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setPrompt(item);
                      void submit(item);
                    }}
                    className="rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-caption font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {item}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {error ? (
            <div role="alert" className="m-5 rounded-2xl border border-warning-100 bg-warning-surface p-4 sm:m-7">
              <p className="text-body-sm font-medium text-warning-800">{error}</p>
              <Link href="/shop/products" className="mt-3 inline-flex items-center gap-2 text-caption font-medium text-brand hover:underline">
                افتح الكتالوج مباشرة
                <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
              </Link>
            </div>
          ) : null}

          {answer ? (
            <div className="p-5 sm:p-7">
              <div className="rounded-2xl border border-primary-100 bg-primary-50/60 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-label font-medium text-brand">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    {aiGenerated ? "رد مدعوم بالـAI" : "مساعدة الكتالوج"}
                  </span>
                  {products.length > 0 ? <span className="text-label text-muted-foreground">{products.length} منتجات مقترحة</span> : null}
                </div>
                <p className="mt-3 max-w-4xl whitespace-pre-wrap text-body leading-8 text-foreground">
                  {answer}
                </p>
                {suggestedQuery ? (
                  <Link
                    href={("/shop/products?q=" + encodeURIComponent(suggestedQuery)) as Route}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-primary-100 bg-surface px-3.5 py-2 text-caption font-medium text-brand transition hover:border-primary-200"
                  >
                    مشاهدة نتائج البحث المقترحة
                    <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
                  </Link>
                ) : null}
              </div>

              {products.length > 0 ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => <AiProductCard key={product.id} product={product} />)}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-neutral-200 p-8 text-center">
                  <p className="text-body-sm font-medium text-neutral-700">لا توجد منتجات مطابقة في الكتالوج الحالي.</p>
                  <Link href="/shop/products" className="mt-3 inline-flex items-center gap-2 text-caption font-medium text-brand hover:underline">
                    العودة للبحث العادي
                    <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
                  </Link>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {!isAsk ? (
          <div className="mt-5 flex justify-end">
            <Link href="/shop/ask-ali" className="inline-flex items-center gap-2 text-caption font-medium text-brand hover:underline">
              فتح Ask Ali بالكامل
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}