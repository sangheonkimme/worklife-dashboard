"use client";

import { useTranslation } from "react-i18next";
import { ImageCropWidget } from "@/components/widgets/ImageCropWidget";

const ImageCropPage = () => {
  const { t } = useTranslation("widgets");

  return (
    <div className="wl-tool-page">
      <header className="wl-page-head">
        <div>
          <div className="wl-crumb">{t("imageCrop.crumb")}</div>
          <h1 className="wl-page-title">
            {t("imageCrop.title")}
            <span className="wl-hand-sub">— {t("imageCrop.handSub")}</span>
          </h1>
          <div className="wl-page-sub">{t("imageCrop.pageSub")}</div>
        </div>
      </header>

      <div
        className="wl-paper-card"
        style={{ padding: 18, overflow: "hidden" }}
      >
        <ImageCropWidget showHeader={false} />
      </div>
    </div>
  );
};

export default ImageCropPage;
