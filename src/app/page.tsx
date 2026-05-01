import Image from "next/image";
import logo from "./logo.png";
import Hero from "@/components/Hero";
import RequestForm from "@/components/RequestForm";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <DecorativeBackdrop />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 sm:px-10">
        <div className="flex items-center gap-2.5">
          <Image
            src={logo}
            alt="Taka Ticket"
            width={48}
            height={48}
            priority
            className="h-12 w-12 rounded-xl shadow-lg shadow-fuchsia-500/20 ring-1 ring-white/10"
          />
          <span className="text-base font-semibold tracking-wide text-white">
            Taka Ticket
          </span>
        </div>
        <nav className="hidden items-center gap-7 text-sm text-white/60 sm:flex">
          <a className="transition hover:text-white" href="#layanan">
            Layanan
          </a>
          <a className="transition hover:text-white" href="#proses">
            Proses
          </a>
          <a
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-white/80 transition hover:bg-white/[0.08] hover:text-white"
            href="#request"
          >
            Mulai Project
          </a>
        </nav>
      </header>

      <section
        id="request"
        className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 px-6 pb-24 pt-8 sm:px-10 lg:grid-cols-2 lg:gap-14 lg:pt-16"
      >
        <Hero />
        <RequestForm />
      </section>

      <footer className="relative z-10 border-t border-white/[0.06] bg-black/20 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-6 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:px-10">
          <span>© {new Date().getFullYear()} Taka Ticket. All rights reserved.</span>
          <span className="font-mono">crafted with Next.js · Tailwind · Framer Motion</span>
        </div>
      </footer>
    </main>
  );
}

function DecorativeBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-0 overflow-hidden"
    >
      <div className="absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="absolute bottom-[-160px] right-[-120px] h-[360px] w-[420px] rounded-full bg-fuchsia-500/10 blur-[120px]" />
      <div className="absolute left-[-120px] top-1/3 h-[300px] w-[300px] rounded-full bg-sky-400/10 blur-[120px]" />
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.9) 30%, transparent 70%)",
        }}
      />
    </div>
  );
}
