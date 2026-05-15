"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function StudentVerificationPage() {
  const [user, setUser] = useState<any>(null);
  const [collegeIdNumber, setCollegeIdNumber] = useState("");
  const [collegeIdImageUrl, setCollegeIdImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (!res.ok) {
        setMessage("Please login first.");
        return;
      }

      setUser(data.user);
      setCollegeIdNumber(data.user.collegeIdNumber || "");
      setCollegeIdImageUrl(data.user.collegeIdImageUrl || "");
      setMessage("");
    }

    fetchUser();
  }, []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage("Uploading ID image...");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "Upload failed");
      setUploading(false);
      return;
    }

    setCollegeIdImageUrl(data.imageUrl);
    setMessage("ID image uploaded successfully.");
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!collegeIdNumber || !collegeIdImageUrl) {
      setMessage("Please add college ID number and upload ID image.");
      return;
    }

    setMessage("Submitting verification...");

    const res = await fetch("/api/student-verification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        collegeIdNumber,
        collegeIdImageUrl,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "Verification submission failed");
      return;
    }

    setMessage("Verification submitted successfully. Admin will review it.");
    setUser(data.user);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="flex items-center justify-center py-16 px-6">
        <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h1 className="text-3xl font-bold">Student Verification</h1>

          <p className="mt-3 text-slate-400">
            Upload your college ID to verify that you are a real student.
          </p>

          {user && (
            <div className="mt-6 bg-slate-950 border border-slate-800 rounded-2xl p-5">
              <p>Email: {user.email}</p>
              <p className="mt-2">College: {user.college || "Not added"}</p>
              <p className="mt-2">
                Status:{" "}
                <span
                  className={
                    user.studentVerificationStatus === "APPROVED"
                      ? "text-green-400"
                      : user.studentVerificationStatus === "REJECTED"
                      ? "text-red-400"
                      : user.studentVerificationStatus === "PENDING"
                      ? "text-yellow-400"
                      : "text-slate-400"
                  }
                >
                  {user.studentVerificationStatus || "NOT_SUBMITTED"}
                </span>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <input
              type="text"
              placeholder="College ID / Roll Number"
              value={collegeIdNumber}
              onChange={(e) => setCollegeIdNumber(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none"
            />

            <div className="border border-dashed border-slate-700 rounded-2xl p-6">
              <label className="block text-sm text-slate-300 mb-4">
                Upload College ID Card Image
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("college-id-camera")?.click()
                  }
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-xl font-medium"
                >
                  Open Camera
                </button>

                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("college-id-file")?.click()
                  }
                  className="border border-slate-700 hover:border-slate-500 px-4 py-3 rounded-xl font-medium"
                >
                  Choose From Files
                </button>
              </div>

              <input
                id="college-id-camera"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
              />

              <input
                id="college-id-file"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {uploading && (
                <p className="mt-4 text-sm text-blue-400">Uploading...</p>
              )}

              {collegeIdImageUrl && (
                <div className="mt-5">
                  <img
                    src={collegeIdImageUrl}
                    alt="College ID"
                    className="w-full max-h-80 object-cover rounded-xl border border-slate-700"
                  />
                </div>
              )}
            </div>

            <button
              disabled={uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-medium disabled:opacity-60"
            >
              Submit Verification
            </button>
          </form>

          {message && <p className="mt-5 text-sm text-slate-300">{message}</p>}
        </div>
      </section>
    </main>
  );
}