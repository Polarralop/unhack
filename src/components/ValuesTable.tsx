import type { ResultValue } from "@/lib/types";

const FLAG_TEXT = { normal: "Normal", abnormal: "Abnormal" } as const;

/** Rows with no cutoff (e.g. "cells counted") are context, not findings. */
function flagText(v: ResultValue) {
  return v.range ? FLAG_TEXT[v.flag] : "";
}

function Value({ v }: { v: ResultValue }) {
  return (
    <span className={`font-semibold tabular-nums ${v.flag === "normal" ? "" : "text-alert"}`}>
      {v.value} {v.unit && <span className="text-sm font-normal text-muted">{v.unit}</span>}
    </span>
  );
}

export function ValuesTable({ values }: { values: ResultValue[] }) {
  if (values.length === 0) return null;
  return (
    <>
      {/* Phones: stacked list */}
      <ul className="divide-y divide-line sm:hidden">
        {values.map((v) => (
          <li key={v.name} className="py-3 first:pt-0 last:pb-0">
            <p>{v.name}</p>
            <p className="mt-1 flex flex-wrap items-baseline gap-x-3">
              <Value v={v} />
              {v.range && <span className="text-sm text-muted">Normal if {v.range}</span>}
              {v.flag === "abnormal" && <span className="text-sm font-semibold text-alert">Abnormal</span>}
            </p>
          </li>
        ))}
      </ul>

      {/* Wider screens: table */}
      <table className="hidden w-full text-left sm:table">
        <thead>
          <tr className="border-b border-line text-sm text-muted">
            <th className="py-2 pr-4 font-normal">What the lab looked for</th>
            <th className="py-2 pr-4 font-normal">Your result</th>
            <th className="py-2 pr-4 font-normal">Normal if</th>
            <th className="py-2 font-normal">
              <span className="sr-only">Flag</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {values.map((v) => (
            <tr key={v.name} className="border-b border-line last:border-0">
              <td className="py-2.5 pr-4">{v.name}</td>
              <td className="py-2.5 pr-4">
                <Value v={v} />
              </td>
              <td className="py-2.5 pr-4 text-muted tabular-nums">{v.range}</td>
              <td className={`py-2.5 text-sm font-semibold ${v.flag === "normal" ? "text-muted" : "text-alert"}`}>
                {flagText(v)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
