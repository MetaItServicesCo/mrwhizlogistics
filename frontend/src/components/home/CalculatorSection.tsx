"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useSpring,
  useTransform,
  useInView,
  useReducedMotion,
} from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Slider from "@mui/material/Slider";
import Button from "@mui/material/Button";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

const LIME = "#c8ff00";
const WEEKS = 52;

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    borderRadius: "12px",
    bgcolor: "rgba(255,255,255,0.03)",
    fontWeight: 600,
    "& fieldset": { borderColor: "rgba(255,255,255,0.14)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.32)" },
    "&.Mui-focused fieldset": { borderColor: LIME },
  },
} as const;

/* ---- One digit that slides to its value ---- */
function RollDigit({ digit }: { digit: number }) {
  return (
    <Box
      sx={{
        position: "relative",
        width: "0.6em",
        height: "1em",
        overflow: "hidden",
        display: "inline-block",
      }}
    >
      <motion.div
        animate={{ y: `${-digit * 10}%` }}
        transition={{ type: "spring", stiffness: 200, damping: 26 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
          <Box
            key={d}
            sx={{
              height: "1em",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            {d}
          </Box>
        ))}
      </motion.div>
    </Box>
  );
}

/* ---- Rolling odometer number (perfectly aligned) ---- */
function Odometer({
  value,
  active,
  prefix = "$",
}: {
  value: number;
  active: boolean;
  prefix?: string;
}) {
  const spring = useSpring(0, { stiffness: 55, damping: 20, mass: 1 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    spring.set(active ? Math.max(0, value) : 0);
  }, [value, active, spring]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => {
      setDisplay(Math.round(v).toLocaleString("en-US"));
    });
    return () => unsub();
  }, [spring]);

  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        fontVariantNumeric: "tabular-nums",
        lineHeight: 1,
      }}
    >
      <Box component="span" sx={{ mr: "0.04em" }}>
        {prefix}
      </Box>
      {display.split("").map((ch, i) => {
        if (ch === ",") {
          return (
            <Box key={`c${i}`} component="span" sx={{ mx: "0.02em" }}>
              ,
            </Box>
          );
        }
        return <RollDigit key={`${i}-${display.length}`} digit={Number(ch)} />;
      })}
    </Box>
  );
}

/* ---- Plain spring count-up (for %, category values) ---- */
function AnimatedNumber({
  value,
  active,
  prefix = "",
  suffix = "",
}: {
  value: number;
  active: boolean;
  prefix?: string;
  suffix?: string;
}) {
  const spring = useSpring(0, { stiffness: 80, damping: 26, mass: 0.7 });
  useEffect(() => {
    spring.set(active ? value : 0);
  }, [value, active, spring]);
  const text = useTransform(
    spring,
    (v) => `${prefix}${Math.round(v).toLocaleString("en-US")}${suffix}`,
  );
  return <motion.span>{text}</motion.span>;
}

/* ---- Radial savings gauge ---- */
function Gauge({ value, active }: { value: number; active: boolean }) {
  const R = 46;
  const C = 2 * Math.PI * R;
  const spring = useSpring(0, { stiffness: 60, damping: 22 });
  useEffect(() => {
    spring.set(active ? value : 0);
  }, [value, active, spring]);
  const offset = useTransform(spring, (v) => C - (Math.min(v, 100) / 100) * C);
  return (
    <Box
      sx={{
        position: "relative",
        width: { xs: 104, md: 120 },
        height: { xs: 104, md: 120 },
        flexShrink: 0,
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 120 120"
        sx={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}
      >
        <circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={C}
          style={{ strokeDashoffset: offset }}
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c8ff00" />
            <stop offset="100%" stopColor="#00e5ff" />
          </linearGradient>
        </defs>
      </Box>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: 20, md: 24 },
            fontWeight: 800,
            color: LIME,
            lineHeight: 1,
          }}
        >
          <AnimatedNumber value={value} active={active} suffix="%" />
        </Typography>
        <Typography
          sx={{
            fontSize: 9,
            color: "rgba(255,255,255,0.5)",
            letterSpacing: 1.5,
            mt: 0.3,
          }}
        >
          SAVED
        </Typography>
      </Box>
    </Box>
  );
}

