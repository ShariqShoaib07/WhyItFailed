import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabaseServer";

export const metadata: Metadata = {
  title: "FailLog — Engineering Failure Feed",
  description: "Where engineering failures become collective intelligence.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-50 antialiased selection:bg-red-500/20 selection:text-red-200">
        <Navbar user={user} />
        <main className="mx-auto max-w-4xl px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
