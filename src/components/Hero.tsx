"use client";

import { motion } from "framer-motion";

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const item = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Hero() {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={stagger}
      className="flex flex-col gap-6"
    >
      <motion.div variants={item} className="pill w-fit">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_2px_rgba(52,211,153,0.7)]" />
        <span>Taka Ticket · Open for projects</span>
      </motion.div>

      <motion.h1
        variants={item}
        className="text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]"
      >
        Wujudkan website yang
        <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-sky-300 bg-clip-text text-transparent">
          {" "}
          elegan & berkonversi
        </span>
        <span className="text-white">.</span>
      </motion.h1>

      <motion.p
        variants={item}
        className="max-w-xl text-base leading-relaxed text-white/70 sm:text-lg"
      >
        Ceritakan kebutuhan website Anda melalui form ringkas ini. Tim kami
        akan mempelajari detailnya dan menyiapkan arahan terbaik untuk tahap
        berikutnya.
      </motion.p>

      <motion.ul
        variants={item}
        className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2"
      >
        {[
          { t: "Desain Premium", d: "Glassmorphism, tipografi rapi, motion halus." },
          { t: "Performa Cepat", d: "Skor Lighthouse tinggi, SEO-friendly." },
          { t: "Stack Modern", d: "Next.js, TypeScript, Tailwind CSS." },
          { t: "Iterasi Cepat", d: "Komunikasi terbuka, milestone jelas." },
        ].map((f) => (
          <li
            key={f.t}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md"
          >
            <div className="text-sm font-semibold text-white">{f.t}</div>
            <div className="mt-1 text-xs leading-relaxed text-white/60">
              {f.d}
            </div>
          </li>
        ))}
      </motion.ul>

      <motion.div
        variants={item}
        className="mt-2 flex items-center gap-4 text-xs text-white/50"
      >
        <div className="flex -space-x-2">
          {["#a78bfa", "#f472b6", "#38bdf8"].map((c) => (
            <span
              key={c}
              className="h-7 w-7 rounded-full border border-ink-900"
              style={{ background: c }}
            />
          ))}
        </div>
        <span>
          Dipercaya oleh tim & founder dari berbagai industri kreatif & SaaS.
        </span>
      </motion.div>
    </motion.div>
  );
}
