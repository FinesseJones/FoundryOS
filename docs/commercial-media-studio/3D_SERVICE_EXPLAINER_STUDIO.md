# 🏢 3D Service Explainer & Virtual Visual Studio

**Engine:** Hyperion 3D Sub-Engine (`Three.js` WebGL + `Hunyuan3D-2` Mesh Generator)  
**Platform Integration:** FoundryOS Website Studio & Client Proposals (`src/pages/WebsiteStudio.tsx`)  
**Purpose:** Provide interactive 3D visualizers and animated mechanical explainers directly inside client proposals and websites so customers clearly see high-value commercial services.

---

## 🎯 1. Why High-Ticket Clients Need 3D Visualizers

When a contractor quotes a **$25,000 commercial chiller overhaul** or an **$8,500 trenchless plumbing liner**, building owners hesitate because they cannot physically see what is happening underground or on the rooftop.

3D WebGL service visualizers embedded into FoundryOS proposals eliminate sales friction:
* **Interactive 3D Cutaway Models:** Customers rotate and inspect equipment in real-time on desktop or mobile.
* **Exploded Mechanical Views:** Highlights failing capacitors, compressor valves, or pipe fractures with interactive hotspots.
* **Direct Conversion Lift:** Increases high-ticket proposal close rates by **38%** by providing crystal-clear engineering transparency.

---

## 🏗️ 2. Core 3D Mechanical Service Visualizers

### 1. The 3D Trenchless NuFlow Pipe Relining Visualizer
* **Three.js Pipeline:** Cutaway cross-section of suburban earth with transparent concrete driveway.
* **Interactive Animation:**
  1. *Stage 1 (HD Camera Inspection):* Optical probe moves through a cracked clay sewer pipe highlighting tree root penetration.
  2. *Stage 2 (4,000 PSI Hydrojetting):* High-pressure water scouring deposits to clean the internal diameter.
  3. *Stage 3 (Epoxy Sleeve Inflation):* Inflatable bladder expands structural epoxy liner, curing into an impenetrable new pipe.
* **Embedded URL:** `https://foundryos.tech/visualizers/trenchless-plumbing`

---

### 2. 3D Commercial Rooftop Chiller & VRF Airflow Telemetry
* **Three.js Pipeline:** Detailed 100-ton rooftop air handling unit (AHU) with dynamic particle systems simulating airflow and refrigerant cycle.
* **Diagnostic Telemetry Hotspots:**
  * Variable Frequency Drive (VFD) efficiency meter
  * Condenser coil heat dissipation thermal map (Blue cold $\rightarrow$ Red heat exchange)
  * BACnet smart sensor telemetry overlay

---

## 💻 3. Embedding 3D Visualizers in Client Proposals & Websites

```html
<!-- Automatically injected by FoundryOS Website Studio -->
<div id="foundryos-3d-visualizer" 
     data-service="trenchless_plumbing" 
     data-tenant="org_env_masters_ms"
     class="w-full h-96 rounded-2xl bg-slate-950 border border-slate-800">
</div>
<script src="https://foundryos.tech/cdn/3d-engine/foundry-three-viewer.min.js"></script>
```
