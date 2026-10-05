"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";
import { buildDownloadFilename, downloadAsset } from "@/lib/download";
import type { Device } from "@/types/domain";
import type { DetailImage } from "./types";

interface SaveAsImageProps {
  locale: SupportedLocale;
  /** The source's display name; normalised into the filename. */
  sourceName: string;
  /** The section type id, e.g. `hero`. */
  sectionTypeId: string;
  /** The device whose crop is being saved — desktop and mobile save different files. */
  device: Device;
  image: DetailImage;
  mimeType: string;
  onDownloaded: (filename: string) => void;
}

/**
 * Save as image.
 *
 * A real browser download of the device-appropriate rendered asset: no backend,
 * no share sheet, no server round trip beyond the asset the page already shows.
 * The name follows `ntspire-<source>-<type>-<device>.<ext>` so a saved desktop
 * and mobile crop of the same section can never collide on disk.
 */
export function SaveAsImage({
  locale,
  sourceName,
  sectionTypeId,
  device,
  image,
  mimeType,
  onDownloaded,
}: SaveAsImageProps) {
  const [failed, setFailed] = useState(false);

  const handleClick = async () => {
    setFailed(false);
    const filename = buildDownloadFilename({ source: sourceName, sectionType: sectionTypeId, device, mimeType });
    try {
      await downloadAsset(image.src, filename);
      onDownloaded(filename);
    } catch {
      setFailed(true);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="min-h-11 gap-2 px-4"
        data-testid="download-action"
        onClick={() => void handleClick()}
      >
        {t(locale, "detail.saveAsImage")}
      </Button>
      {failed
        ? <p role="alert" className="text-sm text-destructive">{t(locale, "detail.downloadError")}</p>
        : null}
    </>
  );
}
