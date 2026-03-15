legacy code!
# 🎙️ RiskFlow AI - Master Audio Blueprint (Phonetic Identity Update)

This document defines the complete phonetic architecture for RiskFlow AI. We use a **Concatenative TTS System**—pre-generating "atomic" audio bytes using Gemini and stitching them in real-time to create dynamic NPC speech.

---

## 1. Phonetic Identity Matrix

We map our 9 NPCs to 3 specific Gemini TTS voice models, but we use stylistic prompt engineering during the "Bake" phase to differentiate their performances based on heritage and gender.

| NPC | Archetype | Voice Model | Gender | Heritage / Accent Style |
| :--- | :--- | :--- | :--- | :--- |
| **Havoc** | Aggressor | `Kore` | Male | Gritty American Veteran |
| **Aegis** | Stoic | `Charon` | Female | Nordic / Resonant Shield-Maiden |
| **Vex** | Aggressor | `Kore` | Male | Manic Scrap-City Wastelander |
| **Duchess** | Tactician | `Puck` | Female | Sharp British Aristocracy |
| **Ghost** | Stoic | `Charon` | Male | Deep Slavic / Spetsnaz-style |
| **Prime** | Tactician | `Puck` | Male | Clear Classical Imperialist |
| **Blitz** | Aggressor | `Kore` | Male | Rapid German Industrialist |
| **Raven** | Tactician | `Puck` | Female | Cold Pan-Asian Tech-Operative |
| **Shogun** | Stoic | `Charon` | Male | Robotic Neo-Tokyo Warrior |

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
Example call: `soundEngine.speak('general_havoc', ['attacking_1', 'alaska'])`
Resulting Audio: "Assaulting... Alaska!" (delivered in Havoc's gritty American snarl).
