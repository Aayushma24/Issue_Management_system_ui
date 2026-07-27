/**
 * Navigation for signed-in users, in one place.
 *
 * `navigationList` holds every destination with the roles allowed to see it;
 * `homeRouteFor` says where a role lands after login and where it is sent when
 * it hits a page it may not see.
 *
 * Each role has exactly one home: a reporter's is /my-issues, a team member's
 * is /team (their queue), and the all-tickets dashboard belongs to the admin.
 *
 * STATUS: USED — by Navbar, ProtectedRoute, AuthContext and the landing page.
 */
export const navigationList = [
  { name: "My Issues", href: "/my-issues", roles: ["reporter"] },
  { name: "Report", href: "/report", roles: ["reporter"] },
  { name: "My Queue", href: "/team", roles: ["team"] },
  { name: "Dashboard", href: "/dashboard", roles: ["admin"] },
  { name: "Teams", href: "/admin", roles: ["admin"] },
  { name: "Profile", href: "/profile", roles: ["reporter", "team", "admin"] },
];

const HOME_BY_ROLE = {
  reporter: "/my-issues",
  team: "/team",
  admin: "/dashboard",
};

export const homeRouteFor = (role) => HOME_BY_ROLE[role] || "/my-issues";
