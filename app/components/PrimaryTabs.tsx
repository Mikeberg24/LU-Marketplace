"use client";

import { usePathname, useRouter } from "next/navigation";

export default function PrimaryTabs() {
  const router = useRouter();
  const pathname = usePathname() || "";

  const onHousing = pathname.startsWith("/housing");
  const onMarketplace =
    pathname.startsWith("/marketplace") ||
    pathname.startsWith("/listing") ||
    pathname.startsWith("/sell") ||
    pathname.startsWith("/my-listings");

  return (
    <div style={{ marginTop: 10, marginBottom: 18, position: "relative", zIndex: 5 }}>
      <div className="row" style={{ gap: 10 }}>
        <button
          type="button"
          className={onMarketplace ? "btn btnPrimary" : "btn btnSoft"}
          onClick={() => router.push("/marketplace")}
        >
          Marketplace
        </button>

        <button
          type="button"
          className={onHousing ? "btn btnPrimary" : "btn btnSoft"}
          onClick={() => router.push("/housing")}
        >
          Housing
        </button>
      </div>
    </div>
  );
}
