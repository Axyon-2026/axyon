"use client";

import Navbar from "@/components/Navbar";

const notifications = [
  {
    title: "Welcome to Axyon",
    message:
      "Your campus ecosystem is ready to explore.",
    time: "Just now",
    icon: "🎉",
  },

  {
    title: "Realtime Chat Enabled",
    message:
      "You can now connect with buyers and sellers instantly.",
    time: "2 mins ago",
    icon: "💬",
  },

  {
    title: "Rentals Coming Soon",
    message:
      "Student rentals and barter systems are under development.",
    time: "Today",
    icon: "🔁",
  },
];

export default function NotificationsPage() {
  return (
    <main className="min-h-screen bg-[#071019] text-white">
      <Navbar />

      <section className="px-4 sm:px-6 lg:px-10 py-10 pb-28">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-green-400 text-sm font-black">
                Updates & Activity
              </p>

              <h1 className="mt-2 text-5xl font-black">
                Notifications
              </h1>
            </div>

            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-3xl">
              🔔
            </div>
          </div>

          <div className="mt-10 space-y-5">
            {notifications.map((item, index) => (
              <div
                key={index}
                className="
                  bg-white/[0.04]
                  border
                  border-white/10
                  rounded-[2rem]
                  p-6
                  backdrop-blur-xl
                  hover:border-green-500/30
                  transition
                "
              >
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-2xl shrink-0">
                    {item.icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-black">
                          {item.title}
                        </h2>

                        <p className="mt-2 text-slate-400 leading-7">
                          {item.message}
                        </p>
                      </div>

                      <p className="text-xs text-slate-500 whitespace-nowrap">
                        {item.time}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-[2rem] p-8 text-black shadow-[0_0_40px_rgba(34,197,94,0.35)]">
            <p className="text-sm font-black">
              COMING NEXT
            </p>

            <h2 className="mt-2 text-4xl font-black">
              Realtime Notifications
            </h2>

            <p className="mt-4 text-black/80 leading-7 max-w-2xl">
              Axyon will soon support live alerts for messages,
              orders, moderation actions, rentals, and barter requests.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}