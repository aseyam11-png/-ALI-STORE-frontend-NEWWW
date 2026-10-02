"use client";

import type { Route } from "next";
import Link from "next/link";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  placeholder = "ابحث عن منتج، قسم أو رقم...",
  className = "",
}: SmartAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState(value);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), 250);
    return () => window.clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    const query = debouncedValue.trim();

    if (query.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void getAutocompleteSuggestions(query, 8)
      .then((next) => {
        if (cancelled) return;
        setSuggestions(next);
        setHighlighted(0);
        setOpen(true);
      })
      .catch(() => {
        if (cancelled) return;
        setSuggestions([]);
        setOpen(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
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
    setOpen(false);
    onSubmit?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (event.key === "ArrowDown" && suggestions.length > 0) {
      event.preventDefault();
      setOpen(true);
      setHighlighted((current) => (current + 1) % suggestions.length);
      return;
    }

    if (event.key === "ArrowUp" && suggestions.length > 0) {
      event.preventDefault();
      setOpen(true);
      setHighlighted((current) => (current - 1 + suggestions.length) % suggestions.length);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const suggestion = open ? suggestions[highlighted] : undefined;

      if (suggestion) {
        window.location.assign(suggestion.href);
      } else {
        submit();
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex h-11 items-center rounded-md bg-white">
        <Search
          className="ms-3 h-4 w-4 shrink-0 text-neutral-400"
          aria-hidden="true"
        />
        <input
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          type="search"
          placeholder={placeholder}
          aria-label="البحث"
          aria-expanded={open}
          className="min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-neutral-400"
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
            className="me-2 flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (loading || suggestions.length > 0) && (
        <div
          role="listbox"
          className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl"
        >
          {loading && (
            <div className="px-4 py-4 text-xs font-bold text-neutral-400">
              جاري البحث…
            </div>
          )}

          {!loading &&
            suggestions.map((suggestion, index) => (
              <Link
                key={suggestion.id + "-" + index}
                href={suggestion.href as Route}
                onMouseEnter={() => setHighlighted(index)}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 ${
                  highlighted === index ? "bg-neutral-50" : ""
                }`}
                role="option"
                aria-selected={highlighted === index}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-100">
                  {suggestion.image ? (
                    <Image
                      src={suggestion.image}
                      alt=""
                      width={40}
                      height={40}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Search className="h-4 w-4 text-neutral-400" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground">
                    {suggestion.title}
                  </p>
                  <p className="truncate text-[11px] text-neutral-400">
                    {suggestion.subtitle}
                  </p>
                </div>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
