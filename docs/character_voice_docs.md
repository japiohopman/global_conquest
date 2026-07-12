# 🎙️ RiskFlow AI - Master Audio Blueprint (Phonetic Identity Update)

This document defines the complete phonetic architecture for RiskFlow AI. We use a **Concatenative TTS System**—pre-generating "atomic" audio bytes using Gemini and stitching them in real-time to create dynamic NPC speech.

---

## 1. Phonetic Identity Matrix

We map our 9 NPCs to specific Gemini TTS voice models, using stylistic prompt engineering during the "Bake" phase to differentiate their performances based on heritage and gender.

| NPC | Archetype | Voice Model | Gender | Heritage / Accent Style |
| :--- | :--- | :--- | :--- | :--- |
| **The Chief Dealer** | Aggressor | `Kore` | Male | Boisterous Queens Tycoon (Trump-inspired) |
| **The Rising General** | Stoic | `Charon` | Male | Gritty Slavic Frontline Defender |
| **The Eternal Marshal** | Aggressor | `Kore` | Male | Enthusiastic East Asian Dynast |
| **The Red Emperor** | Tactician | `Puck` | Male | Disciplined Chinese Party Chairman |
| **The Shadow Czar** | Stoic | `Charon` | Male | Cold Slavic Intelligence Strongman |
| **The Desert Crown** | Tactician | `Puck` | Male | Petro-State Heir / Middle Eastern Prince |
| **The Union Chancellor** | Tactician | `Puck` | Male | European Technocrat / Dutch Polder Manager (Rutte-inspired) |
| **The Subcontinental Strategist** | Tactician | `Puck` | Male | Serene South Asian Democratic Giant |
| **The Silicon Emperor** | Stoic | `Charon` | Male | Intense Tech Mogul / Disruptive Oligarch |

---

## 2. TTS Prompt Engineering

During the baking process, each line is generated with a **Stylistic Instruction Prefix**:
> *"As a [Gender] character with a [Heritage] heritage, say this in your [Archetype] persona: [Script Line]"*

This ensures the generated WAV files possess the intended grit, accent, and inflection.

---

## 3. Storage Architecture

Each NPC has its own dedicated directory in the repository:
`/assets/audio/voices/[npc_name_slug]/`
- `prefixes/`: Action starters (Claiming, Attacking, etc.)
- `territories/`: Map subjects (Alaska, Brazil, etc.)
- `barks/`: Standalone reactions (Victory, Combat).

Total Asset Footprint: **630 Files** (70 per NPC).

---

## 4. The Stitcher Logic

The `soundEngine.ts` will stitch these bytes with a **-50ms crossfade**.
Example call: `soundEngine.speak('the_chief_dealer', ['attacking_1', 'alaska'])`
Resulting Audio: "Assaulting... Alaska!" (delivered in Trump's iconic Queens Tycoon style).
