# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.







/* ---------- Pot Animation CSS ---------- */
const potCSS = `
  .pot-container {
    position: relative;
    width: 200px;
    height: 200px;
    margin: 20px auto;
    perspective: 1000px;
    margin-bottom: -3rem !important;  
  }

  .pongal-pot {
    position: absolute;
    width: 120px;
    height: 140px;
    top: 30px;
    left: 40px;
    transition: all 0.5s ease;
  }

  .pot-body {
    position: absolute;
    width: 120px;
    height: 100px;
    background: linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #8B4513 100%);
    border-radius: 60px 60px 40px 40px;
    bottom: 0;
    box-shadow: 
      inset 0 -10px 20px rgba(0,0,0,0.3),
      0 10px 30px rgba(139, 69, 19, 0.4);
    z-index: 2;
    animation: potFloat 3s ease-in-out infinite;
  }

  .pot-neck {
    position: absolute;
    width: 80px;
    height: 40px;
    background: linear-gradient(135deg, #A0522D 0%, #8B4513 100%);
    border-radius: 40px 40px 20px 20px;
    bottom: 100px;
    left: 20px;
    box-shadow: 
      inset 0 5px 15px rgba(255,255,255,0.2),
      0 5px 10px rgba(0,0,0,0.3);
    z-index: 3;
  }

  .pot-rim {
    position: absolute;
    width: 100px;
    height: 20px;
    background: linear-gradient(90deg, #FFD700 0%, #FFB300 50%, #FFD700 100%);
    border-radius: 50%;
    bottom: 135px;
    left: 10px;
    box-shadow: 
      0 5px 15px rgba(255, 179, 0, 0.4),
      inset 0 -3px 5px rgba(0,0,0,0.2);
    z-index: 4;
    animation: rimGlow 2s ease-in-out infinite;
  }

  .pot-design {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .design-1, .design-2, .design-3 {
    position: absolute;
    background: #ffffff;
    border-radius: 5px;
  }


  .design-2 {
    width: 60px;
    height: 8px;
    top: 50px;
    left: 30px;
  }


  /* Fire animation */
  .pot-fire {
    position: absolute;
    width: 80px;
    height: 60px;
    bottom: 145px;
    left: 20px;
    z-index: 1;
    animation: fireFlicker 0.5s ease-in-out infinite;
  }

  .flame {
    position: absolute;
    background: linear-gradient(to bottom, #FFD700, #FF4500);
    border-radius: 50% 50% 20% 20%;
    filter: blur(5px);
    animation: flameFloat 1s ease-in-out infinite;
  }

  .flame-1 {
    width: 40px;
    height: 50px;
    bottom: 0;
    left: 20px;
    animation-delay: 0s;
  }

  .flame-2 {
    width: 30px;
    height: 40px;
    bottom: 5px;
    left: 5px;
    animation-delay: 0.2s;
  }

  .flame-3 {
    width: 30px;
    height: 40px;
    bottom: 5px;
    right: 5px;
    animation-delay: 0.4s;
  }

  /* Smoke */
  .smoke {
    position: absolute;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    filter: blur(10px);
    animation: smokeRise 4s linear infinite;
  }

  .smoke-1, .smoke-2, .smoke-3 {
    width: 20px;
    height: 20px;
    bottom: 160px;
  }

  .smoke-1 {
    left: 30px;
    animation-delay: 0s;
  }

  .smoke-2 {
    left: 60px;
    animation-delay: 1s;
  }

  .smoke-3 {
    left: 90px;
    animation-delay: 2s;
  }

  /* Rice grains */
  .rice-grain {
    position: absolute;
    background: #ff0000;
    border-radius: 50%;
    width: 15px;
    height: 5px;
    opacity: 0;
  }

  .rice-1 { top: 20px; left: 5px; }
  .rice-2 { top: 50px; left: 70px; }
  .rice-3 { top: 60px; left: 55px; }
  .rice-4 { top: 70px; left: 65px; }

  /* Pot pieces for breaking animation */
  .pot-piece {
    position: absolute;
    background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
    border-radius: 10px;
    opacity: 0;
    transform-origin: center center;
    z-index: 10;
  }

  .piece-1 {
    width: 60px;
    height: 50px;
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  }

  .piece-2 {
    width: 40px;
    height: 60px;
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  }

  .piece-3 {
    width: 50px;
    height: 40px;
    clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
  }

  .piece-4 {
    width: 45px;
    height: 45px;
    border-radius: 50%;
  }

  .piece-5 {
    width: 70px;
    height: 30px;
    clip-path: polygon(0% 0%, 100% 0%, 80% 100%, 20% 100%);
  }

  /* Glowing effect for whole pot */
  .pot-glow {
    position: absolute;
    width: 140px;
    height: 140px;
    background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: glowPulse 2s ease-in-out infinite;
    z-index: -1;
  }

  /* Animations */
  @keyframes potFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes rimGlow {
    0%, 100% { 
      box-shadow: 
        0 5px 15px rgba(255, 179, 0, 0.4),
        inset 0 -3px 5px rgba(0,0,0,0.2);
    }
    50% { 
      box-shadow: 
        0 5px 25px rgba(255, 179, 0, 0.7),
        inset 0 -3px 5px rgba(0,0,0,0.2);
    }
  }

  @keyframes fireFlicker {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  @keyframes flameFloat {
    0%, 100% { 
      transform: translateY(0) scale(1);
      opacity: 0.8;
    }
    50% { 
      transform: translateY(-10px) scale(1.2);
      opacity: 1;
    }
  }

  @keyframes smokeRise {
    0% { 
      transform: translateY(0) scale(0.5);
      opacity: 0;
    }
    20% { 
      transform: translateY(-20px) scale(1);
      opacity: 0.5;
    }
    40% { 
      transform: translateY(-40px) scale(1.2);
      opacity: 0.3;
    }
    60% { 
      transform: translateY(-60px) scale(1.5);
      opacity: 0.2;
    }
    80% { 
      transform: translateY(-80px) scale(1.8);
      opacity: 0.1;
    }
    100% { 
      transform: translateY(-100px) scale(2);
      opacity: 0;
    }
  }

  @keyframes glowPulse {
    0%, 100% { 
      opacity: 0.5;
      transform: translate(-50%, -50%) scale(1);
    }
    50% { 
      opacity: 0.8;
      transform: translate(-50%, -50%) scale(1.1);
    }
  }

  @keyframes pieceFly {
    0% {
      opacity: 1;
      transform: translate(0, 0) rotate(0deg);
    }
    100% {
      opacity: 0;
      transform: translate(var(--tx), var(--ty)) rotate(var(--rot));
    }
  }

  @keyframes riceBounce {
    0% {
      opacity: 0;
      transform: translateY(0) scale(0);
    }
    20% {
      opacity: 1;
      transform: translateY(-20px) scale(1);
    }
    40% {
      transform: translateY(-40px) scale(1);
    }
    60% {
      transform: translateY(-60px) scale(1);
    }
    80% {
      transform: translateY(-80px) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(-100px) scale(0);
    }
  }

  @keyframes potShake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }

  @keyframes titleGlow {
    0%, 100% { 
      text-shadow: 
        0 0 20px #C62828, 
        0 0 40px rgba(198, 40, 40, 0.5),
        2px 2px 4px rgba(0,0,0,0.5);
    }
    50% { 
      text-shadow: 
        0 0 30px #FFD54F, 
        0 0 60px rgba(255, 213, 79, 0.7),
        3px 3px 6px rgba(0,0,0,0.7);
    }
  }

  @keyframes buttonPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
`;

