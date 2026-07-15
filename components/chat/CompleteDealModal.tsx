"use client";

type Props = {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  onContinue: () => void;
};

export default function CompleteDealModal({
  open,
  onClose,
  loading,
  onContinue,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[95%] max-w-md rounded-3xl bg-white p-7">

        <h2 className="text-3xl font-black">
          Complete Deal
        </h2>

        <p className="mt-5 text-slate-600 leading-7">
          Are you sure you want to complete this deal?
        </p>

        <div className="mt-6 rounded-2xl bg-green-50 border border-green-200 p-5">

          <p>✅ Product will be marked as SOLD</p>

          <p className="mt-2">
            ✅ Listing will disappear from Marketplace
          </p>

          <p className="mt-2">
            ⚠️ This action cannot be undone.
          </p>

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
            className="flex-1 rounded-full bg-green-600 text-white py-4 font-bold"
          >
            {loading ? "Completing..." : "Complete Deal"}
          </button>

        </div>

      </div>
    </div>
  );
}