"use client";

import { useMemo, useState } from "react";
import {
  computeFloats,
  pipe_data,
  type Material,
} from "../lib/ezconnect";

// type Tab = "hdpe" | "metal" | "hose" | "wire"; // with hose/wire for UI parity
type Tab = "hdpe" | "metal"; // only hdpe/metal used for calc

export default function App() {
  const [tab, setTab] = useState<Tab>("hdpe");
  const [dr, setDr] = useState<"11" | "17">("11");
  const [sizeIn, setSizeIn] = useState<number>(0.5);
  const [lengthFt, setLengthFt] = useState<number>(300);
  const [subPct, setSubPct] = useState<50 | 80>(50);
  const [material, setMaterial] = useState<Material>("water");
  const [sgOther, setSgOther] = useState<number>(1.2);

  const [result, setResult] = useState<ReturnType<typeof computeFloats> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // available sizes based on pipe type & DR
  const sizes = useMemo(() => {
    if (tab === "hdpe") {
      const key = dr === "11" ? "hdpe_dr11" : "hdpe_dr17";
      return Object.keys(pipe_data[key as "hdpe_dr11" | "hdpe_dr17"])
        .map(Number)
        .sort((a, b) => a - b);
    }
    if (tab === "metal") {
      return Object.keys(pipe_data.metal).map(Number).sort((a, b) => a - b);
    }
    return [];
  }, [tab, dr]);

  // default size valid when switching tabs
  useMemo(() => {
    if (sizes.length) setSizeIn(sizes[0]);
  }, [tab, dr]); // eslint-disable-line

  const canCalculate = tab === "hdpe" || tab === "metal";

  const onCalculate = () => {
    setError(null);
    setResult(null);
    try {
      if (!canCalculate) throw new Error("Only HDPE or Metal Pipe supported in this MVP");
      const res = computeFloats({
        pipeType: tab === "hdpe" ? "hdpe" : "metal",
        dr: tab === "hdpe" ? dr : undefined,
        sizeIn,
        lengthFt,
        subPct,
        material,
        sgOther: material === "other" ? sgOther : undefined,
      });
      setResult(res);
    } catch (e: any) {
      setError(String(e.message ?? e));
    }
  };

  const materialLabel = toTitle(material);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl rounded-2xl border bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Left: form */}
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold">Pipe Float Calculator</h1>
            <p className="mt-2 text-sm text-gray-600">
              Select pipe/hose type and fill out the fields below to calculate
            </p>

            <hr className="my-4" />

            {/* Tabs */}
            <div className="flex flex-wrap gap-3">
              <TabButton active={tab === "hdpe"} onClick={() => setTab("hdpe")}>
                HDPE Pipe
              </TabButton>
              <TabButton active={tab === "metal"} onClick={() => setTab("metal")}>
                Metal Pipe
              </TabButton>
              {/* <TabButton active={tab === "hose"} onClick={() => setTab("hose")} disabled>
                Slurry Hose
              </TabButton> */}
              {/* <TabButton active={tab === "wire"} onClick={() => setTab("wire")} disabled>
                Wire/Cable
              </TabButton> */}
            </div>

            {/* Fields */}
            <div className="mt-4 space-y-4">
              {tab === "hdpe" && (
                <Field label="HDPE Pipe Type:">
                  <select
                    className="w-full rounded border px-3 py-2"
                    value={dr}
                    onChange={(e) => setDr(e.target.value as "11" | "17")}
                  >
                    <option value="11">DR11</option>
                    <option value="17">DR17</option>
                  </select>
                </Field>
              )}

              <Field label="Pipe Size (Nominal):">
                <select
                  className="w-full rounded border px-3 py-2"
                  value={sizeIn}
                  onChange={(e) => setSizeIn(parseFloat(e.target.value))}
                >
                  {sizes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Length of the pipeline (ft):">
                <input
                  type="number"
                  className="w-full rounded border px-3 py-2"
                  value={lengthFt}
                  min={0}
                  onChange={(e) => setLengthFt(parseFloat(e.target.value || "0"))}
                />
              </Field>

              <Field label="Material Type:">
                <select
                  className="w-full rounded border px-3 py-2"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value as Material)}
                >
                  <option value="water">Water (1.0)</option>
                  <option value="sand">Sand (1.35)</option>
                  <option value="slurry">Slurry (1.6)</option>
                  <option value="other">Other (Specific gravity of the material)</option>
                </select>

                {material === "other" && (
                  <div className="mt-2">
                    <input
                      type="number"
                      step="0.01"
                      min={0.1}
                      className="w-full rounded border px-3 py-2"
                      value={sgOther}
                      onChange={(e) => setSgOther(parseFloat(e.target.value || "1"))}
                      placeholder="Enter specific gravity, e.g., 1.2"
                    />
                  </div>
                )}
              </Field>

              <Field label="Desired percent of Submergence %:">
                <select
                  className="w-full rounded border px-3 py-2"
                  value={subPct}
                  onChange={(e) => setSubPct(parseInt(e.target.value) as 50 | 80)}
                >
                  <option value={50}>50%</option>
                  <option value={80}>80%</option>
                </select>
              </Field>

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                onClick={onCalculate}
                className="w-full rounded-lg bg-red-600 py-3 font-semibold text-white hover:bg-red-700"
              >
                Calculate
              </button>
            </div>
          </div>

          {/* Right: results / image */}
          <div className="md:pl-6">
            <div className="rounded-xl bg-gray-50 p-4">
              <h2 className="mb-3 text-lg font-semibold text-gray-800">Results:</h2>

              {/* ORDERED OUTPUT */}
              <ResultRow
                label="Number of EZ Connect float assemblies needed:"
                value={result?.numAssemblies ?? 0}
              />
              <ResultRow
                label="Size of assembly:"
                value={`${result?.unitsPerAssembly ?? 0}-unit assembly`}
              />
              <ResultRow
                label="Total EZ Connect floats (units):"
                value={result?.totalUnits ?? 0}
              />
              <ResultRow
                label="Total cost:"
                value={formatCurrency(result?.totalCost ?? 0)}
              />
              <ResultRow
                label="Calculated spacing between assemblies:"
                value={`${result?.spacingFt ?? 0} ft`}
              />
              <ResultRow
                label={`Recommended spacing for ${materialLabel}:`}
                value={`${result?.recommendedSpacingFt ?? 0} ft`}
              />
            </div>

            {/* Placeholder image */}
            <div className="mt-6 flex items-center justify-center">
              <div className="h-56 w-56 rounded-full bg-[url('https://images.unsplash.com/photo-1614851970938-5c7a5adba3fe?q=80&w=512&auto=format&fit=crop')] bg-cover bg-center shadow-inner" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- small helpers ----------------------------- */

function Field(props: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-gray-800">{props.label}</label>
      {props.children}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  disabled,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "rounded-lg px-4 py-2 text-sm font-semibold",
        active ? "bg-red-600 text-white" : "bg-white text-gray-800 border",
        disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-red-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ResultRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="mb-3">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

function formatCurrency(n: number) {
  return `$${(Number.isFinite(n) ? n : 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function toTitle(s: string) {
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}
