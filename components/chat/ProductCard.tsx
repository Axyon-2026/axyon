"use client";

type ProductCardProps = {
  product: any;
};

export default function ProductCard({
  product,
}: ProductCardProps) {
  if (!product) return null;

  return (
    <div className="mb-5 rounded-[2rem] border border-white/10 bg-[#0d1520] overflow-hidden shadow-lg">

      <img
        src={
          product.imageUrls?.[0] ||
          "/placeholder.png"
        }
        alt={product.title}
        className="w-full h-44 object-cover"
      />

      <div className="p-5">

        <div className="flex justify-between items-start gap-3">

          <div className="min-w-0">

            <h2 className="font-black text-xl text-white line-clamp-2">
              {product.title}
            </h2>

            <p className="text-green-400 text-lg font-black mt-2">
              ₹{product.price}
            </p>

            <div className="flex gap-2 mt-3 flex-wrap">

              <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs">
                {product.condition}
              </span>

              <span className="px-3 py-1 rounded-full bg-white/5 text-slate-300 text-xs">
                {product.category}
              </span>

            </div>

          </div>

        </div>

        <a
          href={`/product/${product.id}`}
          className="mt-5 block w-full text-center bg-green-500 hover:bg-green-600 transition rounded-full py-3 font-black text-black"
        >
          View Product
        </a>

      </div>

    </div>
  );
}