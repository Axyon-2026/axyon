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
    <div
      className="
        fixed inset-0 z-[100]
        flex items-center justify-center
        bg-black/75
        px-4
        backdrop-blur-md
      "
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-deal-title"
        onClick={(e) => e.stopPropagation()}
        className="
          w-full max-w-md
          rounded-3xl
          border border-white/10
          bg-[#0b1420]
          p-6
          text-white
          shadow-2xl
          sm:p-7
        "
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/15 text-2xl">
          ✓
        </div>

        <h2
          id="complete-deal-title"
          className="mt-5 text-2xl font-black text-white sm:text-3xl"
        >
          Complete Deal?
        </h2>

        <p className="mt-3 leading-6 text-slate-300">
          Confirm only after you have completed the transaction with the buyer.
        </p>

        <div
          className="
            mt-6
            rounded-2xl
            border border-green-500/20
            bg-green-500/10
            p-4
          "
        >
          <p className="font-semibold text-green-300">
            What happens next
          </p>

          <div className="mt-3 space-y-3 text-sm text-slate-200">
            <p>✓ The product will be marked as sold.</p>

            <p>✓ The listing will disappear from Marketplace.</p>

            <p className="text-amber-300">
              ⚠ This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="
              flex-1
              rounded-xl
              border border-white/15
              bg-white/5
              px-5 py-3.5
              font-bold
              text-white
              transition
              hover:bg-white/10
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onContinue}
            disabled={loading}
            className="
              flex-1
              rounded-xl
              bg-green-500
              px-5 py-3.5
              font-black
              text-slate-950
              transition
              hover:bg-green-400
              disabled:cursor-not-allowed
              disabled:bg-green-800
              disabled:text-green-200
            "
          >
            {loading ? "Completing..." : "Yes, Complete Deal"}
          </button>
        </div>
      </div>
    </div>
  );
}