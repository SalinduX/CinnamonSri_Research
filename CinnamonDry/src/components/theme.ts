// ─── Cinnamon Theme ───────────────────────────────────────────────
// Warm spice palette: deep bark browns, burnt sienna, golden honey,
// cream parchment, smoky charcoal — like peeling fresh cinnamon bark

export const C = {
  // Backgrounds
  bg:          "#1A0F0A",   // Deep bark brown
  bgMid:       "#241208",   // Mid bark
  surface:     "#2E1810",   // Lifted surface
  surfaceHigh: "#3D2218",   // Higher surface
  card:        "#321A0E",   // Card background

  // Borders
  border:      "#5C3420",   // Bark crack brown
  borderLight: "#7A4530",   // Lighter border

  // Primary accent — cinnamon spice
  spice:       "#C4622D",   // Cinnamon spice
  spiceLight:  "#E8824A",   // Light spice
  spiceDim:    "#6B3418",   // Dimmed spice

  // Golden honey accent
  honey:       "#D4A017",   // Honey gold
  honeyLight:  "#F0C040",   // Light honey
  honeyDim:    "#6B5008",   // Dim honey

  // Cream / parchment text
  cream:       "#F2E8D9",   // Parchment cream
  text:        "#C8B49A",   // Warm text
  muted:       "#7A6455",   // Muted warm

  // Status colors — warm variants
  green:       "#7CB87A",   // Sage green
  greenDim:    "#1E3B1E",   // Dim sage
  red:         "#C44A2D",   // Ember red
  redDim:      "#3B1510",   // Dim ember
  blue:        "#7AAFC4",   // Misty blue

  // Gradients
  gradSpice:   ["#C4622D", "#8B3A18"] as [string, string],
  gradHoney:   ["#D4A017", "#8B6A0A"] as [string, string],
  gradBark:    ["#3D2218", "#1A0F0A"] as [string, string],
};

export const FONTS = {
  display: "Georgia",           // Elegant serif for headings
  body:    "Georgia",           // Consistent serif
  mono:    "Courier New",       // Monospace for values
};

export const SHADOWS = {
  spice: {
    shadowColor:   C.spice,
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius:  12,
    elevation:     8,
  },
  honey: {
    shadowColor:   C.honey,
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius:  10,
    elevation:     6,
  },
  card: {
    shadowColor:   "#000",
    shadowOffset:  { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius:  16,
    elevation:     10,
  },
};
