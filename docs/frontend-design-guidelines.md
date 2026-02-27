# Mentara Frontend Design Guidelines: Glassmorphism Clarity

## 1. Design Philosophy
Mentara’s interface must serve as a **"Safe Harbor."** By utilizing glassmorphism, we achieve a sense of transparency and modern tech sophistication (AI-driven), while the organic green palette ensures the user feels grounded and supported (mental health focus).

---

## 2. Color Palette & Tailwind Config
The palette uses a transition from light, airy neutrals to deep, grounding greens.

| Role | Hex Code | RGB | Tailwind Class |
| :--- | :--- | :--- | :--- |
| **Surface / Light** | `#EDF1D6` | `237, 241, 214` | `bg-mentara-surface` |
| **Accent / Soft** | `#9DC08B` | `157, 192, 139` | `bg-mentara-accent` |
| **Primary / Mid** | `#609966` | `96, 153, 102` | `bg-mentara-primary` |
| **Deep / Grounding** | `#40513B` | `64, 81, 59` | `bg-mentara-deep` |

---

## 3. Glassmorphism Specifications
To maintain "Clarity," the glass effect should be subtle enough to ensure readability for users who may be in a state of high stress.

* **Background Blur:** `12px` (Tailwind Class: `backdrop-blur-mentara`).
* **Transparency:** Fill cards with `#EDF1D6` at **65% opacity** (Tailwind Class: `bg-mentara-surface/65`).
* **Border:** `1px solid` using `#EDF1D6` at **40% opacity** (Tailwind Class: `border border-mentara-surface/40`).
* **Shadow:** Very soft, diffused shadow (Tailwind Class: `shadow-mentara-glass`).

---

## 4. Component Standards

### A. The "Glass" Cards
All major content containers should use the `.glass-card` utility.
* **Border Radius:** `24px` (Tailwind Class: `rounded-mentara`).
* **Padding:** Minimum `2rem` (Tailwind Class: `p-8`).

**Example Tailwind Usage:**
```html
<div class="glass-card bg-mentara-surface/65 backdrop-blur-mentara rounded-mentara border border-mentara-surface/40 shadow-mentara-glass p-8">
  <h2 class="text-mentara-deep text-2xl font-bold">Safe Harbor</h2>
  <p class="text-mentara-deep/80 mt-4">Your journey to mental wellness starts here.</p>
</div>
```

### B. Typography (High Contrast)
* **Headings:** Use `text-mentara-deep` (Deep Green) for all primary headers.
* **Body Text:** Use `text-mentara-deep` for high readability.
* **Fonts:** Use `font-mentara` (Outfit/Quicksand fallback).

### C. Floating Action Button (One-Tap Hotline)
The most critical element for crisis intervention.
* **Tailwind Classes:** `fixed bottom-8 right-8 bg-mentara-deep text-mentara-surface rounded-full px-8 py-4 font-bold shadow-lg animate-pulse-mentara`

---

## 5. Visual Hierarchy & Movement
* **Backgrounds:** Use `bg-gradient-to-br from-mentara-surface to-mentara-accent animate-slow-flow`.
* **Icons:** Use `stroke-mentara-primary` with a `1.5px` weight.

---

## 6. CSS / Tailwind Config Snippet
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        mentara: {
          surface: '#EDF1D6',
          accent: '#9DC08B',
          primary: '#609966',
          deep: '#40513B',
        }
      },
      backdropBlur: {
        mentara: '12px',
      },
      borderRadius: {
        mentara: '24px',
      },
      boxShadow: {
        'mentara-glass': '0 8px 32px 0 rgba(64, 81, 59, 0.1)',
      }
    }
  }
}
```

