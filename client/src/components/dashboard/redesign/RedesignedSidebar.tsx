"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  IconHome,
  IconWallet,
  IconCalendar,
  IconRepeat,
  IconCrop,
  IconFileTypePdf,
  IconCalculator,
  IconCurrencyWon,
  IconNotes,
  IconSettings,
  type Icon,
  type IconProps,
} from "@tabler/icons-react";
import { useAuth } from "@/hooks/useAuth";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

type IconType = ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;

interface NavItem {
  key: string;
  href: string;
  icon: IconType;
  aliases?: string[];
}

const NAV: NavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: IconHome },
  {
    key: "transactions",
    href: "/dashboard/transactions",
    icon: IconWallet,
    aliases: ["/dashboard/expense"],
  },
  { key: "calendar", href: "/dashboard/calendar", icon: IconCalendar },
  { key: "subscriptions", href: "/dashboard/subscriptions", icon: IconRepeat },
  { key: "imageCrop", href: "/tools/image-crop", icon: IconCrop },
  { key: "imageToPdf", href: "/tools/image-to-pdf", icon: IconFileTypePdf },
  { key: "salary", href: "/dashboard/salary", icon: IconCalculator },
  { key: "financeTools", href: "/dashboard/finance-tools", icon: IconCurrencyWon },
  { key: "notes", href: "/dashboard/notes", icon: IconNotes },
  { key: "settings", href: "/dashboard/settings", icon: IconSettings },
];

export function RedesignedSidebar() {
  const { t } = useTranslation(["system", "dashboard"]);
  const { user } = useAuth();
  const pathname = usePathname();

  const initial = (user?.name?.trim()?.[0] || "N").toUpperCase();
  const displayName = user?.name?.trim() || t("dashboard:sidebar.guestName");
  const planLabel = t("dashboard:sidebar.planFree");

  return (
    <aside className="wl-sidebar">
      <Link href="/dashboard" className="wl-brand">
        <div className="wl-brand-mark" aria-hidden>
          W
        </div>
        <div>
          <div className="wl-brand-name">WorkLife</div>
          <div className="wl-brand-tag">DASHBOARD · 2026</div>
        </div>
      </Link>

      <div className="wl-side-section-label">
        {t("dashboard:sidebar.menuLabel")}
      </div>

      <nav className="wl-nav">
        {NAV.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.aliases?.includes(pathname) ?? false);
          const Icon = item.icon;
          const label = t(`system:layout.nav.${item.key}.label`);
          const sub = t(`system:layout.nav.${item.key}.description`);

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`wl-nav-item${
                isActive ? " wl-nav-item--active" : ""
              }`}
            >
              <Icon className="wl-nav-item__icon" stroke={1.5} />
              <span className="wl-nav-item__label">
                <span>{label}</span>
                <span className="wl-nav-item__sub">{sub}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="wl-side-foot">
        <div className="wl-avatar" aria-hidden>
          {initial}
        </div>
        <div className="wl-side-foot__meta">
          <b>{displayName}</b>
          <span>{planLabel}</span>
        </div>
      </div>
    </aside>
  );
}
