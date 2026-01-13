"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PrimaryTabs() {
  const pathname = usePathname();

  const isMarketplace =
    pathname === "/marketplace" ||
    pathname.startsWith("/listing") ||
    pathname.startsWith("/sell") ||
    pathname.startsWith("/my-listings") ||
    pathname.startsWith("/edit-listing");

  const isHousing =
    pathname === "/housing" ||
    pathname.startsWith("/housing/");

  const pill = (active: boolean) => ({
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: active ? "#111111" : "#ffffff",
    color: active ? "#ffffff" : "#111111",
    fontWeight: 900 as const,
    textDecoration: "none",
  });

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 18 }}>
      <Link href="/marketplace" style={pill(isMarketplace)}>
        Marketplace
      </Link>
      <Link href="/housing" style={pill(isHousing)}>
        Housing
      </Link>
    </div>
  );
}
