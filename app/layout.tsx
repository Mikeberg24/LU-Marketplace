import "./globals.css";
import Header from "@/components/Header";
import PrimaryTabs from "@/components/PrimaryTabs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ paddingTop: 18 }}>
            <PrimaryTabs />
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
