export type Material = "water" | "sand" | "slurry" | "other";

export const UNIT_PRICE = 110.0;
const WATER_WEIGHT = 62.4;        // lb/ft^3
const PIPE_SUBMERGENCE_FRACTION = 0.005;

type PipeRow = { id: number; od: number; wt: number }; // inches, inches, lb/ft
type PipeKey = "hdpe_dr11" | "hdpe_dr17" | "metal";

export const SG_DEFAULT: Record<Exclude<Material, "other">, number> = {
  water: 1.0,
  sand: 1.35,
  slurry: 1.6,
};

// Pipe tables (ID, OD in inches; wt in lb/ft)
export const pipe_data: Record<PipeKey, Record<number, PipeRow>> = {
  hdpe_dr11: {
    1:{id:1.06,od:1.315,wt:0.2},2:{id:1.92,od:2.375,wt:0.64},3:{id:2.83,od:3.5,wt:1.9},4:{id:3.63,od:4.5,wt:2.3},
    5:{id:4.49,od:5.563,wt:3.52},6:{id:5.35,od:6.63,wt:4.99},8:{id:6.96,od:8.63,wt:8.46},10:{id:8.68,od:10.75,wt:13.14},
    12:{id:10.29,od:12.75,wt:18.49},14:{id:11.3,od:14,wt:22.3},16:{id:12.92,od:16,wt:29.12},18:{id:14.53,od:18,wt:36.84},
    20:{id:16.15,od:20,wt:45.49},24:{id:19.37,od:24,wt:65.52},
  },
  hdpe_dr17: {
    1:{id:1.15,od:1.315,wt:0.13},2:{id:2.08,od:2.375,wt:0.43},3:{id:3.06,od:3.5,wt:0.94},4:{id:3.94,od:4.5,wt:1.55},
    5:{id:4.87,od:5.563,wt:2.36},6:{id:5.8,od:6.63,wt:3.35},8:{id:7.55,od:8.63,wt:5.68},10:{id:9.41,od:10.75,wt:8.82},
    12:{id:11.16,od:12.75,wt:12.41},14:{id:12.25,od:14,wt:14.97},16:{id:14.01,od:16,wt:19.55},18:{id:15.75,od:18,wt:24.75},
    20:{id:17.51,od:20,wt:30.53},24:{id:21.01,od:24,wt:43.99},
  },
  metal: {
    0.125:{id:0.269,od:0.405,wt:0.24},0.25:{id:0.364,od:0.54,wt:0.42},0.375:{id:0.493,od:0.675,wt:0.57},0.5:{id:0.622,od:0.84,wt:0.85},
    0.75:{id:0.824,od:1.05,wt:1.13},1:{id:1.049,od:1.315,wt:1.68},1.25:{id:1.38,od:1.66,wt:2.27},1.5:{id:1.61,od:1.9,wt:2.72},
    2:{id:2.067,od:2.375,wt:3.65},2.5:{id:2.469,od:2.875,wt:5.79},3:{id:3.068,od:3.5,wt:7.58},3.5:{id:3.548,od:4,wt:9.11},
    4:{id:4.026,od:4.5,wt:10.79},5:{id:5.047,od:5.563,wt:14.62},6:{id:6.065,od:6.625,wt:18.97},8:{id:7.981,od:8.625,wt:28.55},
    10:{id:10.02,od:10.75,wt:40.48},12:{id:11.938,od:12.75,wt:53.52},16:{id:15,od:16,wt:82.77},18:{id:16.876,od:18,wt:104.7},
    20:{id:18.812,od:20,wt:123.1},24:{id:22.624,od:24,wt:171.3},32:{id:30.624,od:32,wt:230.1},34:{id:32.624,od:34,wt:244.77},
    36:{id:34.5,od:36,wt:282.35},
  },
};

