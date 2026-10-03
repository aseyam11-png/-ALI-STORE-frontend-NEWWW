"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles } from "lucide-react";

import type { RecommendationType } from "@/features/recommendations/types/recommendation.types";
import { getRecommendations } from "@/features/recommendations/services/recommendations.service";
import { RecommendationCard } from "./RecommendationCard";

interface RecommendationSectionProps {
  type: RecommendationType;
  title: string;
  description: string;
}

export function RecommendationSection({
  type,
  title,
  description,
}: RecommendationSectionProps) {
  const query = useQuery({
    queryKey: ["recommendations", type],
    queryFn: () => getRecommendations(type),
    staleTime: 60_000,
    retry: 1,
  });

  const products = query.data ?? [];

  if (query.isPending || query.isError || products.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-neutral-200 bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1.5 text-[10px] font-black text-brand">
            <Sparkles className="h-3.5 w-3.5" />
            Recommendations
          </div>

          <h2 className="mt-3 text-h3 font-bold text-foreground">
            {title}
          </h2>

          <p className="mt-1 text-body-sm leading-5 text-muted-foreground">
            {description}
          </p>
        </div>

        <Link
          href="/shop/products"
          className="inline-flex items-center gap-1 text-body-sm font-medium text-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
        >
          استكشف المزيد
          <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
        </Link>
      </div>

      <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
        {products.map((product) => (
          <RecommendationCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </section>
  );
}
