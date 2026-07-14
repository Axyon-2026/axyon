"use client";

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

  const isSeller =
    currentUser?.id === conversation?.sellerId;

  const isBuyer =
    currentUser?.id === conversation?.buyerId;

  return (
    <div className="border-b border-white/10 bg-[#0b1420]">

      {/* Product Card */}

      <div className="flex items-center gap-3 px-4 py-3">

        <img
          src={product.imageUrls?.[0] || "/placeholder.png"}
          alt={product.title}
          className="h-20 w-20 rounded-xl object-cover border border-white/10 shrink-0"
        />

        <div className="flex-1 min-w-0">

          <h2 className="truncate text-white font-bold text-base">
            {product.title}
          </h2>

          <p className="mt-1 text-lg font-bold text-green-400">
            ₹{product.price}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">

            <span className="rounded-full bg-green-500/10 px-2 py-1 text-[11px] text-green-400">
              {product.condition}
            </span>

            <span className="rounded-full bg-white/5 px-2 py-1 text-[11px] text-slate-300">
              {product.category}
            </span>

            {product.status === "SOLD" && (
              <span className="rounded-full bg-green-600 px-2 py-1 text-[11px] font-bold text-white">
                SOLD
              </span>
            )}

            {product.status === "REMOVED" && (
              <span className="rounded-full bg-red-600 px-2 py-1 text-[11px] font-bold text-white">
                REMOVED
              </span>
            )}

          </div>

        </div>

        <a
          href={`/product/${product.id}`}
          className="shrink-0 rounded-lg border border-green-500 px-3 py-2 text-xs font-semibold text-green-400 transition hover:bg-green-500 hover:text-black"
        >
          View
        </a>

      </div>

      {/* Transaction Actions */}

      {product.status === "AVAILABLE" && (

        <div className="border-t border-white/10 px-4 py-3">

          {isSeller && (

            <button
              onClick={onCompleteSale}
              className="w-full rounded-xl bg-green-600 py-3 font-bold text-white transition hover:bg-green-700"
            >
              ✅ Complete Sale
            </button>

          )}

          {isBuyer && (

            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-center">

              <p className="text-sm text-blue-300">
                Waiting for seller to complete the deal.
              </p>

            </div>

          )}

        </div>

      )}

      {product.status === "SOLD" && (

        <div className="border-t border-white/10 bg-green-600 px-4 py-3 text-center font-bold text-white">

          ✅ This product has been sold through Axyon.

        </div>

      )}

    </div>
  );
}