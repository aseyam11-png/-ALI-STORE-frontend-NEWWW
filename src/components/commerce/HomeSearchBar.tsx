"use client";

import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { useState } from "react";

import { SmartAutocomplete } from "@/components/search/SmartAutocomplete";
import { VisualSearch } from "@/components/search/VisualSearch";
import { Dialog } from "@/components/ui/dialog";

// The Header's search: text search (existing SmartAutocomplete, reused as
// is) plus the image-search entry point living inside the same control as a
// dialog — not a separate page section. Only navigation is added here; the
// search/autocomplete/visual-search business logic is untouched.
export function HomeSearchBar({
  className = "",
}: {
  className?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [imageSearchOpen, setImageSearchOpen] = useState(false);

  const submit = (submittedQuery = value) => {
    const query = submittedQuery.trim();

    router.push(
      query
        ? `/shop/products?q=${encodeURIComponent(query)}`
        : "/shop/products",
    );
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <SmartAutocomplete
        value={value}
        onChange={setValue}
        onSubmit={submit}
        className="flex-1"
      />

      <button
        type="button"
        onClick={() => setImageSearchOpen(true)}
        aria-label="البحث بالصورة"
        title="البحث بالصورة"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-neutral-200 text-neutral-500 transition-colors duration-200 ease-brand hover:border-primary-200 hover:bg-primary-50 hover:text-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
      >
        <Camera className="h-5 w-5" />
      </button>

      <Dialog
        open={imageSearchOpen}
        onClose={() => setImageSearchOpen(false)}
        title="البحث بالصورة"
        description="ارفع صورة للعثور على منتجات مشابهة في كتالوج ALI STORE."
      >
        <VisualSearch />
      </Dialog>
    </div>
  );
}
