"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  IconArrowUpRight,
  IconCalculator,
  IconCrop,
  IconFileTypePdf,
  type Icon,
  type IconProps,
} from "@tabler/icons-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

type IconType = ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;

interface Tool {
  key: "salary" | "imageCrop" | "imageToPdf";
  href: string;
  icon: IconType;
}

const TOOLS: Tool[] = [
  { key: "salary", href: "/dashboard/salary", icon: IconCalculator },
  { key: "imageCrop", href: "/tools/image-crop", icon: IconCrop },
  { key: "imageToPdf", href: "/tools/image-to-pdf", icon: IconFileTypePdf },
];

export function ToolsSection() {
  const { t } = useTranslation("dashboard");

  return (
    <section>
      <div className="wl-section-head">
        <h2 className="wl-section-title">{t("sections.tools")}</h2>
        <Link href="/dashboard/finance-tools" className="wl-section-link">
          {t("sections.toolsViewAll")}
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.key} href={tool.href} className="wl-tool-card">
              <div className="wl-tool-card__head">
                <div className="wl-tool-card__icon">
                  <Icon size={18} stroke={1.5} />
                </div>
                <IconArrowUpRight
                  size={16}
                  className="wl-tool-card__arrow"
                />
              </div>
              <div className="wl-tool-card__title">
                {t(`tools.${tool.key}.title`)}
              </div>
              <p className="wl-tool-card__desc">{t(`tools.${tool.key}.desc`)}</p>
              <ul className="wl-tool-card__points">
                <li>{t(`tools.${tool.key}.point1`)}</li>
                <li>{t(`tools.${tool.key}.point2`)}</li>
              </ul>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