/* ---- Category bar with shine sweep ---- */
function Bar({
  pct,
  active,
  delay,
  reduce,
}: {
  pct: number;
  active: boolean;
  delay: number;
  reduce: boolean;
}) {
  return (
    <Box
      sx={{
        position: "relative",
        height: 6,
        borderRadius: 3,
        bgcolor: "rgba(255,255,255,0.08)",
        overflow: "hidden",
        mt: 1,
      }}
    >
      <Box
        component={motion.div}
        initial={false}
        animate={{ width: active ? `${pct}%` : "0%" }}
        transition={{ duration: 0.8, ease: "easeOut", delay }}
        sx={{
          position: "relative",
          height: "100%",
          borderRadius: 3,
          background: `linear-gradient(90deg, ${LIME}, #7fb800)`,
          overflow: "hidden",
        }}
      >
        {!reduce && (
          <Box
            component={motion.div}
            animate={{ x: ["-120%", "340%"] }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: delay + 0.6,
            }}
            sx={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: "45%",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
            }}
          />
        )}
      </Box>
    </Box>
  );
}

/* ---- Confetti burst (no library) ---- */
function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 220,
        y: -(90 + Math.random() * 150),
        rot: (Math.random() - 0.5) * 620,
        color: ["#c8ff00", "#00e5ff", "#ff4dd8", "#ffffff"][i % 4],
        delay: Math.random() * 0.12,
      })),
    [],
  );
  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        left: "50%",
        bottom: 90,
        zIndex: 5,
        pointerEvents: "none",
      }}
    >
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
          animate={{ opacity: 0, x: p.x, y: p.y, rotate: p.rot }}
          transition={{ duration: 1.15, delay: p.delay, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: 8,
            height: 8,
            borderRadius: 2,
            background: p.color,
          }}
        />
      ))}
    </Box>
  );
}

/* ---- Magnetic button ---- */
function MagneticButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  const x = useSpring(0, { stiffness: 200, damping: 15 });
  const y = useSpring(0, { stiffness: 200, damping: 15 });
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.35);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.35);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };
  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x, y, display: "inline-block" }}
    >
      <Button
        disableElevation
        onClick={onClick}
        sx={{
          bgcolor: LIME,
          color: "#000",
          fontWeight: 700,
          borderRadius: "12px",
          px: 3,
          py: 1,
          textTransform: "none",
          whiteSpace: "nowrap",
          "&:hover": { bgcolor: "#d4ff33" },
        }}
      >
        {children}
      </Button>
    </motion.div>
  );
}

function NumField({
  label,
  value,
  onChange,
  min = 0,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
}) {
  return (
    <Box>
      <Typography
        sx={{ fontSize: 12, color: "rgba(255,255,255,0.5)", mb: 0.75 }}
      >
        {label}
      </Typography>
      <TextField
        type="number"
        size="small"
        fullWidth
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        slotProps={{ htmlInput: { min, step } }}
        sx={fieldSx}
      />
    </Box>
  );
}

