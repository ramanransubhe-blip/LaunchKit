export const tokens = {
  // Spacing scale (rem)
  spacing: {
    xs: "0.25rem",    // 4px
    sm: "0.5rem",     // 8px
    md: "1rem",       // 16px
    lg: "1.5rem",     // 24px
    xl: "2rem",       // 32px
    xxl: "3rem",      // 48px
    xxxl: "4rem",     // 64px
  },

  // Typography Size Scale (fontSize/lineHeight)
  typography: {
    fontFamily: {
      sans: "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
      mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    },
    sizes: {
      xs: { size: "0.75rem", height: "1rem" },
      sm: { size: "0.875rem", height: "1.25rem" },
      base: { size: "1rem", height: "1.5rem" },
      lg: { size: "1.125rem", height: "1.75rem" },
      xl: { size: "1.25rem", height: "1.875rem" },
      xxl: { size: "1.5rem", height: "2rem" },
      "3xl": { size: "1.875rem", height: "2.25rem" },
      "4xl": { size: "2.25rem", height: "2.5rem" },
      "5xl": { size: "3rem", height: "1" },
    },
    weights: {
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
      black: "900",
    },
  },

  // Border Radii (rem)
  borderRadius: {
    none: "0",
    sm: "0.125rem",   // 2px
    md: "0.375rem",   // 6px
    lg: "0.5rem",     // 8px
    xl: "0.75rem",    // 12px
    xxl: "1rem",      // 16px
    full: "9999px",
  },

  // Responsive Breakpoints (px)
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },

  // Shadows
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
    outline: "0 0 0 3px rgba(99, 102, 241, 0.5)",
  },

  // Animations & Transitions
  transitions: {
    duration: {
      fast: "150ms",
      normal: "200ms",
      slow: "300ms",
    },
    timing: {
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      easeOut: "cubic-bezier(0, 0, 0.2, 1)",
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      linear: "linear",
    },
  },

  // Z-Index Layers
  zIndex: {
    hide: -1,
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    overlay: 1200,
    modal: 1300,
    popover: 1400,
    toast: 1500,
    tooltip: 1600,
  },
};
export type Tokens = typeof tokens;
