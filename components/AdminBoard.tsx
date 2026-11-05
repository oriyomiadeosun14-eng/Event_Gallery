"use client";

import { useMemo, useState } from "react";
import { Check, Download, EyeOff, Loader2, Play, Star, Trash2 } from "lucide-react";

import { Lightbox } from "@/components/Lightbox";
import { Button, buttonClass } from "@/components/ui/button";
import { cardClass } from "@/components/ui/card";
import { chipClass } from "@/components/ui/chip";
import { inputClass } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { getThumbnailUrl, type AlbumSummary, type MediaItem, type MediaStatus } from "@/lib/media";

type Filter = "PENDING" | "APPROVED" | "HIDDEN" | "FEATURED" | "ALL";

const filterLabels: Record<Filter, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  HIDDEN: "Hidden",
  FEATURED: "Featured",
  ALL: "All",
};

const statusBadge: Record<MediaStatus, string> = {
  PENDING: "bg-sky text-ink border-sky",
  APPROVED: "bg-sage text-ink border-sage",
  HIDDEN: "bg-surface text-ink-muted border-border",
};

type Props = { initialItems: MediaItem[]; albums: AlbumSummary[] };

export function AdminBoard({ initialItems, albums }: Props) {
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<Filter>(initialItems.some((i) => i.status === "PENDING") ? "PENDING" : "ALL");
  const [busy, setBusy] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<number | null>(null);

  const counts = useMemo(
    () => ({
      PENDING: items.filter((i) => i.status === "PENDING").length,
      APPROVED: items.filter((i) => i.status === "APPROVED").length,
      HIDDEN: items.filter((i) => i.status === "HIDDEN").length,
      FEATURED: items.filter((i) => i.featured).length,
      ALL: items.length,
    }),
    [items],
  );

  const visible = useMemo(
    () =>
      items.filter((item) =>
        filter === "ALL" ? true : filter === "FEATURED" ? item.featured : item.status === filter,
      ),
    [items, filter],
  );

  const setBusyFor = (id: number, on: boolean) =>
    setBusy((current) => {
      const next = new Set(current);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  async function patch(id: number, changes: { status?: MediaStatus; featured?: boolean; albumId?: number | null }) {
    setBusyFor(id, true);
    setError(null);
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Update failed");
      setItems((current) => current.map((item) => (item.id === id ? json.item : item)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyFor(id, false);
    }
  }

  async function remove(id: number) {
    if (!window.confirm("Delete this upload permanently? It will also be removed from Cloudinary.")) return;
    setBusyFor(id, true);
    setError(null);
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).message ?? "Delete failed");
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyFor(id, false);
    }
  }

  async function approveAllPending() {
    const pending = items.filter((i) => i.status === "PENDING");
    if (!pending.length || !window.confirm(`Approve all ${pending.length} pending uploads?`)) return;
    for (const item of pending) await patch(item.id, { status: "APPROVED" });
  }

  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["PENDING", "APPROVED", "HIDDEN", "FEATURED"] as const).map((key) => (
          <div key={key} className={cardClass({ className: "rounded-3xl p-4" })}>
            <p className="text-sm text-ink-muted">{filterLabels[key]}</p>
            <p className="mt-2 text-3xl font-semibold text-ink">{counts[key]}</p>
          </div>
        ))}
      </div>

      <details className={cardClass({ className: "mb-6 rounded-3xl p-4 text-sm text-ink" })}>
        <summary className="flex cursor-pointer items-center gap-2 font-medium text-ink">
          <Download className="h-4 w-4 text-ink" /> Download as ZIP
        </summary>
        <p className="mt-3 text-ink-muted">
          Approved uploads only. Cloudinary builds the ZIP, which can take a little while for big albums.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {[{ slug: null, name: "Everything" }, ...albums].map((album) => (
            <div key={album.slug ?? "all"} className="flex items-center justify-between gap-2 rounded-2xl bg-bg px-3 py-2">
              <span>{album.name}</span>
              <span className="flex gap-2">
                {(["image", "video"] as const).map((type) => (
                  <a
                    key={type}
                    href={`/api/admin/download?type=${type}${album.slug ? `&album=${album.slug}` : ""}`}
                    className={buttonClass({ variant: "outline", size: "sm" })}
                  >
                    {type === "image" ? "Photos" : "Videos"}
                  </a>
                ))}
              </span>
            </div>
          ))}
        </div>
      </details>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {(Object.keys(filterLabels) as Filter[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={chipClass(filter === key)}
          >
            {filterLabels[key]} <span className="opacity-60">{counts[key]}</span>
          </button>
        ))}
        {filter === "PENDING" && counts.PENDING > 1 ? (
          <Button variant="secondary" size="md" onClick={approveAllPending} className="ml-auto">
            <Check className="h-4 w-4" /> Approve all
          </Button>
        ) : null}
      </div>

      {error ? (
        <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
      ) : null}

      {visible.length === 0 ? (
        <div className={cardClass({ tone: "empty", className: "rounded-[28px] p-10 text-center" })}>
          Nothing in “{filterLabels[filter]}”.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item, index) => {
            const isBusy = busy.has(item.id);
            return (
              <article
                key={item.id}
                className={cardClass({ className: cn("flex flex-col overflow-hidden rounded-3xl transition", isBusy && "opacity-60") })}
              >
                <button type="button" onClick={() => setPreview(index)} className="relative block aspect-[4/3] bg-sky/30">
                  {/* eslint-disable-next-line @next/next/no-img-element -- Cloudinary thumbnail */}
                  <img src={getThumbnailUrl(item)} alt="" loading="lazy" className="h-full w-full object-cover" />
                  {item.type === "VIDEO" ? (
                    <Play className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 fill-bg/80 text-bg/80" />
                  ) : null}
                  <span className={`absolute left-3 top-3 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] ${statusBadge[item.status]}`}>
                    {item.status.toLowerCase()}
                  </span>
                  {isBusy ? <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-bg" /> : null}
                </button>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{item.uploaderName ?? "Anonymous guest"}</p>
                    {item.caption ? <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{item.caption}</p> : null}
                    <p className="mt-1 text-xs text-ink-muted">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>

                  <select
                    value={item.album?.id ?? ""}
                    disabled={isBusy}
                    onChange={(e) => patch(item.id, { albumId: e.target.value ? Number(e.target.value) : null })}
                    className={inputClass({ compact: true })}
                    aria-label="Album"
                  >
                    <option value="">No album</option>
                    {albums.map((album) => (
                      <option key={album.id} value={album.id}>
                        {album.name}
                      </option>
                    ))}
                  </select>

                  <div className="mt-auto grid grid-cols-4 gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      disabled={isBusy || item.status === "APPROVED"}
                      onClick={() => patch(item.id, { status: "APPROVED" })}
                      title="Approve"
                      aria-label="Approve"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={isBusy || item.status === "HIDDEN"}
                      onClick={() => patch(item.id, { status: "HIDDEN", featured: false })}
                      title="Hide"
                      aria-label="Hide"
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={item.featured ? "highlight" : "subtle"}
                      size="icon"
                      disabled={isBusy}
                      onClick={() => patch(item.id, { featured: !item.featured })}
                      title={item.featured ? "Unfeature" : "Feature (also approves)"}
                      aria-label={item.featured ? "Unfeature" : "Feature"}
                      aria-pressed={item.featured}
                    >
                      <Star className={cn("h-4 w-4", item.featured && "fill-current")} />
                    </Button>
                    <Button
                      variant="danger"
                      size="icon"
                      disabled={isBusy}
                      onClick={() => remove(item.id)}
                      title="Delete"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {preview !== null && visible[preview] ? (
        <Lightbox items={visible} selectedIndex={preview} onClose={() => setPreview(null)} onSelectIndex={setPreview} />
      ) : null}
    </>
  );
}
