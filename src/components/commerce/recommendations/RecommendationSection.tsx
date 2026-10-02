"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import type {
  RecommendationProduct,
  RecommendationType,
} from "@/features/recommendations/types/recommendation.types";

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
  const [
    products,
    setProducts,
  ] = useState<
    RecommendationProduct[]
  >([]);

  useEffect(() => {
    let active = true;

    getRecommendations(type).then(
      (result) => {
        if (active) {
          setProducts(result);
        }
      },
    );

    return () => {
      active = false;
    };
  }, [type]);

  if (!products.length) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black text-[#2563EB]">
            <Sparkles className="h-3.5 w-3.5" />
            Recommended
          </div>

          <h2 className="mt-3 text-xl font-black text-[#0F172A]">
            {title}
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            {description}
          </p>
        </div>

        <Link
          href="/shop/products"
          className="inline-flex items-center gap-1 text-xs font-black text-[#2563EB]"
        >
          Explore more
          <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
        </Link>

      </div>

      <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
        {products.map(
          (product) => (
            <RecommendationCard
              key={product.id}
              product={product}
            />
          ),
        )}
      </div>

    </section>
  );
}