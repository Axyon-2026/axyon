"use client";

import Navbar from "@/components/Navbar";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("Loading product...");

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();

        if (!res.ok) {
          setMessage(data.message || "Product not found");
          return;
        }

        const product = data.product;

        setTitle(product.title);
        setDescription(product.description);
        setPrice(product.price.toString());
        setCategory(product.category);
        setCondition(product.condition);
        setImageUrls(product.imageUrls || []);
        setMessage("");
      } catch {
        setMessage("Failed to load product");
      }
    }

    if (id) fetchProduct();
  }, [id]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;

    if (!files || files.length === 0) return;

    setUploading(true);
    setMessage("Uploading images...");

    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

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
    setUploading(false);
    setMessage("Images uploaded successfully!");

    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (imageUrls.length === 0) {
      setMessage("Please upload at least one image");
      return;
    }

    setMessage("Updating product...");

    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
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
      setMessage(data.message || "Failed to update product");
      return;
    }

    setMessage("Product updated successfully!");

    setTimeout(() => {
      window.location.href = `/product/${id}`;
    }, 1000);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="flex items-center justify-center py-16 px-6">
        <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h1 className="text-3xl font-bold mb-2">Edit Product</h1>
          <p className="text-slate-400 mb-8">
            Update your marketplace listing images and details.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
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
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none"
            />

            <input
              type="number"
              placeholder="Price in ₹"
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
              <option value="Notes">Notes</option>
              <option value="Electronics">Electronics</option>
              <option value="Furniture">Furniture</option>
              <option value="Hostel Items">Hostel Items</option>
              <option value="Vehicles">Vehicles</option>
              <option value="Others">Others</option>
            </select>

            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none"
            >
              <option value="">Select condition</option>
              <option value="New">New</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Used">Used</option>
            </select>

            <div className="border border-dashed border-slate-700 rounded-2xl p-6">
              <label className="block text-sm text-slate-300 mb-4">
                Upload Product Images
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("edit-camera-upload")?.click()
                  }
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-xl font-medium"
                >
                  Open Camera
                </button>

                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("edit-file-upload")?.click()
                  }
                  className="border border-slate-700 hover:border-slate-500 px-4 py-3 rounded-xl font-medium"
                >
                  Choose From Files
                </button>
              </div>

              <input
                id="edit-camera-upload"
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />

              <input
                id="edit-file-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />

              {uploading && (
                <p className="mt-4 text-blue-400 text-sm">
                  Uploading images...
                </p>
              )}

              {imageUrls.length > 0 && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imageUrls.map((url) => (
                    <div key={url} className="relative">
                      <img
                        src={url}
                        alt="Preview"
                        className="w-full h-40 object-cover rounded-xl border border-slate-700"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setImageUrls((prev) =>
                            prev.filter((item) => item !== url)
                          )
                        }
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded-lg"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              disabled={uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-medium disabled:opacity-60"
            >
              {uploading ? "Uploading..." : "Update Product"}
            </button>
          </form>

          {message && (
            <p className="mt-5 text-sm text-slate-300">{message}</p>
          )}
        </div>
      </section>
    </main>
  );
}