"use client";

type Props = {
  open: boolean;
  onClose: () => void;

  finalPrice: number | string;
  setFinalPrice: (value: any) => void;

  paymentMethod: string;
  setPaymentMethod: (value: any) => void;

  loading: boolean;

  onContinue: () => void;
};

export default function CompleteDealModal({
  open,
  onClose,
  finalPrice,
  setFinalPrice,
  paymentMethod,
  setPaymentMethod,
  loading,
  onContinue,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">

      <div className="w-[95%] max-w-md rounded-3xl bg-white p-7">

        <h2 className="text-3xl font-black">
          Complete Sale
        </h2>

        <p className="mt-2 text-slate-500">
          Confirm the final deal details.
        </p>

        <div className="mt-6">

          <label className="font-bold">
            Final Price
          </label>

          <input
            type="number"
            value={finalPrice}
            onChange={(e) =>
              setFinalPrice(e.target.value)
            }
            className="mt-2 w-full rounded-2xl border px-5 py-4"
          />

        </div>

        <div className="mt-5">

          <label className="font-bold">
            Payment Method
          </label>

          <select
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(e.target.value)
            }
            className="mt-2 w-full rounded-2xl border px-5 py-4"
          >
            <option>Cash</option>
            <option>UPI</option>
            <option>Pay via Meet</option>
          </select>

        </div>

        <div className="mt-8 flex gap-3">

          <button
            onClick={onClose}
            className="flex-1 rounded-full border py-4 font-bold"
          >
            Cancel
          </button>

          <button
            onClick={onContinue}
            disabled={loading}
            className="flex-1 rounded-full bg-green-600 py-4 font-bold text-white hover:bg-green-700 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Continue"}
          </button>

        </div>

      </div>

    </div>
  );
}