// EZ-Connect float capacities per nominal size (lbs)
export const floats_data: Record<number, { total: number; ['50']: number | null; ['80']: number | null; units: number }> = {
  1:{total:134,'50':67,'80':null,units:1},2:{total:134,'50':67,'80':null,units:1},3:{total:134,'50':67,'80':null,units:1},
  4:{total:268,'50':134,'80':null,units:2},5:{total:260,'50':134,'80':null,units:2},6:{total:402,'50':201,'80':null,units:3},
  8:{total:536,'50':268,'80':null,units:4},10:{total:670,'50':335,'80':536,units:5},12:{total:804,'50':402,'80':null,units:6},
  14:{total:838,'50':469,'80':550,units:7},16:{total:938,'50':469,'80':null,units:7},18:{total:1072,'50':536,'80':null,units:8},
  20:{total:1072,'50':536,'80':null,units:8},22:{total:1206,'50':603,'80':null,units:9},24:{total:1206,'50':603,'80':null,units:9},
  26:{total:1206,'50':603,'80':null,units:9},28:{total:1340,'50':670,'80':null,units:10},30:{total:1340,'50':670,'80':null,units:10},
  32:{total:1474,'50':737,'80':null,units:11},
};

export function recommendedSpacing(material: Material): number {
  return material === "water" ? 20 : 15;
}

export function computeFloats(opts: {
  pipeType: "hdpe" | "metal";
  dr?: "11" | "17";
  sizeIn: number;
  lengthFt: number;
  subPct: 50 | 80;
  material: Material;
  sgOther?: number;
}) {
  const pipeKey: PipeKey =
    opts.pipeType === "hdpe"
      ? (opts.dr ? (`hdpe_dr${opts.dr}` as PipeKey) : (() => { throw new Error("For HDPE, pick DR11 or DR17"); })())
      : "metal";

  const pdata = pipe_data[pipeKey][opts.sizeIn];
  if (!pdata) throw new Error("Pipe size not available for selected type/DR");

  const fdata = floats_data[Math.trunc(opts.sizeIn)];
  if (!fdata) throw new Error("Float data not available for this pipe size");

  const cap = fdata[String(opts.subPct) as "50" | "80"];
  if (cap == null) throw new Error("Selected submergence not available for this size. Use 50%");

  const id_ft = pdata.id / 12;
  const od_ft = pdata.od / 12;
  const r_in = id_ft / 2;
  const r_out = od_ft / 2;

  const inter_vol_ft3 = Math.PI * r_in * r_in * opts.lengthFt;
  const exter_vol_ft3 = Math.PI * r_out * r_out * opts.lengthFt;

  const sg =
    opts.material === "other"
      ? (opts.sgOther && opts.sgOther > 0 ? opts.sgOther : (() => { throw new Error("Provide SG for 'other'"); })())
      : SG_DEFAULT[opts.material];

  const weight_fluid_lbs = inter_vol_ft3 * WATER_WEIGHT * sg;
  const weight_pipe_lbs = pdata.wt * opts.lengthFt;
  const displaced_lbs = PIPE_SUBMERGENCE_FRACTION * exter_vol_ft3 * WATER_WEIGHT;

  const needed_floatation_lbs = Math.max(0, weight_pipe_lbs + weight_fluid_lbs - displaced_lbs);

  const numAssemblies = Math.ceil(needed_floatation_lbs / cap);
  const unitsPerAssembly = fdata.units;
  const totalUnits = numAssemblies * unitsPerAssembly;
  const totalCost = +(totalUnits * UNIT_PRICE).toFixed(2);
  const spacingFt = +( (numAssemblies <= 1 ? opts.lengthFt : (opts.lengthFt / (numAssemblies - 1))) ).toFixed(2);

  return {
    numAssemblies,
    unitsPerAssembly,
    totalUnits,
    totalCost,
    spacingFt,
    recommendedSpacingFt: recommendedSpacing(opts.material),
    capacityPerAssemblyLbs: cap,
  };
}
