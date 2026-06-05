# 🔧 KAIA AETHERIS — Visual Asset Prompts

> **Target:** Generate `Kaia Engineer.jpg` (master reference for EP 5+)
> **Engine:** GPT Image 2 (primary) / Nano Banana / Midjourney (backup)
> **Aspect:** Square 1:1 or 9:16 portrait (your choice)
> **Style lock:** Anime/manga illustration, PG-13 anime convention

---

## ⚠️ MODERATION STRATEGY

GPT Image 2 sensitif terhadap female + revealing terms. Gunakan:

✅ **DO:**
- Lead dengan "anime style" / "manga illustration"
- Garment names (tanktop, denim shorts) NOT adjectives ("sexy", "revealing")
- Context justification (workshop, engineer, mechanic = casual attire makes sense)
- Reference anime archetypes (Hange Zoë, Bulma)

❌ **DON'T:**
- Words: "sexy", "hot", "revealing", "tight", "curvy"
- Camera angles suggesting voyeurism
- Body part focus

Kalau v1 ke-block, naik ke v2, terus v3.

---

## 🎨 PROMPT V1 — SAFE (Try First)

```
Anime illustration, female mecha engineer character portrait, full body shot.

CHARACTER: Young adult woman, 29 years old, athletic build, wild messy
shoulder-length hair with purple and cyan highlight streaks, bright
emerald eyes, sharp confident smirk, light freckles, small oil smudge
on cheek.

OUTFIT: White lab coat worn open over white tanktop, blue denim shorts,
brown utility belt with mechanical tools, black work boots, cat-eye
glasses with thin frames.

ACCESSORIES: Multiple aviator goggles stacked on forehead, cybernetic
right gauntlet glowing soft blue at the joints, holding a large wrench
in right hand.

POSE: Standing confident, hand on hip, smirking at viewer, weight on
one leg, slight head tilt.

BACKGROUND: Out-of-focus mecha engineering workshop, sparks, blueprints
on wall, partial giant mech silhouette in background, warm amber
industrial lighting.

STYLE: Modern anime illustration, semi-realistic anime art style,
clean line art, vibrant colors, soft shading, Studio Trigger meets
Pacific Rim aesthetic, professional character design sheet quality.

QUALITY: 4K high detail, cinematic lighting, full body visible,
character sheet reference style.

ASPECT: 9:16 portrait
```

---

## 🎨 PROMPT V2 — STANDARD (If V1 Blocked)

```
Anime mecha engineer character design, professional character sheet
illustration.

Female engineer, late 20s, athletic figure, wild messy hair with
purple-cyan streaks, emerald green eyes, smirking expression.

Attire: Open lab coat over fitted white tanktop tucked into mid-thigh
denim shorts, utility belt with engineering tools, work boots, designer
cat-eye glasses.

Equipment: Multiple goggles on forehead, blue-glowing cybernetic arm
gauntlet on right arm, large wrench held casually.

Setting: Mecha hangar workshop, blurred giant robot in background,
amber industrial lighting, sparks flying.

Style: Anime illustration in Studio Trigger / Cyberpunk Edgerunners
art style, vibrant colors, dynamic pose, character design sheet,
professional anime production quality.

Portrait 9:16, full body view.
```

---

## 🎨 PROMPT V3 — DETAILED (If V2 Blocked)

```
Manga character illustration, female mecha mechanic engineer reference
sheet.

Subject: 29-year-old female engineer character named Kaia, athletic
mechanic build, messy chin-length hair dyed with purple and cyan
streaks, vivid green eyes behind cat-eye glasses, oil smudge on left
cheek, mischievous grin.

Clothing layers:
- Outer: Long white lab coat, open, sleeves rolled up
- Top: White ribbed tanktop
- Bottom: Blue denim shorts, frayed hem
- Footwear: Black ankle work boots
- Belt: Brown leather utility belt with hanging tools

Accessories:
- Multiple aviator goggles stacked on forehead
- Cybernetic mechanical right forearm gauntlet, blue energy lines glowing
- Holding wrench named Bessie

Pose: Standing, weight shifted, hip cocked, hand resting on hip,
playful confident smile, looking at viewer.

Background: Soft-focus mecha workshop, blueprints, robot leg visible
in background, warm orange-amber light, sparks particles.

Art style: Anime production illustration, semi-realistic anime style,
sharp clean linework, vibrant saturated colors, dynamic lighting,
character sheet reference, anime aesthetic similar to Bulma from
Dragon Ball Super combined with Lucca from Chrono Trigger.

High detail 4K quality, full body visible, portrait composition.
```

---

## 🎨 PROMPT V4 — NANO BANANA / MIDJOURNEY ALTERNATIVE

Kalau GPT Image 2 stubborn block semua, pakai Nano Banana atau Midjourney
(less strict moderation):

```
anime mecha engineer girl, kaia, 29 years old, athletic figure, wild
messy shoulder-length hair with purple cyan streaks, emerald green
eyes, cat-eye glasses, smirking, oil smudge cheek, open white lab
coat over white tanktop, denim short shorts, brown utility belt,
work boots, multiple goggles forehead, blue glowing cybernetic right
arm gauntlet, holding large wrench, standing confident pose hand
on hip, mecha workshop background, sparks, amber lighting, anime
illustration style, studio trigger, cyberpunk edgerunners, character
design sheet, vibrant colors, dynamic, full body, 9:16 portrait
```

---

## 🔍 ADJUSTMENT MENU (Per Iteration)

Kalau hasil pertama kurang pas, tambah:

**Untuk muka lebih cantik:**
```
+ idol-tier anime girl face, beautiful features, refined jawline
```

**Untuk pose lebih jail/playful:**
```
+ playful pose, tongue out slightly, peace sign, winking
```

**Untuk fokus character (no bg distraction):**
```
+ simple blurred background, character focus, soft bokeh
```

**Untuk lighting drama:**
```
+ rim lighting, dramatic side lighting, cinematic mood
```

**Untuk consistency dengan Vex visual:**
```
+ same art style as a sleek Asian K-pop idol anime sister character,
matching anime universe aesthetic
```

---

## 📐 OUTPUT TARGET

Generate **3-4 variations** terus pilih best one. Save as:
```
D:\DIKA\Wrong Universe\Wrong Mecha\Assets\Kaia Engineer.jpg
```

Sama optional juga:
- `Kaia Closeup.jpg` (face/upper body untuk dialog shots)
- `Kaia Action.jpg` (pose dynamic kalau perlu)

---

## 🎬 USAGE DI EP 5

Reference image ini akan dipakai sebagai:
- **Seedance image reference** (scene generation EP 5)
- **Thumbnail asset** (EP 5 + Kaia memorable shots)
- **Consistency anchor** (Kaia tampil di EP 6, 7, 8, 9, 10 — same face same vibe)

---

## 💡 IMPROVEMENT NOTE

Kalau workflow generate-character-asset ini berulang per series,
pertimbangkan **Skill** baru "anime-character-asset-generator" yang:
- Take character bio JSON input
- Output ready-to-paste prompts (multiple safety tiers)
- Include Nano Banana / GPT / MJ variations
- Track moderation pass rates

Save time 15-20 min per character.
