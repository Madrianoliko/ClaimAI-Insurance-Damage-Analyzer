# ClaimAI — Vehicle Damage Analyzer

> Describe the accident. Upload the photos. Get a structured damage report in seconds.

ClaimAI automates vehicle damage assessment for insurance adjusters. Instead of manually reviewing photos, writing up damage descriptions and estimating repair costs — which takes 45–90 minutes per claim — ClaimAI does it in under 10 seconds using a YOLO + GPT-4o pipeline.

![ClaimAI screenshot](ClaimAi-UseCase-img.png)

---

## How It Works

The user submits an incident description and up to 5 damage photos. The backend runs them through two AI systems in parallel:

1. **Roboflow YOLO** — detects damaged parts in each photo (dents, broken glass, crumple zones, etc.) and returns bounding boxes with confidence scores
2. **GPT-4o** — receives both the YOLO detections and the written description, then streams back a structured JSON report

The report streams live to the UI token-by-token via **Server-Sent Events** — no waiting for the full response before anything appears.

```
Photos + Description
        │
        ├──► Roboflow YOLO (parallel, one request per image)
        │         └── [{ class, confidence, x, y, width, height }, ...]
        │
        ▼
GPT-4o  ←  YOLO detections + incident text
  model: gpt-4o
  response_format: json_object   ← guarantees parseable output
  stream: true
        │
        ▼
SSE stream → frontend assembles JSON live → report renders
```

---

## Demo

**Input — incident description:**
> Head-on collision between two vehicles. Red Suzuki Celerio lost control and struck a roadside tree at approximately 60 km/h. Second vehicle — silver Audi A3 — sustained severe front-end impact. Both airbags deployed. Red vehicle is non-drivable with crumple zone fully engaged. Silver vehicle front axle appears misaligned. Scene secured by police. No fatalities reported.

**Input — photo:**

![Crash scene photo](docs/demo-crash.jpg)

**Output — ClaimAI report (streamed in ~8 seconds):**

```json
{
  "severity": "SEVERE",
  "severityReason": "Major structural damage to both vehicles with airbag deployment and crumple zone engagement. Both vehicles are non-drivable. Repair cost estimate approaches or exceeds vehicle value for the smaller vehicle.",
  "detectedDamage": [
    "Severe front-end impact — both vehicles",
    "Airbag deployment confirmed",
    "Crumple zone fully engaged — red vehicle",
    "Misaligned front axle — silver vehicle",
    "Hood and front clip non-serviceable"
  ],
  "affectedParts": [
    "Front bumper assembly", "Hood / bonnet",
    "Radiator and cooling system", "Front subframe",
    "Airbag system (deployed)", "Front suspension geometry"
  ],
  "estimatedCostRange": { "min": 10000, "max": 18000, "currency": "USD" },
  "claimSummary": "The collision involved a red Suzuki Celerio and a silver Audi A3, both sustaining significant damage. The Suzuki is non-drivable with crumple zone fully engaged and the Audi has a misaligned front axle. Both vehicles experienced airbag deployment, indicating severe impact.",
  "recommendedActions": [
    "Dispatch independent appraiser — red vehicle is a total loss candidate",
    "Frame and suspension inspection required for silver vehicle before repair assessment",
    "Request police accident report and airbag module replacement for both vehicles",
    "Arrange towing — neither vehicle is roadworthy"
  ]
}
```

📹 [Watch the full use case recording](ClaimAI-UseCase-rec.mov)

---

## Features

- **Drag & drop photo upload** — up to 5 images, 10MB each
- **Parallel YOLO inference** — all photos analyzed simultaneously via `Promise.all()`
- **Live streaming report** — GPT-4o output appears token-by-token as it generates
- **Severity classification** — MINOR / MODERATE / SEVERE / TOTAL LOSS with reasoning
- **Structured output** — damage list, affected parts, cost range, adjuster summary, recommended actions
- **Works without photos** — text-only analysis also supported

---

## Stack

| | |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Backend** | Node.js, Express |
| **Vision AI** | Roboflow Hosted Inference (YOLO) |
| **Language AI** | OpenAI GPT-4o with streaming |
| **Transport** | Server-Sent Events (SSE) |
| **Deploy** | Railway |

---

## Running Locally

**Prerequisites:** Node.js 18+, OpenAI API key with billing, Roboflow API key + model ID

```bash
git clone https://github.com/yourusername/claimai.git
cd claimai

# Install
cd backend && npm install
cd ../frontend && npm install

# Configure
cp .env.example backend/.env
# → fill in OPENAI_API_KEY, ROBOFLOW_API_KEY, ROBOFLOW_MODEL_ID

# Run
cd backend && npm run dev      # :3001
cd ../frontend && npm run dev  # :5173
```

Open `http://localhost:5173`.

**Finding a Roboflow model:** [universe.roboflow.com](https://universe.roboflow.com/search?q=car+damage+detection) → pick any car damage model → Deploy → Hosted API → copy the model ID (format: `model-name/1`).

---

## Project Structure

```
claimai/
├── backend/
│   ├── index.js                   # Express server entry point
│   ├── routes/analyze.js          # POST /api/analyze — multer + orchestration
│   ├── services/
│   │   ├── openai.js              # GPT-4o streaming via SSE
│   │   └── roboflow.js            # Roboflow YOLO inference client
│   └── prompts/claim.js           # System prompt + user prompt builder
└── frontend/src/
    ├── App.jsx                    # State + SSE stream reader
    └── components/
        ├── ClaimInput.jsx         # Text input + drag & drop form
        ├── ImageUpload.jsx        # File drop zone with preview
        ├── DamageReport.jsx       # Full report layout
        ├── SeverityBadge.jsx      # Color-coded severity indicator
        ├── DamageList.jsx         # Reusable damage / parts list
        └── DetectionOverlay.jsx   # Canvas bounding box renderer
```

---

## Key Technical Decisions

**SSE over WebSockets** — LLM streaming is server→client only. SSE works over standard HTTP, requires no upgrade handshake, and is natively supported by `response.body.getReader()` in modern browsers.

**`response_format: json_object`** — Forces GPT-4o to return valid JSON every time. Without this, the model occasionally wraps output in markdown code fences which breaks `JSON.parse()`.

**`multer.memoryStorage()`** — Files stay in RAM as `Buffer` objects. No disk writes, works correctly on Railway and other stateless/ephemeral platforms.

**`Promise.all()` for YOLO** — All uploaded images are sent to Roboflow in parallel. For 5 images this means ~1s total instead of ~5s sequential.

---

*Built by Adrian Malik*
*"The most interesting AI workflow I've built: ClaimAI — combining YOLO object detection with GPT-4o streaming to automatically assess vehicle damage from photos and claim descriptions. The system classifies severity from Minor to Total Loss and generates structured adjuster reports in seconds. Architecture draws from building intelligence analysis pipelines at NATO TIDE hackathons (1st place, 2025)."*
