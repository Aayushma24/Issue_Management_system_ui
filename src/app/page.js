"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { homeRouteFor } from "@/lib/navbarnavigation";

const STATUSES = ["OPEN", "ASSIGNED", "IN PROGRESS", "RESOLVED", "CLOSED"];

const SAMPLE_TICKETS = [
  { id: "No. 0042", title: "Login fails on mobile after password reset" },
  { id: "No. 0057", title: "Dashboard avatar doesn't load for new users" },
  { id: "No. 0063", title: "Checkout button unresponsive on Safari" },
];

/**
 * HomePage — route "/"
 *
 * Public landing page: hero copy, an animated ticket stub that cycles through
 * the status pipeline, role explainer cards, and sign-in / register links.
 * Signed-in visitors are redirected straight to their role's home page.
 *
 * STATUS: USED — this is the app's entry route and the only path to
 * /login and /register for a new visitor.
 */
export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [statusIndex, setStatusIndex] = useState(0);
  const [ticketIndex, setTicketIndex] = useState(0);

  useEffect(() => {
    if (!loading && user) {
      router.push(homeRouteFor(user.role));
    }
  }, [user, loading, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => {
        if (prev === STATUSES.length - 1) {
          setTicketIndex((t) => (t + 1) % SAMPLE_TICKETS.length);
          return 0;
        }
        return prev + 1;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="loading-screen">Loading…</div>;
  }

  if (user) {
    return null;
  }

  const activeTicket = SAMPLE_TICKETS[ticketIndex];

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <span className="logo-tag">IMS</span>
        <div className="nav-links">
          <Link href="/login" className="btn btn-ghost" prefetch={false}>
            Sign In
          </Link>
          <Link href="/register" className="btn btn-primary">
            Open an Account
          </Link>
        </div>
      </nav>

      <main className="hero">
        <div className="hero-copy">
          <span className="eyebrow">FORMERLY: STICKY NOTES &amp; SPREADSHEETS</span>
          <h1>
            Every ticket,<br />followed to <span className="wavy">closure.</span>
          </h1>
          <p className="hero-subtitle">
            Report a problem once. It gets logged, assigned, worked,
            verified, and closed — with a paper trail you can actually read.
          </p>
          <div className="hero-actions">
            <Link href="/register" className="btn btn-primary large" prefetch={false}>
              Open an Account
            </Link>
            <Link href="/login" className="btn btn-ghost large" prefetch={false}>
              Sign In Instead
            </Link>
          </div>
        </div>

        <div className="ticket-stub">
          <div className="stub-left">
            <span className="stub-label">TICKET</span>
            <span className="stub-id">{activeTicket.id}</span>
          </div>
          <div className="stub-divider" />
          <div className="stub-right">
            <p className="stub-title">{activeTicket.title}</p>
            <div className="stub-trail">
              {STATUSES.map((s, i) => (
                <span
                  key={s}
                  className={
                    "trail-dot" + (i <= statusIndex ? " trail-dot--done" : "")
                  }
                />
              ))}
            </div>
            <div className="stamp-wrap">
              <span key={statusIndex} className={`stamp stamp-${statusIndex}`}>
                {STATUSES[statusIndex]}
              </span>
            </div>
          </div>
        </div>
      </main>

      <section className="roles">
        <div className="folder-card folder-card--reporter">
          <span className="folder-tab">REPORTER</span>
          <h3>Log it, then let it go.</h3>
          <p>File a ticket with a title, description, and category — no more forgotten hallway conversations.</p>
        </div>
        <div className="folder-card folder-card--team">
          <span className="folder-tab">TEAM</span>
          <h3>Pick it up, work it, close it out.</h3>
          <p>See what's assigned to your team, leave investigation notes, and mark it fixed.</p>
        </div>
        <div className="folder-card folder-card--admin">
          <span className="folder-tab">ADMIN</span>
          <h3>Route it, check it, sign off.</h3>
          <p>Assign tickets to the right team, verify the fix, and close the case.</p>
        </div>
      </section>

      <footer className="landing-footer">
        Case log maintained by the Issue Management System — a minor project.
      </footer>
    </div>
  );
}