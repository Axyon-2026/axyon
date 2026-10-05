"use client";

import Link from "next/link";

type CompactProductCardProps = {
  product: any;
  conversation: any;
  currentUser: any;
  onCompleteSale: () => void;
};

export default function CompactProductCard({
  product,
  conversation,
  currentUser,
  onCompleteSale,
}: CompactProductCardProps) {
  if (!product) return null;

  const isSeller = currentUser?.id === conversation?.sellerId;
  const isBuyer = currentUser?.id === conversation?.buyerId;

  const image =
    product.imageUrls?.[0] ||
    product.imageUrl ||
    "/placeholder.png";

  const isSold = product.status === "SOLD";
  const isRemoved = product.status === "REMOVED";
  const isAvailable = product.status === "AVAILABLE";

  return (
    <div className="border-b border-white/[0.07] bg-[#0b1420]">
      {/* Listing */}
      <div className="mx-auto w-full max-w-4xl px-3 py-3 sm:px-5">
        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)] sm:p-3">
          {/* Image */}
          <Link
            href={`/product/${product.id}`}
            className="group relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-[#111c29] sm:h-[76px] sm:w-[76px]"
          >
            <img
              src={image}
              alt={product.title || "Product"}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
          </Link>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="mb-0.5 text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">
                  Item
                </p>

                <h2 className="truncate text-sm font-black text-white sm:text-[15px]">
                  {product.title || "Untitled item"}
                </h2>
              </div>

              <Link
                href={`/product/${product.id}`}
                className="
                  hidden shrink-0 items-center gap-1
                  rounded-lg border border-emerald-400/20
                  bg-emerald-400/10 px-2.5 py-1.5
                  text-[10px] font-black text-emerald-300
                  transition
                  hover:border-emerald-400/30
                  hover:bg-emerald-400/15
                  active:scale-95
                  sm:flex
                "
              >
                View
                <span aria-hidden="true">↗</span>
              </Link>
            </div>

            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-sm font-black text-emerald-400 sm:text-base">
                ₹{product.price}
              </span>

              {product.condition && (
                <span className="hidden text-[10px] text-slate-500 sm:inline">
                  • {product.condition}
                </span>
              )}
            </div>

            <div className="mt-1.5 flex min-w-0 flex-wrap gap-1.5">
              {product.condition && (
                <span className="rounded-full border border-emerald-400/10 bg-emerald-400/[0.07] px-2 py-0.5 text-[9px] font-bold text-emerald-300">
                  {product.condition}
                </span>
              )}

              {product.category && (
                <span className="max-w-[130px] truncate rounded-full border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-[9px] font-bold text-slate-400">
                  {product.category}
                </span>
              )}

              {isSold && (
                <span className="rounded-full border border-emerald-400/20 bg-emerald-500/15 px-2 py-0.5 text-[9px] font-black text-emerald-300">
                  SOLD
                </span>
              )}

              {isRemoved && (
                <span className="rounded-full border border-red-400/20 bg-red-500/10 px-2 py-0.5 text-[9px] font-black text-red-300">
                  REMOVED
                </span>
              )}
            </div>
          </div>

          {/* Mobile View */}
          <Link
            href={`/product/${product.id}`}
            className="
              flex shrink-0 items-center justify-center
              rounded-xl border border-emerald-400/20
              bg-emerald-400/10
              px-2.5 py-2
              text-[10px] font-black text-emerald-300
              transition
              hover:bg-emerald-400/15
              active:scale-95
              sm:hidden
            "
          >
            Open
          </Link>
        </div>
      </div>

      {/* Transaction Actions */}
      {isAvailable && (
        <div className="mx-auto w-full max-w-4xl px-3 pb-3 sm:px-5">
          {isSeller && (
            <button
              type="button"
              onClick={onCompleteSale}
              className="
                flex w-full items-center justify-center gap-2
                rounded-xl
                border border-emerald-400/20
                bg-emerald-500/90
                px-4 py-3
                text-sm font-black
                text-[#03120b]
                shadow-[0_8px_25px_rgba(16,185,129,0.12)]
                transition-all duration-200
                hover:bg-emerald-400
                hover:shadow-[0_10px_30px_rgba(16,185,129,0.18)]
                active:scale-[0.99]
              "
            >
              <span>✓</span>
              Complete Sale
            </button>
          )}

          {isBuyer && (
            <div className="rounded-xl border border-sky-400/10 bg-sky-400/[0.06] px-4 py-3 text-center">
              <p className="text-xs font-semibold text-sky-300 sm:text-sm">
                Waiting for the seller to complete the deal.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Sold */}
      {isSold && (
        <div className="mx-auto w-full max-w-4xl px-3 pb-3 sm:px-5">
          <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-400/10 bg-emerald-500/[0.08] px-4 py-3 text-center">
            <span className="text-sm">✓</span>

            <p className="text-xs font-bold text-emerald-300 sm:text-sm">
              This item has been sold through Axyon.
            </p>
          </div>
        </div>
      )}

      {/* Removed */}
      {isRemoved && (
        <div className="mx-auto w-full max-w-4xl px-3 pb-3 sm:px-5">
          <div className="rounded-xl border border-red-400/10 bg-red-500/[0.06] px-4 py-3 text-center">
            <p className="text-xs font-bold text-red-300 sm:text-sm">
              This item is no longer available.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}