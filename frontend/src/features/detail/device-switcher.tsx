"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { t } from "@/i18n/messages";
import type { SupportedLocale } from "@/i18n/config";
import type { Device } from "@/types/domain";

interface DeviceSwitcherProps {
  locale: SupportedLocale;
  /** Every device the record was captured for, in display order. */
  available: Device[];
  value: Device;
  label: string;
  onChange: (device: Device) => void;
}

const ALL_DEVICES: Device[] = ["desktop", "mobile"];

/**
 * Desktop / mobile switcher.
 *
 * A device with no crop is rendered disabled with the reason in its accessible
 * name, rather than being hidden: the reader learns the variant does not exist
 * instead of wondering whether the control is broken, and no coordinates are
 * ever borrowed from the other device to fill the gap.
 */
export function DeviceSwitcher({ locale, available, value, label, onChange }: DeviceSwitcherProps) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={value}
      aria-label={label}
      className="rounded-md"
      onValueChange={(next) => {
        // Radix reports an empty string when the active item is pressed again;
        // a switcher always shows exactly one device, so that is a no-op.
        if (next === "desktop" || next === "mobile") onChange(next);
      }}
    >
      {ALL_DEVICES.map((device) => {
        const supported = available.includes(device);
        return (
          <ToggleGroupItem
            key={device}
            value={device}
            data-device={device}
            disabled={!supported}
            aria-label={supported
              ? t(locale, device === "mobile" ? "taxonomy.device.mobile" : "taxonomy.device.desktop")
              : `${t(locale, device === "mobile" ? "taxonomy.device.mobile" : "taxonomy.device.desktop")} — ${t(locale, "detail.deviceUnavailable")}`}
            className="min-h-11 px-4"
          >
            {t(locale, device === "mobile" ? "taxonomy.device.mobile" : "taxonomy.device.desktop")}
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
