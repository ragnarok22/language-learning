import { Outlet, ScrollRestoration } from "@tanstack/react-router";

export function RootLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
        <Outlet />
      </div>
      <ScrollRestoration />
    </div>
  );
}
