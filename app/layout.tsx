import "./globals.css";
import Header from "@/components/Header";
import PrimaryTabs from "@/components/PrimaryTabs";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <div className="container" style={{ paddingTop: 16 }}>
          <PrimaryTabs />
          {children}
        </div>
      </body>
    </html>
  );
}
