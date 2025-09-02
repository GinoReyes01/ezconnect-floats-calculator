## ez connect float calculator

A small Next.js + React app that computes how many EZ Connect pipe
floats you need, plus spacing and cost. Choose pipe type, size, length,
material, and submergence, then click **Calculate** to see results.

## deploy to vercel

[![Deploy with
Vercel](https://vercel.com/button)](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)

## features

-   HDPE (DR11/DR17) and Metal pipe
-   Auto-filled pipe sizes from `pipe_data`
-   Materials: water, sand, slurry, or other (custom specific gravity)
-   Outputs: number of assemblies, units per assembly, total units,
    total cost, spacing, recommended spacing
-   Tailwind CSS UI

## quick start

``` bash
# install
npm install

# dev
npm run dev

# build and run
npm run build
npm start
Open http://localhost:3000
```

## file guide

-   `app/.../App.tsx` or `app/page.tsx` --- main UI and handlers
-   `lib/ezconnect.ts` --- domain logic and data
-   `computeFloats(...)`
-   `pipe_data`
-   `type Material`

## how it works

1.  Pick pipe type (HDPE or Metal)\
2.  If HDPE, pick DR (11 or 17)\
3.  Pick size from the dropdown (filled from pipe_data)\
4.  Enter pipeline length in feet\
5.  Pick material, or choose other and enter specific gravity\
6.  Pick submergence (50% or 80%)\
7.  Click Calculate to see results on the right panel

## inputs and outputs

### inputs to `computeFloats`

``` ts
type ComputeFloatsInput = {
  pipeType: "hdpe" | "metal"
  dr?: "11" | "17"         // only for HDPE
  sizeIn: number           // nominal size in inches
  lengthFt: number         // pipeline length in feet
  subPct: 50 | 80          // desired submergence
  material: Material       // "water" | "sand" | "slurry" | "other"
  sgOther?: number         // only if material === "other"
}
```

### expected result used by the UI

``` ts
type ComputeFloatsResult = {
  numAssemblies: number
  unitsPerAssembly: number
  totalUnits: number
  totalCost: number
  spacingFt: number
  recommendedSpacingFt: number
}
```

### `pipe_data` shape (conceptual)

Provide three objects keyed by nominal sizes as strings:

``` ts
const pipe_data = {
  hdpe_dr11: { "6": {/* ... */}, "8": {/* ... */} },
  hdpe_dr17: { "6": {/* ... */}, "10": {/* ... */} },
  metal:     { "4": {/* ... */}, "6": {/* ... */}, "8": {/* ... */} },
}
```

## ui notes

-   Tabs for HDPE and Metal\
-   DR field shows only when HDPE is selected\
-   Size dropdown is built from `pipe_data` keys\
-   If material is other, a specific gravity input appears\
-   Results panel shows assemblies, units, cost, and spacing
