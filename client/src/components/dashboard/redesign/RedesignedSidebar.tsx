"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  IconHome,
  IconWallet,
  IconCash,
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

interface NavGroup {
  labelKey: string;
  items: NavItem[];
}

// 5개 섹션 그룹화 (시안 2026-05-03 기준)
const NAV_GROUPS: NavGroup[] = [
  {
    labelKey: "home",
    items: [{ key: "dashboard", href: "/dashboard", icon: IconHome }],
  },
  {
    labelKey: "moneyAndSchedule",
    items: [
      { key: "transactions", href: "/dashboard/transactions", icon: IconWallet },
      { key: "txns", href: "/dashboard/txns", icon: IconCash },
      { key: "subscriptions", href: "/dashboard/subscriptions", icon: IconRepeat },
      { key: "calendar", href: "/dashboard/calendar", icon: IconCalendar },
    ],
  },
  {
    labelKey: "records",
    items: [{ key: "notes", href: "/dashboard/notes", icon: IconNotes }],
  },
  {
    labelKey: "tools",
    items: [
      { key: "salary", href: "/dashboard/salary", icon: IconCalculator },
      { key: "loan", href: "/dashboard/loan", icon: IconCash },
      { key: "financeTools", href: "/dashboard/finance-tools", icon: IconCurrencyWon },
      { key: "imageCrop", href: "/tools/image-crop", icon: IconCrop },
      { key: "imageToPdf", href: "/tools/image-to-pdf", icon: IconFileTypePdf },
    ],
  },
  {
    labelKey: "system",
    items: [{ key: "settings", href: "/dashboard/settings", icon: IconSettings }],
  },
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
          <div className="wl-brand-tag">Dashboard · 2026</div>
        </div>
      </Link>

      <nav className="wl-nav">
        {NAV_GROUPS.map((group, gi) => (
          <div
            key={group.labelKey}
            className={`wl-nav-group${gi === 0 ? " wl-nav-group--first" : ""}`}
          >
            <div className="wl-side-section-label">
              {t(`dashboard:sidebar.groups.${group.labelKey}`)}
            </div>
            {group.items.map((item) => {
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
          </div>
        ))}
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
