"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function CreateProductPage() {
  const [user, setUser] = useState<any>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/auth/me");

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    }

    fetchUser();
  }, []);

  async function compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");

        const maxWidth = 1200;
        const scale = Math.min(maxWidth / img.width, 1);

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Image compression failed"));
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Image compression failed"));
              return;
            }

            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, ".jpg"),
              {
                type: "image/jpeg",
                lastModified: Date.now(),
              }
            );

            resolve(compressedFile);
          },
          "image/jpeg",
          0.75
        );
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;

    if (!files || files.length === 0) return;

    setUploading(true);
    setMessage("Uploading image...");

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const compressedFile = await compressImage(file);

        const formData = new FormData();
        formData.append("file", compressedFile);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.message || "Image upload failed");
          setUploading(false);
          return;
        }

        uploadedUrls.push(data.imageUrl);
      }

      setImageUrls((prev) => [...prev, ...uploadedUrls]);
      setMessage("Image uploaded successfully.");
    } catch {
      setMessage("Image upload failed. Try choosing from files instead.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (user?.role === "ADMIN") {
      setMessage("Admins cannot list marketplace products.");
      return;
    }

    if (!title || !description || !price || !category || !condition) {
      setMessage("Please fill all required fields.");
      return;
    }

    setSubmitting(true);
    setMessage("Listing product...");

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          price,
          category,
          condition,
          imageUrls,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessage = data.message || "Failed to create product";

        setMessage(errorMessage);

        if (
          errorMessage.toLowerCase().includes("student verification") ||
          errorMessage.toLowerCase().includes("complete student verification")
        ) {
          setTimeout(() => {
            window.location.href = "/student-verification";
          }, 1500);
        }

        setSubmitting(false);
        return;
      }

      setMessage("Product listed successfully.");
      window.location.href = "/marketplace";
    } catch {
      setMessage("Something went wrong while listing product.");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h1 className="text-4xl font-bold">List a Product</h1>

          <p className="mt-3 text-slate-400">
            Add product details and upload images for your marketplace listing.
          </p>

          {user?.role === "ADMIN" && (
            <div className="mt-6 bg-purple-900/30 border border-purple-700 rounded-2xl p-5">
              <p className="text-purple-300 font-medium">
                Admin accounts cannot create marketplace listings.
              </p>
            </div>
          )}

          {user &&
            user.role !== "ADMIN" &&
            user.studentVerificationStatus !== "APPROVED" && (
              <div className="mt-6 bg-yellow-900/30 border border-yellow-700 rounded-2xl p-5">
                <p className="text-yellow-300 font-medium">
                  Student verification is required before listing products.
                </p>

                <a
                  href="/student-verification"
                  className="inline-block mt-4 bg-yellow-600 hover:bg-yellow-700 px-5 py-3 rounded-xl font-medium"
                >
                  Verify Student ID
                </a>
              </div>
            )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <input
              type="text"
              placeholder="Product title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none"
            />

            <textarea
              placeholder="Product description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none"
            />

            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none"
            >
              <option value="">Select category</option>
              <option value="Books">Books</option>
              <option value="Electronics">Electronics</option>
              <option value="Notes">Notes</option>
              <option value="Furniture">Furniture</option>
              <option value="Cycle">Cycle</option>
              <option value="Accessories">Accessories</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none"
            >
              <option value="">Select condition</option>
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Used">Used</option>
              <option value="Old">Old</option>
            </select>

            <div className="border border-dashed border-slate-700 rounded-2xl p-6">
              <p className="text-slate-300 font-medium">Product Images</p>

              <p className="mt-2 text-sm text-slate-500">
                Camera images will be compressed automatically before upload.
              </p>

              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("product-camera")?.click()
                  }
                  className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-medium"
                >
                  Open Camera
                </button>

                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("product-file")?.click()
                  }
                  className="border border-slate-700 hover:border-slate-500 px-5 py-3 rounded-xl font-medium"
                >
                  Choose From Files
                </button>
              </div>

              <input
                id="product-camera"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
              />

              <input
                id="product-file"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />

              {uploading && (
                <p className="mt-4 text-sm text-blue-400">
                  Uploading compressed image...
                </p>
              )}

              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-5">
                  {imageUrls.map((url) => (
                    <div
                      key={url}
                      className="relative rounded-xl overflow-hidden border border-slate-700"
                    >
                      <img
                        src={url}
                        alt="Product"
                        className="w-full h-40 object-cover"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setImageUrls((prev) =>
                            prev.filter((image) => image !== url)
                          )
                        }
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 px-3 py-1 rounded-lg text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              disabled={uploading || submitting || user?.role === "ADMIN"}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-medium disabled:opacity-60"
            >
              {submitting ? "Listing..." : "List Product"}
            </button>
          </form>

          {message && <p className="mt-5 text-sm text-slate-300">{message}</p>}
        </div>
      </section>
    </main>
  );
}