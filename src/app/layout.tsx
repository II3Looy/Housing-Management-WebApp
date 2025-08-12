import "./globals.css";

export const metadata = {
  title: "Housing Management System",
  description: "Camp and accommodation management platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
          <div className="bg-black text-white min-h-screen">
            {children}
          </div>
      </body>
    </html>
  );
}
