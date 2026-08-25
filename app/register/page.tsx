"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useMemo, useRef, useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [college, setCollege] = useState("");
  const [otherCollege, setOtherCollege] = useState("");

  const [colleges, setColleges] = useState<any[]>([]);
  const [collegeSearch, setCollegeSearch] = useState("");
  const [collegeOpen, setCollegeOpen] = useState(false);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const collegeRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        collegeRef.current &&
        !collegeRef.current.contains(
          event.target as Node
        )
      ) {
        setCollegeOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const filteredColleges = useMemo(() => {
    const query = collegeSearch
      .trim()
      .toLowerCase();

    if (!query) {
      return colleges.slice(0, 30);
    }

    return colleges
      .filter((collegeItem) => {
        const name =
          collegeItem.name?.toLowerCase() || "";

        const city =
          collegeItem.city?.toLowerCase() || "";

        const state =
          collegeItem.state?.toLowerCase() || "";

        return (
          name.includes(query) ||
          city.includes(query) ||
          state.includes(query)
        );
      })
      .slice(0, 30);
  }, [colleges, collegeSearch]);

  function selectCollege(
    collegeName: string
  ) {
    setCollege(collegeName);
    setCollegeSearch(collegeName);
    setCollegeOpen(false);
    setOtherCollege("");
  }

  function selectOtherCollege() {
    setCollege("OTHER");
    setCollegeSearch("Other / My college is not listed");
    setCollegeOpen(false);
  }

  async function handleRegister(
    e: React.FormEvent
  ) {
    e.preventDefault();
    setMessage("");

    const finalCollege =
      college === "OTHER"
        ? otherCollege.trim()
        : college;

    if (
      !name ||
      !email ||
      !phone ||
      !finalCollege ||
      !password
    ) {
      setMessage("Please fill all fields");
      return;
    }

    if (
      !email.includes("@") ||
      !email.includes(".")
    ) {
      setMessage(
        "Please enter a valid email address"
      );
      return;
    }

    if (phone.length < 10) {
      setMessage(
        "Please enter a valid phone number"
      );
      return;
    }

    if (password.length < 6) {
      setMessage(
        "Password must be at least 6 characters"
      );
      return;
    }

    setMessage("Creating account...");

    try {
      const res = await fetch(
        "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            college: finalCollege,
            collegeRequest:
              college === "OTHER",
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.message ||
            "Registration failed"
        );
        return;
      }

      setMessage(
        "Account created successfully. Please check your email to verify your account."
      );

      setName("");
      setEmail("");
      setPhone("");
      setCollege("");
      setCollegeSearch("");
      setOtherCollege("");
      setPassword("");
    } catch {
      setMessage(
        "Something went wrong. Please try again."
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      <Navbar />

      <section className="min-h-[calc(100vh-90px)] px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-2">

          {/* LEFT SIDE */}

          <div className="hidden lg:block">
            <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-black text-green-700">
              Join Verified Campus Network
            </span>

            <h1 className="mt-6 text-6xl font-black leading-[0.95] tracking-tight">
              Start your campus marketplace journey.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
              Create your Axyon account, verify your student
              identity, and start buying or selling with trusted
              students from your college.
            </p>

            <div className="mt-8 max-w-lg space-y-4">
              {[
                "Verified student-first marketplace",
                "Safer chat between buyers and sellers",
                "Admin moderation for trust and reports",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 font-black text-green-700">
                    ✓
                  </span>

                  <p className="font-bold text-slate-700">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* REGISTER CARD */}

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="mb-8 text-center">
              <div className="mb-3 flex items-center justify-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.7)]" />

                <span className="text-3xl font-black tracking-tight">
                  AXYON
                </span>
              </div>

              <h1 className="text-3xl font-black">
                Create your account
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Join your verified student marketplace.
              </p>
            </div>

            <form
              onSubmit={handleRegister}
              className="space-y-4"
            >
              {/* NAME */}

              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="
                  w-full
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-100
                  px-5
                  py-4
                  outline-none
                  focus:border-green-500
                  focus:bg-white
                "
              />

              {/* EMAIL */}

              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="
                  w-full
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-100
                  px-5
                  py-4
                  outline-none
                  focus:border-green-500
                  focus:bg-white
                "
              />

              {/* PHONE */}

              <input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                className="
                  w-full
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-100
                  px-5
                  py-4
                  outline-none
                  focus:border-green-500
                  focus:bg-white
                "
              />

              {/* COLLEGE SEARCH */}

              <div
                ref={collegeRef}
                className="relative"
              >
                <label className="mb-2 block text-sm font-black text-slate-700">
                  College
                </label>

                <div className="relative">
                  <input
                    type="text"
                    value={collegeSearch}
                    placeholder="Search college, city or state..."
                    onFocus={() =>
                      setCollegeOpen(true)
                    }
                    onChange={(e) => {
                      setCollegeSearch(
                        e.target.value
                      );

                      setCollege("");

                      setOtherCollege("");

                      setCollegeOpen(true);
                    }}
                    className="
                      w-full
                      rounded-2xl
                      border
                      border-slate-200
                      bg-slate-100
                      px-5
                      py-4
                      pr-12
                      outline-none
                      transition
                      focus:border-green-500
                      focus:bg-white
                    "
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setCollegeOpen(
                        (prev) => !prev
                      )
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      flex
                      h-9
                      w-9
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-full
                      text-slate-500
                      hover:bg-slate-200
                    "
                  >
                    {collegeOpen ? "⌃" : "⌄"}
                  </button>
                </div>

                {/* DROPDOWN */}

                {collegeOpen && (
                  <div
                    className="
                      absolute
                      left-0
                      right-0
                      z-50
                      mt-2
                      overflow-hidden
                      rounded-2xl
                      border
                      border-slate-200
                      bg-white
                      shadow-2xl
                    "
                  >
                    <div className="max-h-72 overflow-y-auto overscroll-contain p-2">

                      {filteredColleges.length > 0 ? (
                        filteredColleges.map(
                          (collegeItem) => (
                            <button
                              key={
                                collegeItem.id
                              }
                              type="button"
                              onClick={() =>
                                selectCollege(
                                  collegeItem.name
                                )
                              }
                              className="
                                w-full
                                rounded-xl
                                px-4
                                py-3
                                text-left
                                transition
                                hover:bg-green-50
                              "
                            >
                              <p className="font-bold text-slate-900">
                                {
                                  collegeItem.name
                                }
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {
                                  collegeItem.city
                                }
                                {collegeItem.city &&
                                collegeItem.state
                                  ? ", "
                                  : ""}
                                {
                                  collegeItem.state
                                }
                              </p>
                            </button>
                          )
                        )
                      ) : (
                        <div className="px-4 py-6 text-center">
                          <p className="font-bold text-slate-700">
                            No college found
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Try another search or add your
                            college manually.
                          </p>
                        </div>
                      )}

                      {/* OTHER */}

                      <div className="mt-2 border-t border-slate-100 pt-2">
                        <button
                          type="button"
                          onClick={
                            selectOtherCollege
                          }
                          className="
                            w-full
                            rounded-xl
                            px-4
                            py-3
                            text-left
                            font-black
                            text-green-700
                            transition
                            hover:bg-green-50
                          "
                        >
                          + My college is not listed
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* SELECTED COLLEGE */}

                {college &&
                  college !== "OTHER" && (
                    <div className="mt-2 flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-green-700">
                          Selected college
                        </p>

                        <p className="truncate font-black text-green-900">
                          {college}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setCollege("");
                          setCollegeSearch("");
                        }}
                        className="ml-3 shrink-0 text-sm font-black text-green-700 hover:text-red-600"
                      >
                        Change
                      </button>
                    </div>
                  )}
              </div>

              {/* OTHER COLLEGE */}

              {college === "OTHER" && (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                  <p className="mb-3 text-sm font-black text-green-800">
                    College not listed?
                  </p>

                  <input
                    type="text"
                    placeholder="Enter your college name"
                    value={otherCollege}
                    onChange={(e) =>
                      setOtherCollege(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      rounded-2xl
                      border
                      border-green-200
                      bg-white
                      px-5
                      py-4
                      outline-none
                      focus:border-green-500
                    "
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setCollege("");
                      setCollegeSearch("");
                      setOtherCollege("");
                    }}
                    className="mt-3 text-sm font-black text-green-700 hover:text-red-600"
                  >
                    ← Choose from college list
                  </button>
                </div>
              )}

              {/* PASSWORD */}

              <div className="relative">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-100
                    px-5
                    py-4
                    pr-20
                    outline-none
                    focus:border-green-500
                    focus:bg-white
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="
                    absolute
                    right-5
                    top-4
                    text-sm
                    font-bold
                    text-slate-500
                    hover:text-green-600
                  "
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
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
                  active:scale-[0.99]
                "
              >
                Create Account
              </button>
            </form>

            {message && (
              <p className="mt-5 text-center text-sm font-semibold text-slate-600">
                {message}
              </p>
            )}

            <p className="mt-8 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-black text-green-600"
              >
                Login
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}