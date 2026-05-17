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
      try {
        const res = await fetch("/api/colleges");
        const data = await res.json();
        setColleges(data.colleges || []);
      } catch {
        setColleges([]);
      }
    }

    fetchColleges();
  }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const finalCollege = college === "OTHER" ? otherCollege.trim() : college;

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

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    setMessage("Creating account...");

    try {
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
    } catch {
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      <Navbar />

      <section className="min-h-[calc(100vh-90px)] px-4 sm:px-6 lg:px-10 py-10 flex items-center">
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="hidden lg:block">
            <span className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full text-xs font-black">
              Join Verified Campus Network
            </span>

            <h1 className="mt-6 text-6xl font-black leading-[0.95] tracking-tight">
              Start your campus marketplace journey.
            </h1>

            <p className="mt-6 text-lg text-slate-600 max-w-lg leading-8">
              Create your Axyon account, verify your student identity, and start
              buying or selling with trusted students from your college.
            </p>

            <div className="mt-8 space-y-4 max-w-lg">
              {[
                "Verified student-first marketplace",
                "Safer chat between buyers and sellers",
                "Admin moderation for trust and reports",
              ].map((item) => (
                <div
                  key={item}
                  className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm"
                >
                  <span className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-black">
                    ✓
                  </span>

                  <p className="font-bold text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2rem] shadow-xl p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.7)]" />
                <span className="font-black text-3xl tracking-tight">
                  AXYON
                </span>
              </div>

              <h1 className="text-3xl font-black">Create your account</h1>

              <p className="mt-2 text-sm text-slate-500">
                Join your verified student marketplace.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-slate-100 border border-slate-200 outline-none focus:bg-white focus:border-green-500"
              />

              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-slate-100 border border-slate-200 outline-none focus:bg-white focus:border-green-500"
              />

              <input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-slate-100 border border-slate-200 outline-none focus:bg-white focus:border-green-500"
              />

              <select
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl bg-slate-100 border border-slate-200 outline-none focus:bg-white focus:border-green-500 text-slate-700"
              >
                <option value="">Select your college</option>

                {colleges.map((collegeItem) => (
                  <option key={collegeItem.id} value={collegeItem.name}>
                    {collegeItem.name} - {collegeItem.city},{" "}
                    {collegeItem.state}
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
                  className="w-full px-5 py-4 rounded-2xl bg-slate-100 border border-slate-200 outline-none focus:bg-white focus:border-green-500"
                />
              )}

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 pr-20 rounded-2xl bg-slate-100 border border-slate-200 outline-none focus:bg-white focus:border-green-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-4 text-sm font-bold text-slate-500 hover:text-green-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-full font-black shadow-lg shadow-green-100">
                Create Account
              </button>
            </form>

            {message && (
              <p className="mt-5 text-sm font-semibold text-slate-600 text-center">
                {message}
              </p>
            )}

            <p className="mt-8 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <a href="/login" className="text-green-600 font-black">
                Login
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}