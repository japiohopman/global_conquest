# 🗺️ Global Conquest: Campaign Roadmap

The Campaign Mode transforms Global Conquest from a single-session board game into a persistent tactical odyssey. Players progress through "Theatres of War," facing unique scenarios and AI commanders with specific grudges.

---

## 🏗️ Core Architecture

### 1. Theatre-Based Progression
The world map is divided into 5 progressive Theatres. Players must "Stabilize" (Win) a theatre to unlock the next.
- **Theatre I: The Border Skirmish** (South America/Australia focus)
- **Theatre II: The Resource Rush** (Africa/North America focus)
- **Theatre III: The Iron Curtain** (Europe/Asia focus)
- **Theatre IV: Global Lockdown** (The Full Map)
- **Theatre V: Neural Override** (Hard Mode - AI has 20% troop bonus)

### 2. Custom Objective System
Missions are no longer just "Dominate." They feature specific **Primary** and **Secret** directives:
- **"The Scalpel"**: Capture the enemy's most fortified territory using exactly 3 dice.
- **"Hold the Line"**: Maintain control of Egypt for 12 consecutive turns.
- **"Economic Sabotage"**: Break every continent bonus held by your opponents in a single turn.
- **"The Pacifist"**: Accumulate 15 reinforcements without launching an attack.

### 3. Achievement & Medal System (The Trophy Case)
Achievements provide "Command Points" used to unlock perks.
- **🎖️ Blitzkrieg**: Conquer 10 territories in a single turn.
- **🎖️ Deep Cover**: Hold a secret mission for 20 turns before completing it.
- **🎖️ Intelligence Superiority**: Complete a game where every reinforcement was placed according to the Gemini Strategist's advice.
- **🎖️ Bear Rider**: Win a game playing as The Shadow Czar without losing a territory in Russia.

---

## 🛠️ Implementation Phases

### Phase 1: Persistence Layer (Foundation)
- **State Management**: Implement `LocalStorage` sync in `useGameStore` to track Campaign progress and unlocked achievements.
- **Mission Logic**: Expand the `Mission` type to support turn-counters and specific territory monitoring.

### Phase 2: The War Room (UI/UX)
- **Briefing Screen**: A high-fidelity "Mission Briefing" terminal that appears before the game, featuring a scrolling Gemini-generated "Geopolitical Assessment."
- **Medal Pop-ups**: Real-time notifications when an achievement is triggered during a battle.

### Phase 3: Dynamic Events (Gemini Integration)
- **Mid-Turn Crisis**: At turn 10, Gemini 2.5 Flash generates a "Global Event" (e.g., "Oil Crisis: All Desert territories lose 1 troop").
- **NPC Rivalries**: If you eliminate "The Chief Dealer" in Mission 1, he returns in Mission 3 with a "Vendetta" trait (targeting you exclusively).

### Phase 4: Commander Perks
- **Tactical Upgrades**: Unlockable perks like "Orbital Drop" (Start with +5 troops in a random territory) or "Code Cracker" (See one enemy's secret mission).

---

## 📈 Replay Value Metrics
By introducing these layers, we move the game from a **30-minute distraction** to a **10-hour progression journey**. The achievements encourage players to try "sub-optimal" but fun strategies, while the Campaign difficulty scaling ensures they never outgrow the AI.
