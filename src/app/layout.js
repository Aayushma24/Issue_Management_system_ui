import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";
// NOT USED: imported but never rendered below. Dropping <Navbar /> into the
// body would give every authenticated page navigation instead of only the
// dashboard, which mounts its own copy.
import Navbar from "@/components/Navbar";

/**
 * RootLayout
 *
 * The app's root shell. Its only real job is wrapping every route in
 * AuthProvider so the session (user, token, login/logout) is available app-wide.
 *
 * STATUS: USED — Next.js mounts this automatically for every route.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}