const PotWrapper = styled("div")``;

/* ---------- Bouncing dots inside button ---------- */
const Dot = styled("span")({
  width: 10,
  height: 10,
  marginLeft: 4,
  borderRadius: "50%",
  display: "inline-block",
  background: "#FFD54F",
  animation: "dotPulse 0.6s ease-in-out infinite",
});

const FancyButton = styled("button")({
  "--stone-50": "#fafaf9",
  "--stone-800": "#C62828",
  "--yellow-400": "#FFD54F",

  fontFamily: '"Rubik", sans-serif',
  cursor: "pointer",
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  lineHeight: 1,
  fontSize: "1.2rem",
  borderRadius: "1rem",
  outline: "2px solid transparent",
  outlineOffset: "6px",
  color: "var(--stone-50)",
  background: "transparent",
  border: "none",
  padding: 0,
  opacity: 0,
  transform: "scale(0.8)",

  "&:active": {
    outlineColor: "var(--yellow-400)",
  },
  "&:focus-visible": {
    outlineColor: "var(--yellow-400)",
    outlineStyle: "dashed",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    zIndex: 0,
    height: "200%",
    maxHeight: "100px",
    aspectRatio: "1 / 1",
    margin: "auto",
    background: "#C62828",
    clipPath: `polygon(
      100% 50%,91.48% 56.57%,97.55% 65.45%,87.42% 69.07%,90.45% 79.39%,
      79.7% 79.7%,79.39% 90.45%,69.07% 87.42%,65.45% 97.55%,56.57% 91.48%,
      50% 100%,43.43% 91.48%,34.55% 97.55%,30.93% 87.42%,20.61% 90.45%,
      20.3% 79.7%,9.55% 79.39%,12.58% 69.07%,2.45% 65.45%,8.52% 56.57%,
      0% 50%,8.52% 43.43%,2.45% 34.55%,12.58% 30.93%,9.55% 20.61%,
      20.3% 20.3%,20.61% 9.55%,30.93% 12.58%,34.55% 2.45%,43.43% 8.52%,
      50% 0%,56.57% 8.52%,65.45% 2.45%,69.07% 12.58%,79.39% 9.55%,
      79.7% 20.3%,90.45% 20.61%,87.42% 30.93%,97.55% 34.55%,91.48% 43.43%
    )`,
    animation: "star-rotate 4s linear infinite",
    opacity: 0.1,
  },
  "&:hover::before": {
    opacity: 1,
  },
  "& > div": {
    padding: "2px",
    borderRadius: "1rem",
    backgroundColor: "var(--yellow-400)",
    transform: "translate(-4px,-4px)",
    transition: "all 150ms ease",
    boxShadow: `
      0.5px 0.5px 0 0 var(--yellow-400),
      1px 1px 0 0 var(--yellow-400),
      2px 2px 0 0 var(--yellow-400),
      3px 3px 0 0 var(--yellow-400),
      0 0 0 2px var(--stone-800),
      2px 2px 0 2px var(--stone-800),
      3px 3px 0 2px var(--stone-800),
      4px 4px 0 2px var(--stone-800),
      0 0 0 4px var(--stone-50),
      3px 3px 0 4px var(--stone-50),
      4px 4px 0 4px var(--stone-50)
    `,
  },
  "&:hover > div": {
    transform: "translate(0,0)",
    boxShadow: `
      0 0 0 0 var(--yellow-400),
      0 0 0 2px var(--stone-800),
      0 0 0 4px var(--stone-50)
    `,
  },
  "& > div > div": {
    position: "relative",
    borderRadius: "calc(1rem - 2px)",
    backgroundColor: "var(--stone-800)",
    display: "flex",
    alignItems: "center",
    padding: "1rem 2rem",
    gap: "0.5rem",
    filter: "drop-shadow(0 -1px 0 var(--stone-800))",
    fontFamily: '"Poppins", sans-serif',
    fontSize: "1.1rem",
  },
});

// Add animations
const extraKeyframes = `
@keyframes star-rotate { from {transform: rotate(0deg);} to {transform: rotate(360deg);} }
@keyframes dotPulse {
  0%, 100% { transform: translateY(0); opacity: 1; }
  50% { transform: translateY(-5px); opacity: 0.7; }
}
`;