export default function CalculatorSection() {
  const reduce = useReducedMotion() ?? false;
  const [inp, setInp] = useState({
    gates: 2,
    shifts: 3,
    days: 6,
    spotters: 3,
    checkIns: 40,
    wage: 25,
    detention: 1,
  });
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const set = (key: keyof typeof inp) => (v: number) =>
    setInp((p) => ({ ...p, [key]: v }));

  const calc = useMemo(() => {
    const annualShifts = inp.shifts * inp.days * WEEKS;
    const labor = inp.gates * annualShifts * inp.wage * 1.8;
    const spotter = inp.spotters * annualShifts * inp.wage * 1.4 * 1.6;
    const sevMult = [0.6, 1.0, 1.5][inp.detention] ?? 1;
    const detention = inp.checkIns * inp.days * WEEKS * 14 * sevMult;
    const total = labor + spotter + detention;
    const baseline =
      (inp.gates + inp.spotters) * annualShifts * inp.wage * 8 +
      detention * 2.5;
    const pct = Math.min(38, Math.max(9, Math.round((total / baseline) * 100)));
    const perDay = total / (inp.days * WEEKS);
    return { labor, spotter, detention, total, pct, perDay };
  }, [inp]);

  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { once: true, margin: "-100px" });

  const rows = [
    {
      label: "Labor Savings",
      sub: "Gate, Traffic, Dispatch, Yard Check",
      value: calc.labor,
    },
    {
      label: "Spotter Savings",
      sub: "Drivers & Unit Leases",
      value: calc.spotter,
    },
    {
      label: "Detention & Demurrage",
      sub: "Reduced wait-time penalties",
      value: calc.detention,
    },
  ];

  return (
    <Box
      component="section"
      aria-labelledby="calc-title"
      sx={{
        position: "relative",
        bgcolor: "#0a0a0a",
        color: "#fff",
        py: { xs: 8, md: 2 },
        px: { xs: 3, md: 6 },
        overflow: "hidden",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: "10%",
          right: "-6%",
          width: 560,
          height: 420,
          background:
            "radial-gradient(ellipse, rgba(200,255,0,0.09), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* heading */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          mb: { xs: 6, md: 9 },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-90px" }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            component="p"
            sx={{
              color: LIME,
              letterSpacing: 3,
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              mb: 2,
            }}
          >
            Yard Efficiency Calculator
          </Typography>
          <Typography
            id="calc-title"
            component="h2"
            sx={{
              fontWeight: 800,
              lineHeight: 1.1,
              fontSize: { xs: "2rem", sm: "2.7rem", md: "3.4rem" },
              maxWidth: 760,
              mx: "auto",
              background: `linear-gradient(90deg, #ffffff, ${LIME}, #00e5ff, #ffffff)`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
              animation: "calcShimmer 6s linear infinite",
              "@keyframes calcShimmer": {
                to: { backgroundPosition: "200% center" },
              },
              "@media (prefers-reduced-motion: reduce)": { animation: "none" },
            }}
          >
            What&apos;s your yard costing you?
          </Typography>
        </motion.div>
      </Box>

      {/* grid */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1180,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1.05fr" },
          gap: { xs: 4, md: 5 },
          alignItems: "start",
        }}
      >
        {/* LEFT — inputs */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, margin: "-90px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Typography
            sx={{
              fontSize: 12,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: 2,
              textTransform: "uppercase",
              mb: 1,
            }}
          >
            Calculator
          </Typography>
          <Typography
            component="h3"
            sx={{
              fontSize: { xs: "1.5rem", md: "1.9rem" },
              fontWeight: 700,
              mb: 4,
            }}
          >
            Tell us about your yard
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2.5,
            }}
          >
            <NumField
              label="Number of gates"
              value={inp.gates}
              onChange={set("gates")}
              min={1}
            />
            <NumField
              label="Shifts per day"
              value={inp.shifts}
              onChange={set("shifts")}
              min={1}
            />
            <NumField
              label="Operating days per week"
              value={inp.days}
              onChange={set("days")}
              min={1}
            />
            <NumField
              label="Spotters per shift"
              value={inp.spotters}
              onChange={set("spotters")}
              min={0}
            />
            <NumField
              label="Check-ins per day"
              value={inp.checkIns}
              onChange={set("checkIns")}
              min={0}
            />
            <NumField
              label="Blended hourly wage ($)"
              value={inp.wage}
              onChange={set("wage")}
              min={0}
            />
          </Box>

          <Box sx={{ mt: 4, px: 0.5 }}>
            <Typography
              sx={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)", mb: 1.5 }}
            >
              How significant are your annual detention &amp; demurrage costs?
            </Typography>
            <Slider
              value={inp.detention}
              onChange={(_, v) => set("detention")(v as number)}
              min={0}
              max={2}
              step={1}
              marks={[
                { value: 0, label: "Low" },
                { value: 1, label: "Medium" },
                { value: 2, label: "High" },
              ]}
              sx={{
                color: LIME,
                "& .MuiSlider-rail": {
                  bgcolor: "rgba(255,255,255,0.15)",
                  opacity: 1,
                },
                "& .MuiSlider-mark": { bgcolor: "rgba(255,255,255,0.3)" },
                "& .MuiSlider-markLabel": {
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 11,
                },
                "& .MuiSlider-thumb": {
                  "&:hover, &.Mui-focusVisible": {
                    boxShadow: "0 0 0 8px rgba(200,255,0,0.16)",
                  },
                },
              }}
            />
          </Box>
        </motion.div>

        {/* RIGHT — results card */}
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <Box
            sx={{
              position: "relative",
              borderRadius: "24px",
              p: "1.5px",
              background:
                "linear-gradient(160deg, rgba(200,255,0,0.5), rgba(255,255,255,0.05) 45%)",
            }}
          >
            <Box
              sx={{
                position: "relative",
                borderRadius: "23px",
                bgcolor: "#0d100c",
                p: { xs: 3, md: 4 },
                overflow: "hidden",
              }}
            >
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  top: -80,
                  right: -60,
                  width: 300,
                  height: 300,
                  background:
                    "radial-gradient(circle, rgba(200,255,0,0.18), transparent 65%)",
                  pointerEvents: "none",
                }}
              />

              {sent && !reduce && <Confetti />}

              {/* header: title + odometer + gauge */}
              <Box sx={{ position: "relative" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <Box
                    component={motion.span}
                    animate={
                      reduce ? {} : { opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }
                    }
                    transition={{ duration: 1.6, repeat: Infinity }}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: LIME,
                      display: "inline-block",
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.6)",
                      letterSpacing: 1,
                    }}
                  >
                    LIVE ESTIMATE
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: { xs: "1.3rem", md: "1.6rem" },
                    fontWeight: 700,
                    lineHeight: 1.15,
                    mb: 2,
                  }}
                >
                  With Terminal, your yard saves
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Box>
                    <Box
                      sx={{
                        fontSize: { xs: "2.2rem", md: "3rem" },
                        fontWeight: 800,
                        color: LIME,
                      }}
                    >
                      <Odometer value={calc.total} active={inView} prefix="$" />
                    </Box>
                    <Typography
                      sx={{
                        fontSize: 12.5,
                        color: "rgba(255,255,255,0.5)",
                        mt: 0.5,
                      }}
                    >
                      ≈{" "}
                      <Box
                        component="span"
                        sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 700 }}
                      >
                        <AnimatedNumber
                          value={calc.perDay}
                          active={inView}
                          prefix="$"
                        />
                      </Box>{" "}
                      saved every working day
                    </Typography>
                  </Box>
                  <Gauge value={calc.pct} active={inView} />
                </Box>
              </Box>

              {/* breakdown */}
              <Box sx={{ position: "relative", mt: 4 }}>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.45)",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    mb: 2,
                  }}
                >
                  Estimated annual savings by category
                </Typography>
                {rows.map((r, i) => (
                  <Box key={r.label} sx={{ mb: 2.5 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>
                          {r.label}
                        </Typography>
                        <Typography
                          sx={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}
                        >
                          {r.sub}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontSize: 15,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <AnimatedNumber
                          value={r.value}
                          active={inView}
                          prefix="$"
                        />
                      </Typography>
                    </Box>
                    <Bar
                      pct={calc.total > 0 ? (r.value / calc.total) * 100 : 0}
                      active={inView}
                      delay={i * 0.12}
                      reduce={reduce}
                    />
                  </Box>
                ))}
              </Box>

              {/* email capture */}
              <Box
                sx={{
                  position: "relative",
                  mt: 3,
                  p: 2.5,
                  borderRadius: "16px",
                  bgcolor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {sent ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      py: 1,
                    }}
                  >
                    <CheckCircleRoundedIcon sx={{ color: LIME }} />
                    <Typography
                      sx={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}
                    >
                      Thanks! Our team will send your custom ROI analysis
                      shortly.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1.5,
                      }}
                    >
                      <TrendingUpRoundedIcon
                        sx={{ color: LIME, fontSize: 20 }}
                      />
                      <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
                        Want a precise number?
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "rgba(255,255,255,0.55)",
                        mb: 2,
                      }}
                    >
                      Get a custom ROI analysis from one of our yard experts.
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { sm: "stretch" },
                      }}
                    >
                      <TextField
                        placeholder="name@company.com"
                        size="small"
                        fullWidth
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={fieldSx}
                      />
                      <MagneticButton
                        onClick={() => email.includes("@") && setSent(true)}
                      >
                        Submit
                      </MagneticButton>
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          </Box>
        </motion.div>
      </Box>
    </Box>
  );
}
