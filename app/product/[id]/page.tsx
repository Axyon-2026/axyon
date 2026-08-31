"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [message, setMessage] = useState("Loading product...");
  const [openingChat, setOpeningChat] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [payViaMeetLoading, setPayViaMeetLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const userRes = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          setCurrentUser(userData.user);
        }

        const res = await fetch(`/api/products/${params.id}`, {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.message || "Failed to load product");
          return;
        }

        setProduct(data.product);
        setMessage("");
      } catch (error) {
        console.error("PRODUCT LOAD ERROR:", error);
        setMessage("Something went wrong");
      }
    }

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  async function openSellerChat() {
    if (openingChat || payViaMeetLoading || !product?.id) {
      return;
    }

    if (!currentUser) {
      router.push("/login");
      return;
    }

    try {
      setOpeningChat(true);

      const res = await fetch("/api/chat/open", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          action: "CHAT",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }

        alert(data.message || "Failed to open chat.");
        return;
      }

      if (!data.conversationId) {
        alert("Conversation could not be opened.");
        return;
      }

      router.push(`/chat/${data.conversationId}`);
    } catch (error) {
      console.error("OPEN CHAT ERROR:", error);
      alert("Failed to open chat.");
    } finally {
      setOpeningChat(false);
    }
  }

  async function requestPayViaMeet() {
    if (
      openingChat ||
      payViaMeetLoading ||
      !product?.id
    ) {
      return;
    }

    if (!currentUser) {
      router.push("/login");
      return;
    }

    try {
      setPayViaMeetLoading(true);

      const res = await fetch("/api/chat/open", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          action: "PAY_VIA_MEET",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }

        alert(
          data.message ||
            "Failed to send Pay via Meet interest."
        );
        return;
      }

      if (!data.conversationId) {
        alert("Conversation could not be opened.");
        return;
      }

      router.push(`/chat/${data.conversationId}`);
    } catch (error) {
      console.error(
        "PAY VIA MEET ERROR:",
        error
      );

      alert(
        "Failed to send Pay via Meet interest."
      );
    } finally {
      setPayViaMeetLoading(false);
    }
  }

  async function deleteListing() {
    if (!product?.id || deleting) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove this listing?"
    );

    if (!confirmed) return;

    try {
      setDeleting(true);

      const res = await fetch(
        "/api/products/delete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: product.id,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(
          data.message ||
            "Failed to remove listing."
        );
        return;
      }

      alert("Listing removed successfully.");
      router.push("/dashboard");
    } catch (error) {
      console.error(
        "DELETE LISTING ERROR:",
        error
      );

      alert("Failed to remove listing.");
    } finally {
      setDeleting(false);
    }
  }

  if (message) {
    return (
      <main className="min-h-screen bg-[#f8fafc] text-slate-950">
        <Navbar />

        <div className="px-6 py-20 text-center text-slate-500">
          {message}
        </div>
      </main>
    );
  }

  if (!product) return null;

  const isSeller =
    currentUser?.id === product.seller?.id;

  const isAdmin =
    currentUser?.role === "ADMIN";

  const image =
    product.imageUrls &&
    product.imageUrls.length > 0
      ? product.imageUrls[0]
      : "";

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      <Navbar />

      <section className="px-4 py-8 pb-28 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">

            {/* LEFT */}

            <div>
              <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <div className="aspect-square bg-slate-100">
                  {image ? (
                    <img
                      src={image}
                      alt={product.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-7xl">
                      🛍️
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-black">
                  Product Description
                </h2>

                <p className="mt-5 whitespace-pre-wrap leading-8 text-slate-600">
                  {product.description}
                </p>
              </div>
            </div>

            {/* RIGHT */}

            <div>
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                {/* Badges */}

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-green-100 px-4 py-2 text-xs font-black text-green-700">
                    {product.category}
                  </span>

                  <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-700">
                    {product.condition}
                  </span>

                  {product.seller?.studentVerified && (
                    <span className="rounded-full bg-blue-100 px-4 py-2 text-xs font-black text-blue-700">
                      Verified Student
                    </span>
                  )}

                  {product.status === "SOLD" && (
                    <span className="rounded-full bg-green-100 px-4 py-2 text-xs font-black text-green-700">
                      Sold
                    </span>
                  )}

                  {product.status === "REMOVED" && (
                    <span className="rounded-full bg-red-100 px-4 py-2 text-xs font-black text-red-700">
                      Removed
                    </span>
                  )}
                </div>

                <h1 className="mt-5 text-4xl font-black leading-tight">
                  {product.title}
                </h1>

                <div className="mt-5 flex items-end gap-3">
                  <p className="text-5xl font-black text-green-600">
                    ₹
                    {Number(
                      product.finalPrice ??
                        product.price
                    ).toLocaleString("en-IN")}
                  </p>

                  <span className="mb-1 font-semibold text-slate-400">
                    Campus Deal
                  </span>
                </div>

                {/* Seller */}

                <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-4">

                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-100 text-xl font-black text-green-700">
                      {product.seller?.name
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        "U"}
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-black">
                        {product.seller?.name ||
                          "Unknown"}
                      </h2>

                      <p className="truncate text-sm text-slate-500">
                        {product.seller?.college ||
                          "Campus"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* BUYER / GUEST ACTIONS */}

                {!isAdmin &&
                  !isSeller &&
                  product.status ===
                    "AVAILABLE" && (
                    <div className="mt-8 space-y-4">

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                        {/* CHAT */}

                        <button
                          type="button"
                          onClick={openSellerChat}
                          disabled={
                            openingChat ||
                            payViaMeetLoading
                          }
                          className="
                            w-full
                            rounded-full
                            bg-green-600
                            py-4
                            font-black
                            text-white
                            shadow-lg
                            shadow-green-100
                            transition
                            hover:bg-green-700
                            active:scale-[0.98]
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                          "
                        >
                          {openingChat
                            ? "Opening Chat..."
                            : "Chat with Seller"}
                        </button>

                        {/* PAY VIA MEET */}

                        <button
                          type="button"
                          onClick={
                            requestPayViaMeet
                          }
                          disabled={
                            openingChat ||
                            payViaMeetLoading
                          }
                          className="
                            w-full
                            rounded-full
                            border
                            border-green-200
                            bg-green-50
                            py-4
                            font-black
                            text-green-700
                            transition
                            hover:border-green-500
                            hover:bg-green-100
                            active:scale-[0.98]
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                          "
                        >
                          {payViaMeetLoading
                            ? "Sending Interest..."
                            : "Pay via Meet"}
                        </button>
                      </div>

                      <p className="text-center text-xs leading-5 text-slate-500">
                        Chat with the seller first,
                        agree on the product and
                        meeting point, then complete
                        the deal safely on campus.
                      </p>

                      <button
                        type="button"
                        className="w-full rounded-full border border-red-200 py-4 font-black text-red-600 transition hover:border-red-400 hover:bg-red-50"
                      >
                        Report Product
                      </button>
                    </div>
                  )}

                {/* SELLER CONTROLS */}

                {isSeller && (
                  <div className="mt-8 space-y-4">

                    {product.status ===
                      "AVAILABLE" && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/edit-product/${product.id}`
                            )
                          }
                          className="w-full rounded-full bg-slate-950 py-4 font-black text-white transition hover:bg-slate-800"
                        >
                          Edit Listing
                        </button>

                        <button
                          type="button"
                          onClick={
                            deleteListing
                          }
                          disabled={deleting}
                          className="w-full rounded-full bg-red-600 py-4 font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deleting
                            ? "Removing..."
                            : "Delete Listing"}
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        router.push("/chat")
                      }
                      className="w-full rounded-full bg-green-600 py-4 font-black text-white transition hover:bg-green-700"
                    >
                      Manage Conversations
                    </button>
                  </div>
                )}

                {/* ADMIN */}

                {isAdmin && (
                  <div className="mt-8 rounded-[2rem] border border-red-200 bg-red-50 p-5">
                    <h3 className="text-xl font-black text-red-700">
                      Admin Moderation Mode
                    </h3>

                    <p className="mt-3 leading-7 text-red-600">
                      Admins cannot buy, chat,
                      report, or directly edit
                      student products from the
                      public product page.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/admin/listings"
                        )
                      }
                      className="mt-5 w-full rounded-full border border-red-300 py-4 font-black text-red-600 transition hover:border-red-500"
                    >
                      Open Admin Moderation
                    </button>
                  </div>
                )}

                {/* SOLD */}

                {product.status ===
                  "SOLD" &&
                  !isAdmin && (
                    <div className="mt-8 rounded-[2rem] border border-green-200 bg-green-50 p-5">
                      <h3 className="text-xl font-black text-green-700">
                        ✅ Product Sold
                      </h3>

                      <div className="mt-4 space-y-2 text-green-700">
                        <p>
                          <strong>
                            Final Price:
                          </strong>{" "}
                          ₹
                          {Number(
                            product.finalPrice ??
                              product.price
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>

                        {product.soldAt && (
                          <p>
                            <strong>
                              Sold On:
                            </strong>{" "}
                            {new Date(
                              product.soldAt
                            ).toLocaleDateString(
                              "en-IN"
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                {/* REMOVED */}

                {product.status ===
                  "REMOVED" &&
                  !isAdmin && (
                    <div className="mt-8 rounded-[2rem] border border-red-200 bg-red-50 p-5">
                      <h3 className="text-xl font-black text-red-700">
                        Listing Removed
                      </h3>

                      <p className="mt-3 leading-7 text-red-600">
                        This product is no longer
                        available on Axyon.
                      </p>
                    </div>
                  )}
              </div>

              {/* SAFETY */}

              <div className="relative mt-5 overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.35),_transparent_40%)]" />

                <div className="relative">
                  <h3 className="text-2xl font-black">
                    Campus Safety Tips
                  </h3>

                  <ul className="mt-5 space-y-3 text-slate-300">
                    <li>
                      • Meet inside campus when
                      possible
                    </li>

                    <li>
                      • Verify the product before
                      payment
                    </li>

                    <li>
                      • Use Pay via Meet for campus
                      transactions
                    </li>

                    <li>
                      • Prefer verified student
                      accounts
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}