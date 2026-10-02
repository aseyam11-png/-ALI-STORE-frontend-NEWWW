"use client";

import type { KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";

import { getAutocompleteSuggestions } from "@/features/search/services/autocomplete.service";
import type { AutocompleteSuggestion } from "@/features/search/types/autocomplete.types";

interface SmartAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
}

export function SmartAutocomplete({
  value,
  onChange,
  onSubmit,
  placeholder = "ابحث عن منتج أو SKU...",
  className = "",
}: SmartAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [highlighted, setHighlighted] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = value.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      void getAutocompleteSuggestions(query, 8)
        .then((result) => {
          if (!active) return;
          setSuggestions(result);
          setHighlighted(0);
          setOpen(result.length > 0);
        })
        .catch(() => {
          if (!active) return;
          setSuggestions([]);
          setOpen(false);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [value]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const submit = () => {
    setOpen(false);
    onSubmit?.();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
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
      setHighlighted((current) => Math.max(0, current - 1));
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (event.key === "Enter") {
      const selected = suggestions[highlighted];
      if (open && selected) {
        event.preventDefault();
        onChange(selected.title);
        setOpen(false);
        return;
      }
      submit();
    }
  };

  return (
    <div ref={containerRef} className={"relative " + className}>
      <div className="relative flex h-full items-center">
        <Search className="pointer-events-none absolute start-4 h-5 w-5 text-neutral-400" />
        <input
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(event.target.value.trim().length >= 2);
          }}
          onFocus={() => setOpen(suggestions.length > 0)}
          onKeyDown={onKeyDown}
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open && suggestions.length > 0}
          aria-controls="smart-search-suggestions"
          autoComplete="off"
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 rounded-md border border-neutral-200 bg-neutral-50 ps-12 pe-24 text-sm text-neutral-900 outline-none focus:border-brand focus:bg-surface focus:ring-4 focus:ring-primary-100"
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setSuggestions([]);
              setOpen(false);
            }}
            aria-label="مسح البحث"
            className="absolute end-20 flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={submit}
          className="absolute end-1.5 top-1.5 h-[calc(100%-12px)] rounded-md bg-brand px-5 text-xs font-black text-white"
        >
          بحث
        </button>
      </div>

      {open && (
        <div
          id="smart-search-suggestions"
          role="listbox"
          className="absolute start-0 end-0 top-[calc(100%+8px)] z-[80] overflow-hidden rounded-xl border border-neutral-200 bg-surface shadow-floating"
        >
          {loading ? (
            <div className="px-4 py-5 text-xs font-bold text-neutral-400">
              جارٍ البحث...
            </div>
          ) : suggestions.length > 0 ? (
            <div className="p-2">
              {suggestions.map((suggestion, index) => (
                <Link
                  key={suggestion.id}
                  href={suggestion.href}
                  role="option"
                  aria-selected={highlighted === index}
                  onMouseEnter={() => setHighlighted(index)}
                  onClick={() => setOpen(false)}
                  className={
                    "flex items-center gap-3 rounded-lg px-3 py-3 " +
                    (highlighted === index
                      ? "bg-primary-50"
                      : "hover:bg-neutral-50")
                  }
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-100">
                    {suggestion.image ? (
                      <Image
                        src={suggestion.image}
                        alt=""
                        width={40}
                        height={40}
                        className="h-10 w-10 object-cover"
                      />
                    ) : (
                      <Search className="h-4 w-4 text-brand" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-foreground">
                      {suggestion.title}
                    </p>
                    {suggestion.subtitle && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {suggestion.subtitle}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-4 py-5 text-xs font-bold text-neutral-400">
              لا توجد اقتراحات مطابقة.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
