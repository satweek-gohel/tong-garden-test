module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#14151A",
        muted: "#6B6D74",
        bg: "#F5F3EE",
        surface: "#FFFFFF",
        line: "#E6E2D8",
        primary: {
          DEFAULT: "#1E4638",
          dark: "#153029",
          soft: "#E4ECE7",
        },
        accent: {
          DEFAULT: "#C97A3D",
          soft: "#FBEEE2",
        },
        danger: {
          DEFAULT: "#B3432D",
          soft: "#F7E7E2",
        },
        info: {
          DEFAULT: "#2C5FA8",
          soft: "#E5EDF7",
        },
        success: {
          DEFAULT: "#2E7D53",
          soft: "#E3F1E9",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
      },
    },
  },
  plugins: [],
};
