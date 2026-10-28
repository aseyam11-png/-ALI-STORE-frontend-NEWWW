"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Clock3,
  FolderSearch,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { getAutocompleteSuggestions } from "@/features/search/services/autocomplete.service";
import {
  addSearchHistory,
  clearSearchHistory,
  getSearchHistory,
  removeSearchHistory,
} from "@/features/search/services/search-history.service";

import type { AutocompleteSuggestion } from "@/features/search/types/autocomplete.types";

interface SmartAutocompleteProps {
  value: string;

  onChange: (value: string) => void;

  onSubmit?: (query?: string) => void;

  placeholder?: string;

  className?: string;
}

function SuggestionIcon({ type }: { type: AutocompleteSuggestion["type"] }) {
  switch (type) {
    case "CATEGORY":
      return <FolderSearch className="h-4 w-4" />;

    case "BRAND":
      return <Tag className="h-4 w-4" />;

    default:
      return <Search className="h-4 w-4" />;
  }
}

function suggestionTypeLabel(type: AutocompleteSuggestion["type"]) {
  switch (type) {
    case "CATEGORY":
      return "قسم";

    case "BRAND":
      return "علامة تجارية";

    default:
      return "منتج";
  }
}

export function SmartAutocomplete({
  value,
  onChange,
  onSubmit,
  placeholder = "ابحث عن منتج، قسم أو رقم...",
  className = "",
}: SmartAutocompleteProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [highlighted, setHighlighted] = useState(0);

  // Debounced so a real backend integration never fires a request per
  // keystroke — see Search UX/security brief §8.
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), 250);

    return () => clearTimeout(timeout);
  }, [value]);

  const containerRef = useRef<HTMLDivElement>(null);

  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [history, setHistory] = useState<string[]>(() => getSearchHistory());
  const [suggestionsLoading, setSuggestionsLoading] = useState(
    () => value.trim().length >= 2,
  );
  const [suggestionsError, setSuggestionsError] = useState(false);

  useEffect(() => {
    let active = true;
    const query = debouncedValue.trim();

    if (query.length < 2) {
      return () => {
        active = false;
      };
    }

    void getAutocompleteSuggestions(query, 8)
      .then((nextSuggestions) => {
        if (!active) return;
        setSuggestions(nextSuggestions);
      })
      .catch(() => {
        if (!active) return;
        setSuggestions([]);
        setSuggestionsError(true);
      })
      .finally(() => {
        if (active) setSuggestionsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [debouncedValue]);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);

    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const submit = () => {
    const query = value.trim();
    if (query) {
      setHistory(addSearchHistory(query));
    }

    setOpen(false);
    onSubmit?.(query);
  };

  const selectHistoryItem = (query: string) => {
    const normalized = query.trim();
    if (!normalized) return;

    onChange(normalized);
    setHistory(addSearchHistory(normalized));
    setOpen(false);
    onSubmit?.(normalized);
  };

  const selectSuggestion = (
    suggestion: AutocompleteSuggestion,
    navigate = false,
  ) => {
    onChange(suggestion.title);
    setOpen(false);

    if (navigate) {
      router.push(suggestion.href as Route);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      setOpen(true);

      setHighlighted((current) =>
        Math.min(current + 1, Math.max(0, suggestions.length - 1)),
      );

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setHighlighted((current) => Math.max(current - 1, 0));

      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (event.key === "Enter") {
      if (open && suggestions[highlighted]) {
        event.preventDefault();

        selectSuggestion(suggestions[highlighted], true);

        return;
      }

      submit();
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex h-full items-center">
        <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />

        <input
          value={value}
          onChange={(event) => {
            const nextValue = event.target.value;
            const hasQuery = nextValue.trim().length >= 2;

            onChange(nextValue);
            setHighlighted(0);
            setSuggestionsError(false);
            setOpen(hasQuery || history.length > 0);
            setSuggestionsLoading(hasQuery);

            if (!hasQuery) {
              setSuggestions([]);
            }
          }}
          onFocus={() => {
            if (value.trim().length >= 2) {
              setOpen(true);
              return;
            }

            setOpen(history.length > 0);
          }}
          onKeyDown={handleKeyDown}
          type="search"
          aria-label="بحث عن منتجات المتجر"
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}

          aria-controls="smart-search-suggestions"
          className="h-full min-w-0 flex-1 rounded-md border border-neutral-200 bg-neutral-50 ps-12 pe-28 text-body text-neutral-900 outline-none transition-colors duration-200 ease-brand placeholder:text-neutral-400 focus:border-brand focus:bg-surface focus:ring-4 focus:ring-primary-100"
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setHighlighted(0);
              setSuggestions([]);
              setSuggestionsLoading(false);
              setSuggestionsError(false);
              setOpen(false);
            }}
            aria-label="مسح البحث"
            className="absolute end-[88px] top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-sm text-neutral-400 hover:bg-neutral-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={submit}
          className="absolute end-1.5 top-1.5 h-[calc(100%-12px)] rounded-sm bg-brand px-5 text-body-sm font-medium text-white transition-colors duration-200 ease-brand hover:bg-brand-hover"
        >
          بحث
        </button>
      </div>

      {open && value.trim().length < 2 && history.length > 0 ? (
        <div className="absolute start-0 end-0 top-[calc(100%+8px)] z-[80] overflow-hidden rounded-lg border border-neutral-200 bg-surface shadow-floating">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-neutral-400" aria-hidden="true" />
              <p className="text-label font-medium uppercase tracking-[0.1em] text-neutral-400">
                عمليات البحث الأخيرة
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                clearSearchHistory();
                setHistory([]);
              }}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2 text-caption font-medium text-neutral-500 transition hover:bg-neutral-50 hover:text-danger-700"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              مسح
            </button>
          </div>

          <div className="p-2">
            {history.map((query) => (
              <div key={query} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => selectHistoryItem(query)}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-md px-3 py-3 text-start transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
                >
                  <Clock3
                    className="h-4 w-4 shrink-0 text-neutral-400"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1 truncate text-body-sm font-medium text-neutral-800">
                    {query}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setHistory(removeSearchHistory(query))}
                  aria-label={"حذف البحث " + query}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-50 hover:text-danger-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {open && value.trim().length >= 2 && suggestionsLoading && (
        <div className="absolute start-0 end-0 top-[calc(100%+8px)] z-[80] rounded-lg border border-neutral-200 bg-surface p-5 shadow-floating">
          <p className="text-body-sm font-medium text-neutral-500">
            جارٍ البحث...
          </p>
        </div>
      )}

      {open && suggestions.length > 0 && (
        <div
          id="smart-search-suggestions"
          role="listbox"
          className="absolute start-0 end-0 top-[calc(100%+8px)] z-[80] overflow-hidden rounded-lg border border-neutral-200 bg-surface shadow-floating"
        >
          <div className="border-b border-neutral-100 px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-label font-medium uppercase tracking-[0.1em] text-neutral-400">
                اقتراحات البحث
              </p>

              <span className="text-label font-medium text-neutral-300">
                {suggestions.length} نتيجة
              </span>
            </div>
          </div>

          <div className="max-h-[430px] overflow-y-auto p-2">
            {suggestions.map((suggestion, index) => (
              <Link
                key={`${suggestion.type}-${suggestion.id}`}
                href={suggestion.href as Route}
                role="option"
                aria-selected={highlighted === index}
                onMouseEnter={() => setHighlighted(index)}
                onClick={() => selectSuggestion(suggestion)}
                className={`flex items-center gap-3 rounded-md px-3 py-3 transition-colors duration-200 ease-brand ${
                  highlighted === index
                    ? "bg-primary-50"
                    : "hover:bg-neutral-50"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-neutral-100 text-brand">
                  {suggestion.image ? (
                    <Image
                      src={suggestion.image}
                      alt=""
                      width={40}
                      height={40}
                      className="h-full w-full rounded-sm object-cover"
                    />
                  ) : (
                    <SuggestionIcon type={suggestion.type} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-body-sm font-medium text-neutral-900">
                      {suggestion.title}
                    </p>

                    <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-label font-medium text-neutral-400">
                      {suggestionTypeLabel(suggestion.type)}
                    </span>
                  </div>

                  {suggestion.subtitle && (
                    <p className="mt-0.5 truncate text-caption text-neutral-400">
                      {suggestion.subtitle}
                    </p>
                  )}
                </div>

                <ArrowLeft className="h-4 w-4 shrink-0 rtl:rotate-180 text-neutral-300" />
              </Link>
            ))}
          </div>

          <div className="border-t border-neutral-100 bg-neutral-50/70 px-4 py-3">
            <Link
              href={
                `/shop/products?q=${encodeURIComponent(value.trim())}` as Route
              }
              onClick={() => setOpen(false)}
              className="flex items-center justify-between text-body-sm font-medium text-brand"
            >
              <span>عرض كل النتائج لـ «{value.trim()}»</span>

              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      )}

      {open &&
        value.trim().length >= 2 &&
        !suggestionsLoading &&
        suggestions.length === 0 && (
          <div className="absolute start-0 end-0 top-[calc(100%+8px)] z-[80] rounded-lg border border-neutral-200 bg-surface p-5 shadow-floating">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-neutral-100 text-neutral-400">
                <Search className="h-4 w-4" />
              </div>

              <div>
                <p className="text-body-sm font-medium text-neutral-800">
                  {suggestionsError
                    ? "تعذر تحميل الاقتراحات الآن"
                    : "لا توجد اقتراحات فورية"}
                </p>

                <p className="mt-1 text-caption text-neutral-400">
                  {suggestionsError
                    ? "اضغط Enter لعرض النتائج من الكتالوج."
                    : "اضغط Enter لعرض كل النتائج المطابقة."}
                </p>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
