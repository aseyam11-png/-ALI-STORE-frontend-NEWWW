"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Camera,
  ImageIcon,
  Loader2,
  Search,
  Upload,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import {
  searchByImage,
} from "@/features/visual-search/services/visual-search.service";

import type {
  VisualSearchResult,
} from "@/features/visual-search/types/visual-search.types";

import { LocalizedPrice } from "@/components/localization/LocalizedPrice";

export function VisualSearch() {
  const [
    preview,
    setPreview,
  ] = useState<
    string | undefined
  >();

  const [
    selectedFile,
    setSelectedFile,
  ] = useState<
    File | undefined
  >();

  const [
    results,
    setResults,
  ] = useState<
    VisualSearchResult[]
  >([]);

  const [
    searching,
    setSearching,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(
          preview,
        );
      }
    };
  }, [preview]);

  const handleFile = (
    file?: File,
  ) => {
    if (!file) {
      return;
    }

    setError("");
    setResults([]);

    if (
      !file.type.startsWith(
        "image/",
      )
    ) {
      setError(
        "Please choose an image file.",
      );
      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setError(
        "Image must be 10 MB or less.",
      );
      return;
    }

    if (preview) {
      URL.revokeObjectURL(
        preview,
      );
    }

    const nextPreview =
      URL.createObjectURL(
        file,
      );

    setPreview(
      nextPreview,
    );

    setSelectedFile(
      file,
    );
  };

  const searchImage =
    async () => {
      if (!selectedFile) {
        return;
      }

      setSearching(true);
      setError("");

      try {
        const nextResults =
          await searchByImage(
            selectedFile,
          );

        setResults(
          nextResults,
        );
      } catch (
        searchError
      ) {
        setError(
          searchError instanceof
            Error
            ? searchError.message
            : "Visual search failed.",
        );
      } finally {
        setSearching(
          false,
        );
      }
    };

  const clear = () => {
    if (preview) {
      URL.revokeObjectURL(
        preview,
      );
    }

    setPreview(
      undefined,
    );
    setSelectedFile(
      undefined,
    );
    setResults([]);
    setError("");
  };

  return (
    <div className="mx-auto max-w-[1050px]">

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
              <Camera className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900">
                Search by image
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Upload a product photo to discover similar items.
              </p>
            </div>

          </div>

          <label
            htmlFor="visual-search-file"
            className="mt-5 flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 text-center transition hover:border-blue-300 hover:bg-blue-50"
          >

            {preview ? (
              <div className="relative w-full">

                {/* Client-only blob: URL preview of the file the user just
                    picked, before it is ever sent anywhere — next/image
                    cannot optimize blob: sources, so a plain <img> is
                    correct here. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Selected search image"
                  className="mx-auto max-h-[230px] w-full rounded-xl object-contain"
                />

              </div>
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                  <ImageIcon className="h-7 w-7" />
                </div>

                <p className="mt-4 text-sm font-black text-slate-800">
                  Upload an image
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  JPG, PNG or WEBP · Maximum 10 MB
                </p>

                <span className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-[#2563EB] px-4 text-xs font-black text-white">
                  <Upload className="h-4 w-4" />
                  Choose image
                </span>
              </>
            )}

            <input
              id="visual-search-file"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(
                event,
              ) =>
                handleFile(
                  event.target
                    .files?.[0],
                )
              }
            />

          </label>

          {selectedFile && (
            <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">

              <div className="min-w-0">

                <p className="truncate text-xs font-black text-slate-700">
                  {
                    selectedFile.name
                  }
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                  {(
                    selectedFile.size /
                    1024 /
                    1024
                  ).toFixed(2)}{" "}
                  MB
                </p>

              </div>

              <button
                type="button"
                onClick={
                  clear
                }
                aria-label="Remove selected image"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white"
              >
                <X className="h-4 w-4" />
              </button>

            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600"
            >
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={
              searchImage
            }
            disabled={
              !selectedFile ||
              searching
            }
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {searching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Finding similar products...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Search by image
              </>
            )}
          </button>

        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between gap-4">

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#2563EB]">
                Visual matches
              </p>

              <h2 className="mt-2 text-xl font-black text-slate-900">
                Similar products
              </h2>
            </div>

            {results.length >
              0 && (
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black text-[#2563EB]">
                {results.length} matches
              </span>
            )}

          </div>

          {results.length ===
          0 ? (
            <div className="flex min-h-[360px] items-center justify-center">

              <div className="max-w-sm text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
                  <Camera className="h-7 w-7" />
                </div>

                <h3 className="mt-5 text-lg font-black text-slate-800">
                  Upload a product photo
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  We will show products that visually match the uploaded image.
                </p>

              </div>

            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

              {results.map(
                (result) => (
                  <Link
                    key={
                      result.id
                    }
                    href={`/shop/products/${encodeURIComponent(
                      result.productId,
                    )}`}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
                  >

                    <div className="relative flex aspect-square items-center justify-center bg-slate-50">

                      {result.image ? (
                        <Image
                          src={
                            result.image
                          }
                          alt={
                            result.productName
                          }
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-contain p-7 transition group-hover:scale-105"
                        />
                      ) : (
                        <Camera className="h-8 w-8 text-slate-300" />
                      )}

                    </div>

                    <div className="p-4">

                      <div className="flex items-center justify-between gap-2">

                        <span className="text-[10px] font-black text-[#2563EB]">
                          {
                            result.brand
                          }
                        </span>

                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-black text-emerald-700">
                          {
                            result.similarity
                          }% match
                        </span>

                      </div>

                      <h3 className="mt-2 line-clamp-2 text-sm font-black leading-5 text-slate-900">
                        {
                          result.productName
                        }
                      </h3>

                      <p className="mt-1 text-[10px] text-slate-400">
                        {
                          result.category
                        }
                      </p>

                      <LocalizedPrice
                        amountUSD={
                          result.price
                        }
                        className="mt-3 block text-lg font-black text-[#0F2747]"
                      />

                    </div>

                  </Link>
                ),
              )}

            </div>
          )}

        </section>

      </div>

    </div>
  );
}