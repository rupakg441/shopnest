---
name: ShopNest
colors:
  surface: '#fdf8f8'
  surface-dim: '#ddd9d8'
  surface-bright: '#fdf8f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3f2'
  surface-container: '#f1edec'
  surface-container-high: '#ebe7e6'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#444748'
  inverse-surface: '#313030'
  inverse-on-surface: '#f4f0ef'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#775a19'
  on-secondary: '#ffffff'
  secondary-container: '#fed488'
  on-secondary-container: '#785a1a'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1c1b1a'
  on-tertiary-container: '#868382'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#e6e2df'
  tertiary-fixed-dim: '#cac6c4'
  on-tertiary-fixed: '#1c1b1a'
  on-tertiary-fixed-variant: '#484645'
  background: '#fdf8f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
---

## Brand & Style
The design system is anchored in a **Minimalist-Premium** aesthetic, designed to evoke a sense of quiet luxury and architectural clarity. The target audience values curation over clutter, seeking a lifestyle-oriented shopping experience that feels sophisticated yet accessible. 

The visual narrative prioritizes high-quality imagery and "breathing room" (negative space). By combining the editorial authority of high-contrast serifs with the functional precision of modern sans-serifs, the design system establishes a trustworthy, high-end presence that allows product photography to remain the focal point.

## Colors
The palette is intentionally restrained to maintain an upscale editorial feel. 

- **Primary (#1A1A1A):** Used for core branding, headlines, and primary "Call to Action" surfaces. It provides the grounding weight for the design system.
- **Accent (#C5A059):** A muted gold used sparingly for highlights, active states, or promotional badges to signal "premium" value.
- **Surface Strategy:** We utilize a "Layered White" approach. The main background is **Off-white (#FAFAFA)** to reduce eye strain, while cards and containers use **Pure White (#FFFFFF)** to appear lifted.
- **Feedback:** Colors are desaturated and refined (soft greens and muted reds) to ensure they inform the user without breaking the sophisticated aesthetic.

## Typography
The typography system uses a traditional pairing to balance character with utility.

- **Headlines:** Playfair Display is utilized for all major headings and product titles. Its high contrast and elegant serifs create an editorial, magazine-like feel.
- **Body & UI:** Inter is the workhorse for all functional text, descriptions, and labels. It ensures maximum readability across all devices and maintains a clean, contemporary look.
- **Styling Note:** Use `label-caps` for category tags and small eyebrows to introduce a rhythmic contrast to the serif headlines.

## Layout & Spacing
The layout philosophy follows a **Fixed-Fluid Hybrid** model. Content is contained within a 1280px max-width wrapper on desktop to ensure line lengths remain readable, while margins and gutters scale proportionally on smaller screens.

- **Grid:** Use a 12-column grid for desktop (24px gutters) and a 4-column grid for mobile (16px margins).
- **Rhythm:** Spacing follows an 8px base unit. Generous vertical padding (`lg` and `xl`) should be used between sections to maintain the "lifestyle" feel and prevent the UI from feeling "crowded" or "discount-oriented."
- **Alignment:** Consistent left-alignment is preferred for editorial sections; center-alignment is reserved for featured hero banners.

## Elevation & Depth
This design system avoids heavy, dark shadows in favor of **Ambient Softness**. 

- **Surface Tiers:** Depth is primarily communicated through tonal changes (White cards on Off-white backgrounds).
- **Shadows:** When necessary for interactivity (e.g., hovering over a product card), use a multi-layered, low-opacity shadow (e.g., `box-shadow: 0 4px 20px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)`).
- **Glassmorphism:** Use a subtle backdrop blur (10px - 15px) for sticky navigation headers to maintain a sense of space and context while scrolling.

## Shapes
The shape language is "Soft-Modern." Elements utilize significant rounding to feel approachable and organic.

- **Standard Radius:** 8px (0.5rem) for small components like inputs and tags.
- **Large Radius:** 16px (1rem) for product cards and primary containers.
- **Extra Large Radius:** 24px (1.5rem) for featured promotional banners or large modals.
- **Imagery:** Product photography should always feature consistent 8px corner rounding to match the UI components.

## Components
- **Buttons:** 
  - *Primary:* Solid #1A1A1A background, white text, 12px-16px corner radius.
  - *Secondary:* Outlined #1A1A1A (1px), transparent background.
  - *Ghost:* No border or background; uses `label-caps` styling with a subtle underline on hover.
- **Input Fields:** 1px border (#E5E5E5), 8px radius. Focus state shifts border to #1A1A1A with no heavy glow.
- **Cards:** White background, 16px radius, subtle 1px border or very soft ambient shadow.
- **Chips/Tags:** Small, pill-shaped (#F0F0F0 background) with `body-sm` or `label-caps` text.
- **Icons:** Use "Light" or "Thin" weight strokes (1px to 1.5px). Icons should never be filled unless they are in an active/selected state.
- **Product Listing:** Images should have a 4:5 or 1:1 aspect ratio to maintain a clean, rhythmic grid.