"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { navigationList, homeRouteFor } from "@/lib/navbarnavigation";

/**
 * Navbar
 *
 * Top header for signed-in users: brand link, role-filtered nav links with the
 * current route highlighted, the user's name/role pill, and a sign-out button.
 * Renders nothing when there is no user, so it is safe to mount on public pages.
 *
 * STATUS: USED — by /dashboard, /my-issues, /report and /profile. The links and
 * the brand target come from src/lib/navbarnavigation.js, so a reporter never
 * sees a dashboard entry and the logo takes them to /my-issues instead.
 */
export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const links = navigationList.filter((item) => item.roles.includes(user.role));

  return (
    <header className="dash-header">
      <Link href={homeRouteFor(user.role)} className="logo-tag">
        IMS
      </Link>

      <nav className="dash-nav">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={
              pathname === item.href
                ? "dash-nav-link dash-nav-link--active"
                : "dash-nav-link"
            }
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="dash-header-right">
        <div className="dash-user">
          <span className="dash-user-name">{user.fullName}</span>
          <span className={`role-pill role-pill--${user.role}`}>
            {user.role.toUpperCase()}
          </span>
        </div>
        <button onClick={logout} className="btn btn-ghost">
          Sign Out
        </button>
      </div>
    </header>
  );
}
