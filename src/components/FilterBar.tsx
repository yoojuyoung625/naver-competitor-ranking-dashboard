import { CalendarDays, MonitorSmartphone, Search } from "lucide-react";
import { KEYWORDS } from "../config";
import type { DashboardFilters, Device } from "../types";

type Props = { filters: DashboardFilters; onChange: (next: DashboardFilters) => void };

export function FilterBar({ filters, onChange }: Props) {
  const devices: { value: Device; label: string }[] = [
    { value: "ALL", label: "통합" },
    { value: "PC", label: "PC" },
    { value: "MOBILE", label: "Mobile" },
  ];

  return (
    <section className="filter-bar" aria-label="분석 조건">
      <label className="field">
        <span><Search size={15} /> Keyword</span>
        <select value={filters.keyword} onChange={(e) => onChange({ ...filters, keyword: e.target.value })}>
          {KEYWORDS.map((keyword) => <option key={keyword}>{keyword}</option>)}
        </select>
      </label>
      <div className="field">
        <span><MonitorSmartphone size={15} /> Device</span>
        <div className="segmented">
          {devices.map((device) => (
            <button
              key={device.value}
              className={filters.device === device.value ? "active" : ""}
              onClick={() => onChange({ ...filters, device: device.value })}
            >{device.label}</button>
          ))}
        </div>
      </div>
      <label className="field month-field">
        <span><CalendarDays size={15} /> Month</span>
        <input type="month" value={filters.month} onChange={(e) => onChange({ ...filters, month: e.target.value })} />
      </label>
    </section>
  );
}
