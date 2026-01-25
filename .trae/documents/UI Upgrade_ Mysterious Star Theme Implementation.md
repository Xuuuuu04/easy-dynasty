# 易朝 (EasyDynasty) UI Comprehensive Upgrade Plan - Mysterious Star Theme

I will completely overhaul the UI to implement a default "Mysterious Star" theme (Dark Mode) while preserving the current design as an optional "Light Mode".

## 1. Dependency & Configuration
- **Install `next-themes`**: To manage theme switching between "mysterious" (dark) and "light" modes.
- **Create Theme Provider**: `web/app/providers.tsx` to handle theme context.
- **Update Layout**: Wrap the application in `web/app/layout.tsx` with the new provider.

## 2. Styling System Refactor (`web/app/globals.css`)
- **Redefine CSS Variables**:
  - **Default (`:root`)**: Set to "Mysterious Star" colors (Deep Space Blue, Starlight Gold, Mystic Purple).
  - **Light Mode (`[data-theme="light"]`)**: Preserve the current "Ink & Paper" colors.
- **Semantic Variables**:
  - `--bg-main`: Deep void vs. Rice paper.
  - `--text-main`: Starlight silver vs. Ink black.
  - `--accent`: Mystic purple vs. Seal red.
  - `--card-bg`: Glassmorphism dark vs. Translucent white.

## 3. Component Overhaul
### Global Components
- **`AtmosphereBackground.tsx`**:
  - **Mysterious Mode**: Add twinkling stars, nebula effects, and deep fog using CSS animations.
  - **Light Mode**: Keep the current ink wash/mist effect.
- **`BackgroundPoetry.tsx`**:
  - Adapt text color to be "Starlight" (glowing white/gold) in mysterious mode and "Ink" in light mode.
- **`NavBar.tsx`**:
  - Transparent dark glass effect for Mysterious mode.
  - Add a **Theme Toggle** button (Sun/Moon icon).

### Feature Components
- **Card Displays (`TarotCard`, `FlipCard`, etc.)**:
  - Update shadows and borders to glow in the dark mode.
  - Use `backdrop-blur` effectively for the mysterious glass feel.
- **Modals & Overlays**:
  - Update backgrounds to match the deep space theme.

## 4. Implementation Steps
1.  **Setup**: Install dependencies and configure `next-themes`.
2.  **Styles**: Rewrite `globals.css` to implement the dual-theme variable system.
3.  **Components**: Systematically update `NavBar`, `Background`, and core UI components to use the new semantic variables.
4.  **Verification**: Ensure the default is "Mysterious" and the toggle works to switch back to "Light".

This plan ensures a complete transformation to a high-end, mysterious aesthetic while keeping the original charm accessible.
