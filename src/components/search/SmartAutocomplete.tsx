"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, FolderSearch, Search, Tag, X } from "lucide-react";

import { getAutocompleteSuggestions } from "@/features/search/services/autocomplete.service";
import type { AutocompleteSuggestion } from "@/features/search/types/autocomplete.types";

interface SmartAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
}

function SuggestionIcon({ type }: { type: AutocompleteSuggestion["type"] }) {
  if (type === "CATEGORY") return <FolderSearch className="h-4 w-4" />;
  if (type === "BRAND") return <Tag className="h-4 w-4" />;
  return <Search className="h-4 w-4" />;
}

export function SmartAutocomplete({
  value,
  onChange,
  onSubmit,
  placeholder = "ابحث عن منتج، قسم أو SKU...",
  className = "",
}: SmartAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    const timer = window.setTimeout(() => {
      void getAutocompleteSuggestions(q, 8)
        .then((result) => {
          if (!controller.signal.aborted) {
            setSuggestions(result);
            setHighlighted(0);
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) setSuggestions([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [value]);

  useEffect(() => {
    const onOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  const selectSuggestion = (suggestion: AutocompleteSuggestion) => {
    onChange(suggestion.title);
    setOpen(false);
  };

  const submit = () => {
    setOpen(false);
    onSubmit?.();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setHighlighted((current) => Math.min(current + 1, Math.max(0, suggestions.length - 1)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((current) => Math.max(current - 1, 0));
    } else if (event.key === "Escape") {
      setOpen(false);
    } else if (event.key === "Enter") {
      if (open && suggestions[highlighted]) {
        event.preventDefault();
        selectSuggestion(suggestions[highlighted]);
      } else {
        submit();
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
      <input
        value={value}
        onChange={(event) => {
          const next = event.target.value;
          onChange(next);
          setOpen(next.trim().length >= 2);
        }}
        onFocus={() => setOpen(value.trim().length >= 2)}
        onKeyDown={onKeyDown}
        type="search"
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open && (loading || suggestions.length > 0)}
        aria-controls="smart-search-suggestions"
        placeholder={placeholder}
        className="h-12 min-w-0 w-full rounded-md border border-neutral-200 bg-neutral-50 ps-12 pe-28 text-sm text-neutral-900 outline-none transition focus:border-brand focus:bg-surface focus:ring-4 focus:ring-primary-100"
      />

      {value && (
        <button type="button" onClick={() => onChange("")} aria-label="مسح البحث" className="absolute end-[88px] top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-sm text-neutral-400 hover:bg-neutral-100">
          <X className="h-4 w-4" />
        </button>
      )}

      <button type="button" onClick={submit} className="absolute end-1.5 top-1.5 h-9 rounded-sm bg-brand px-5 text-sm font-medium text-white hover:bg-brand-hover">
        بحث
      </button>

      {open && (
        <div id="smart-search-suggestions" role="listbox" className="absolute start-0 end-0 top-[calc(100%+8px)] z-[80] overflow-hidden rounded-lg border border-neutral-200 bg-surface shadow-floating">
          <div className="border-b border-neutral-100 px-4 py-3 text-xs font-medium text-neutral-400">
            {loading ? "جاري البحث..." : `${suggestions.length} اقتراحات`}
          </div>

          {suggestions.length > 0 ? (
            <div className="max-h-[430px] overflow-y-auto p-2">
              {suggestions.map((suggestion, index) => (
                <Link
                  key={`${suggestion.type}-${suggestion.id}`}
                  href={suggestion.href as Route}
                  role="option"
                  aria-selected={index === highlighted}
                  onMouseEnter={() => setHighlighted(index)}
                  onClick={() => selectSuggestion(suggestion)}
                  className={`flex items-center gap-3 rounded-md px-3 py-3 ${index === highlighted ? "bg-primary-50" : "hover:bg-neutral-50"}`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-neutral-100 text-brand">
                    {suggestion.image ? <Image src={suggestion.image} alt="" width={40} height={40} className="h-full w-full rounded-sm object-cover" /> : <SuggestionIcon type={suggestion.type} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900">{suggestion.title}</p>
                    {suggestion.subtitle && <p className="mt-0.5 truncate text-xs text-neutral-400">{suggestion.subtitle}</p>}
                  </div>
                  <ArrowLeft className="h-4 w-4 shrink-0 text-neutral-300 rtl:rotate-180" />
                </Link>
              ))}
            </div>
          ) : !loading ? (
            <div className="p-5 text-sm text-neutral-500">لا توجد اقتراحات. اضغط Enter لعرض نتائج البحث.</div>
          ) : null}

          {value.trim().length >= 2 && (
            <div className="border-t border-neutral-100 bg-neutral-50/70 px-4 py-3">
              <Link href={`/shop/products?q=${encodeURIComponent(value.trim())}` as Route} onClick={() => setOpen(false)} className="flex items-center justify-between text-sm font-medium text-brand">
                عرض كل النتائج <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
