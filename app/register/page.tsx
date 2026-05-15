"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [otherCollege, setOtherCollege] = useState("");
  const [colleges, setColleges] = useState<any[]>([]);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchColleges() {
      const res = await fetch("/api/colleges");
      const data = await res.json();
      setColleges(data.colleges || []);
    }

    fetchColleges();
  }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const finalCollege =
      college === "OTHER" ? otherCollege.trim() : college;

    if (!name || !email || !phone || !finalCollege || !password) {
      setMessage("Please fill all fields");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setMessage("Please enter a valid email address");
      return;
    }

    if (phone.length < 10) {
      setMessage("Please enter a valid phone number");
      return;
    }

    setMessage("Creating account...");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        college: finalCollege,
        collegeRequest: college === "OTHER",
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "Registration failed");
      return;
    }

    setMessage(
      "Account created successfully. Please check your email to verify your account."
    );

    setName("");
    setEmail("");
    setPhone("");
    setCollege("");
    setOtherCollege("");
    setPassword("");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <section className="flex items-center justify-center py-20 px-6">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h1 className="text-3xl font-bold mb-6">Create Account</h1>

          <form onSubmit={handleRegister} className="space-y-5">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none"
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none"
            />

            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none"
            />

            <select
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none text-white"
            >
              <option value="">Select your college</option>

              {colleges.map((collegeItem) => (
                <option key={collegeItem.id} value={collegeItem.name}>
                  {collegeItem.name} - {collegeItem.city}, {collegeItem.state}
                </option>
              ))}

              <option value="OTHER">Other / My college is not listed</option>
            </select>

            {college === "OTHER" && (
              <input
                type="text"
                placeholder="Enter your college name"
                value={otherCollege}
                onChange={(e) => setOtherCollege(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 outline-none"
              />
            )}

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-20 rounded-xl bg-slate-800 border border-slate-700 outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3 text-sm text-slate-400 hover:text-white"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-medium">
              Create Account
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