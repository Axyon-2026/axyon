"use client";

import Navbar from "@/components/Navbar";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [message, setMessage] = useState("Loading product...");

  useEffect(() => {
    async function fetchData() {
      try {
        const productRes = await fetch(`/api/products/${id}`);
        const productData = await productRes.json();

        if (!productRes.ok) {
          setMessage(productData.message || "Product not found");
          return;
        }

        setProduct(productData.product);

        if (productData.product.imageUrls?.length > 0) {
          setSelectedImage(productData.product.imageUrls[0]);
        }

        const userRes = await fetch("/api/auth/me");

        if (userRes.ok) {
          const userData = await userRes.json();
          setCurrentUser(userData.user);
        }

        setMessage("");
      } catch {
        setMessage("Failed to load product");
      }
    }

    if (id) fetchData();
  }, [id]);

  async function handleChat() {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sellerId: product.seller.id,
          productId: product.id,
          text: "Hi, I am interested in this product.",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to start chat");
        return;
      }

      window.location.href = "/chat";
    } catch {
      alert("Something went wrong");
    }
  }

  async function handleDelete() {
    const confirmed = confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    const res = await fetch(`/api/products/${product.id}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to delete product");
      return;
    }

    alert("Product deleted successfully");
    window.location.href = "/marketplace";
  }

  async function handleReportProduct() {
    const reason = prompt("Why are you reporting this product?");

    if (!reason || reason.trim().length < 5) {
      alert("Please enter a valid report reason.");
      return;
    }

    const res = await fetch("/api/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        targetType: "PRODUCT",
        targetId: product.id,
        reason: reason.trim(),
        details: `Reported product: ${product.title}`,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to submit report");
      return;
    }

    alert("Product reported successfully. Admin will review it.");
  }

  const isSeller = currentUser?.id === product?.seller?.id;
  const isAdmin = currentUser?.role === "ADMIN";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="px-8 py-12">
        {message && <p className="text-slate-400">{message}</p>}

        {product && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="h-[500px] bg-slate-800 flex items-center justify-center">
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <p className="text-slate-500">No Image</p>
                  )}
                </div>
              </div>

              {product.imageUrls?.length > 1 && (
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {product.imageUrls.map((image: string, index: number) => (
                    <button
                      key={image}
                      onClick={() => setSelectedImage(image)}
                      className={`border rounded-xl overflow-hidden h-24 ${
                        selectedImage === image
                          ? "border-blue-500"
                          : "border-slate-700"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <h1 className="text-4xl font-bold">{product.title}</h1>

              <p className="mt-4 text-3xl font-bold text-blue-400">
                ₹{product.price}
              </p>

              <p className="mt-6 text-slate-300 leading-7">
                {product.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <span className="bg-slate-800 px-4 py-2 rounded-full">
                  {product.category}
                </span>

                <span className="bg-slate-800 px-4 py-2 rounded-full">
                  {product.condition}
                </span>

                <span className="bg-green-900/40 text-green-300 px-4 py-2 rounded-full">
                  {product.status}
                </span>
              </div>

              <div className="mt-8 border-t border-slate-800 pt-6">
                <h2 className="text-xl font-semibold">Seller Details</h2>

                <p className="mt-3 text-slate-300">
                  Name: {product.seller?.name}
                </p>

                <p className="text-slate-300">
                  College: {product.seller?.college || "Not added"}
                </p>
              </div>

              <div className="mt-8">
                {isSeller ? (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href={`/edit-product/${product.id}`}
                      className="text-center bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-medium"
                    >
                      Edit Product
                    </a>

                    <button
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-medium"
                    >
                      Delete Product
                    </button>
                  </div>
                ) : isAdmin ? (
                  <div className="bg-purple-900/30 border border-purple-700 rounded-2xl p-5">
                    <p className="text-purple-300 font-medium">
                      Admin view only. Admins cannot buy, chat, or report products.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a
                      href={`/buy/${product.id}`}
                      className="text-center bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-medium"
                    >
                      Buy Now
                    </a>

                    <button
                      onClick={handleChat}
                      className="border border-slate-700 hover:border-slate-500 px-6 py-3 rounded-xl font-medium"
                    >
                      Chat with Seller
                    </button>

                    <button
                      onClick={handleReportProduct}
                      className="border border-red-500 text-red-400 hover:bg-red-500 hover:text-white px-6 py-3 rounded-xl font-medium"
                    >
                      Report Product
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}