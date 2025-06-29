import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "PaySlip Pro",
  description: "Professional payslip management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster 
              richColors 
              position="top-center"
              expand={false}
              duration={4000}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}