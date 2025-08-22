"use client";

import Footer from "./footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <main>
        <div className="lay-bg py-4">{children}</div>
      </main>

      {/* wrapper gives the auto top margin that sticks it to the bottom when short */}
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
