"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ProductDetailPage() {
  const params = useParams();

  const [product, setProduct] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [message, setMessage] = useState("Loading product...");
  const [chatMessage, setChatMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [showDealModal, setShowDealModal] = useState(false);

const [finalPrice, setFinalPrice] = useState("");

const [paymentMethod, setPaymentMethod] =
  useState("Pay via Meet");

  useEffect(() => {
    async function fetchData() {
      try {
        const userRes = await fetch("/api/auth/me");

        if (userRes.ok) {
          const userData = await userRes.json();
          setCurrentUser(userData.user);
        }

        const res = await fetch(`/api/products/${params.id}`);
        const data = await res.json();

        if (!res.ok) {
          setMessage(data.message || "Failed to load product");
          return;
        }

        setProduct(data.product);
        setMessage("");
      } catch {
        setMessage("Something went wrong");
      }
    }

    fetchData();
  }, [params.id]);

  async function sendMessage() {
    if (!chatMessage.trim() || !product) return;

    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sellerId: product.seller.id,
          productId: product.id,
          text: chatMessage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to send message");
        setSending(false);
        return;
      }

      setChatMessage("");
      alert("Message sent successfully!");
    } catch {
      alert("Failed to send message");
    }

    setSending(false);
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

  const isSeller = currentUser?.id === product.seller?.id;
  const isAdmin = currentUser?.role === "ADMIN";

  const image =
    product.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls[0]
      : "";

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      <Navbar />

      <section className="px-4 sm:px-6 lg:px-10 py-8 pb-28">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">

            <div>
              <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
                <div className="aspect-square bg-slate-100">

                  {image ? (
                    <img
                      src={image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-7xl">
                      🛍️
                    </div>
                  )}

                </div>
              </div>

              <div className="mt-5 bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm">

                <h2 className="text-2xl font-black">
                  Product Description
                </h2>

                <p className="mt-5 text-slate-600 leading-8 whitespace-pre-wrap">
                  {product.description}
                </p>

              </div>
            </div>

            <div>

              <div className="bg-white border border-slate-200 rounded-[2rem] p-6 sm:p-8 shadow-sm">

                <div className="flex flex-wrap gap-2">

                  <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-xs font-black">
                    {product.category}
                  </span>

                  <span className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-xs font-black">
                    {product.condition}
                  </span>

                  {product.seller?.studentVerified && (
                    <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-xs font-black">
                      Verified Student
                    </span>
                  )}

                  {product.status === "REMOVED" && (
                    <span className="bg-red-100 text-red-700 px-4 py-2 rounded-full text-xs font-black">
                      Removed
                    </span>
                  )}

                </div>

                <h1 className="mt-5 text-4xl font-black leading-tight">
                  {product.title}
                </h1>

                <div className="mt-5 flex items-end gap-3">

                  <p className="text-5xl font-black text-green-600">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                  </p>

                  <span className="text-slate-400 font-semibold mb-1">
                    Campus Deal
                  </span>

                </div>

                <div className="mt-8 bg-slate-50 border border-slate-200 rounded-3xl p-5">

                  <div className="flex items-center gap-4">

                    <div className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-black text-xl">
                      {product.seller?.name?.charAt(0) || "U"}
                    </div>

                    <div>

                      <h2 className="font-black text-lg">
                        {product.seller?.name || "Unknown"}
                      </h2>

                      <p className="text-sm text-slate-500">
                        {product.seller?.college || "Campus"}
                      </p>

                    </div>
                  </div>
                </div>

                {!isAdmin && !isSeller && product.status !== "REMOVED" && (

                  <div className="mt-8 space-y-4">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      <button
                        onClick={() => {
                          document
                            .getElementById("message-box")
                            ?.scrollIntoView({
                              behavior: "smooth",
                            });
                        }}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-full font-black shadow-lg shadow-green-100"
                      >
                        Chat with Seller
                      </button>

                      <button
                      onClick={() => {
                        document
                          .getElementById("message-box")
                          ?.scrollIntoView({
                            behavior: "smooth",
                          });
                    
                        setChatMessage(
                          `Hi, I am interested in "${product.title}". Can we meet on campus for payment and pickup?`
                        );
                      }}
                      className="w-full border border-green-200 hover:border-green-500 text-green-700 py-4 rounded-full font-black bg-green-50"
                    >
                      Pay via Meet
                    </button>

                    </div>

                    <div
                      id="message-box"
                      className="bg-slate-50 border border-slate-200 rounded-[2rem] p-5"
                    >

                      <h3 className="font-black text-lg">
                        Message Seller
                      </h3>

                      <textarea
                        rows={4}
                        placeholder="Ask about condition, pickup, availability..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        className="w-full mt-4 px-5 py-4 rounded-2xl bg-white border border-slate-200 outline-none resize-none focus:border-green-500"
                      />

                      <button
                        onClick={sendMessage}
                        disabled={sending}
                        className="w-full mt-4 bg-slate-950 hover:bg-slate-800 text-white py-4 rounded-full font-black disabled:opacity-60"
                      >
                        {sending ? "Sending..." : "Send Message"}
                      </button>

                    </div>

                    <button className="w-full border border-red-200 hover:border-red-400 text-red-600 py-4 rounded-full font-black">
                      Report Product
                    </button>

                  </div>
                )}

                {isSeller && (
  <div className="mt-8 space-y-4">

    <a
      href={`/edit-product/${product.id}`}
      className="block text-center bg-slate-950 hover:bg-slate-800 text-white py-4 rounded-full font-black"
    >
      Edit Listing
    </a>

    <button
  onClick={() => setShowDealModal(true)}
  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-full font-black"
>
  Complete Deal
</button>

  </div>
)}

                {isAdmin && (
                  <div className="mt-8 bg-red-50 border border-red-200 rounded-[2rem] p-5">

                    <h3 className="text-xl font-black text-red-700">
                      Admin Moderation Mode
                    </h3>

                    <p className="mt-3 text-red-600 leading-7">
                      Admins cannot buy, chat, report, or directly edit student
                      products from the public product page.
                    </p>

                    <a
                      href="/admin/listings"
                      className="block text-center mt-5 border border-red-300 hover:border-red-500 text-red-600 py-4 rounded-full font-black"
                    >
                      Open Admin Moderation
                    </a>

                  </div>
                )}

                {product.status === "REMOVED" && !isAdmin && (
                  <div className="mt-8 bg-red-50 border border-red-200 rounded-[2rem] p-5">

                    <h3 className="text-xl font-black text-red-700">
                      Listing Removed
                    </h3>

                    <p className="mt-3 text-red-600 leading-7">
                      This product is no longer available on Axyon.
                    </p>

                  </div>
                )}

              </div>

              <div className="mt-5 bg-slate-950 text-white rounded-[2rem] p-6 overflow-hidden relative">

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.35),_transparent_40%)]" />

                <div className="relative">

                  <h3 className="text-2xl font-black">
                    Campus Safety Tips
                  </h3>

                  <ul className="mt-5 space-y-3 text-slate-300">

                    <li>• Meet inside campus when possible</li>

                    <li>• Verify product before payment</li>

                    <li>• Use Pay via Meet for safer campus transactions</li>

                    <li>• Use verified student accounts</li>

                  </ul>

                </div>
              </div>

            </div>
          </div>
        </div>


      {showDealModal && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

    <div className="bg-white rounded-[2rem] p-8 w-[95%] max-w-md">

      <h2 className="text-3xl font-black">
        Complete Deal
      </h2>

      <p className="mt-2 text-slate-500">
        Original Price: ₹{product.price}
      </p>

      <div className="mt-6">

        <label className="font-black">
          Final Selling Price
        </label>

        <input
          type="number"
          value={finalPrice}
          onChange={(e) =>
            setFinalPrice(e.target.value)
          }
          className="mt-2 w-full px-5 py-4 rounded-2xl border border-slate-300"
        />

      </div>

      <div className="mt-6">

        <label className="font-black">
          Payment Method
        </label>

        <select
          value={paymentMethod}
          onChange={(e) =>
            setPaymentMethod(e.target.value)
          }
          className="mt-2 w-full px-5 py-4 rounded-2xl border border-slate-300"
        >
          <option>Pay via Meet</option>
          <option>Cash</option>
          <option>UPI</option>
        </select>

      </div>

      <div className="mt-8 flex gap-3">

        <button
          onClick={() =>
            setShowDealModal(false)
          }
          className="flex-1 border py-4 rounded-full font-black"
        >
          Cancel
        </button>

        <button
          className="flex-1 bg-green-600 text-white py-4 rounded-full font-black"
        >
          Continue
        </button>

      </div>

    </div>

  </div>
)}  
      </section>
    </main>
  );
}