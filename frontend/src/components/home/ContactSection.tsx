"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Popover from "@mui/material/Popover";
import InputAdornment from "@mui/material/InputAdornment";
import Divider from "@mui/material/Divider";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import AirportShuttleRoundedIcon from "@mui/icons-material/AirportShuttleRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";

const LIME = "#c8ff00";

const BENEFITS = [
  "Right Equipment",
  "Fast & Accurate Response",
  "Reliable. Safe. On Time.",
];

type TruckCategory = "Hot Shot" | "Box Truck" | "Semi Truck";

type TruckOption = {
  name: string;
  category: TruckCategory;
  description: string;
  icon: "truck" | "van" | "trailer";
};

const TRUCK_OPTIONS: TruckOption[] = [
  // HOT SHOT
  {
    name: "Truck & Trailers",
    category: "Hot Shot",
    description: "Flexible truck and trailer hauling",
    icon: "truck",
  },
  {
    name: "Sprinter Van with Lifters",
    category: "Hot Shot",
    description: "Compact hauling with lift equipment",
    icon: "van",
  },
  {
    name: "16 Feet Enclosed Trailer",
    category: "Hot Shot",
    description: "Enclosed trailer for protected loads",
    icon: "trailer",
  },
  {
    name: "24 Feet Enclosed Trailer",
    category: "Hot Shot",
    description: "Extended enclosed cargo capacity",
    icon: "trailer",
  },
  {
    name: "40 Feet Flat Bed",
    category: "Hot Shot",
    description: "Large flatbed for oversized freight",
    icon: "truck",
  },
  {
    name: "20 Feet Flat Bed",
    category: "Hot Shot",
    description: "Flatbed hauling for general freight",
    icon: "truck",
  },

  // BOX TRUCK
  {
    name: "16 Feet Box Truck",
    category: "Box Truck",
    description: "Medium-capacity enclosed box truck",
    icon: "truck",
  },
  {
    name: "26 Feet Box Truck",
    category: "Box Truck",
    description: "Large box truck for heavier loads",
    icon: "truck",
  },

  // SEMI TRUCK
  {
    name: "Reefer Trailer (Fridge)",
    category: "Semi Truck",
    description: "Temperature-controlled freight",
    icon: "trailer",
  },
  {
    name: "Dry Van",
    category: "Semi Truck",
    description: "Standard enclosed semi trailer",
    icon: "trailer",
  },
  {
    name: "Flat Bed",
    category: "Semi Truck",
    description: "Open trailer for large freight",
    icon: "truck",
  },
];

const CATEGORY_INFO: Record<
  TruckCategory,
  {
    description: string;
    icon: React.ReactNode;
  }
> = {
  "Hot Shot": {
    description: "Fast, flexible hauling solutions",
    icon: <LocalShippingRoundedIcon />,
  },
  "Box Truck": {
    description: "Enclosed freight transportation",
    icon: <AirportShuttleRoundedIcon />,
  },
  "Semi Truck": {
    description: "Heavy-duty long-haul transportation",
    icon: <DirectionsCarRoundedIcon />,
  },
};

// --------------------------------------------------
// FIELD STYLES
// --------------------------------------------------

const fieldSx = {
  "& .MuiInputLabel-root": {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
  },

  "& .MuiInputLabel-root.Mui-focused": {
    color: LIME,
  },

  "& .MuiOutlinedInput-root": {
    color: "#fff",
    borderRadius: "12px",
    bgcolor: "rgba(255,255,255,0.03)",

    "& fieldset": {
      borderColor: "rgba(255,255,255,0.14)",
      transition: "border-color .25s, box-shadow .25s",
    },

    "&:hover fieldset": {
      borderColor: "rgba(255,255,255,0.3)",
    },

    "&.Mui-focused fieldset": {
      borderColor: LIME,
      boxShadow: `0 0 0 3px rgba(200,255,0,0.15)`,
    },
  },

  "& input::placeholder, & textarea::placeholder": {
    color: "rgba(255,255,255,0.3)",
    opacity: 1,
  },
} as const;

// --------------------------------------------------
// CONFETTI
// --------------------------------------------------

function Confetti() {
  const pieces = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 260,
    y: -(70 + Math.random() * 150),
    rot: (Math.random() - 0.5) * 600,
    color: ["#c8ff00", "#00e5ff", "#ff4dd8", "#fff"][i % 4],
    delay: Math.random() * 0.1,
  }));

  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        left: "50%",
        top: "40%",
        zIndex: 5,
        pointerEvents: "none",
      }}
    >
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            opacity: 1,
            x: 0,
            y: 0,
            rotate: 0,
          }}
          animate={{
            opacity: 0,
            x: p.x,
            y: p.y,
            rotate: p.rot,
          }}
          transition={{
            duration: 1.1,
            delay: p.delay,
            ease: "easeOut",
          }}
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

// --------------------------------------------------
// TRUCK ICON
// --------------------------------------------------

function TruckOptionIcon({ type }: { type: TruckOption["icon"] }) {
  if (type === "van") {
    return <AirportShuttleRoundedIcon />;
  }

  if (type === "trailer") {
    return <LocalShippingOutlinedIcon />;
  }

  return <LocalShippingRoundedIcon />;
}

// --------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------

export default function ContactSection() {
  const reduce = useReducedMotion() ?? false;

  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");

  const [truckAnchor, setTruckAnchor] = useState<HTMLElement | null>(null);

  const [truckSearch, setTruckSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    role: "",
    phone: "",
    email: "",
    company: "",
    truckType: "",
    message: "", // <-- Message/Textarea state add kar di gai hai
  });

  // --------------------------------------------------
  // FORM SETTER
  // --------------------------------------------------

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({
        ...p,
        [k]: e.target.value,
      }));

  // --------------------------------------------------
  // TRUCK SELECTOR
  // --------------------------------------------------

  const truckOpen = Boolean(truckAnchor);

  const selectedTruck = TRUCK_OPTIONS.find(
    (item) => item.name === form.truckType,
  );

  const filteredTruckOptions = useMemo(() => {
    const search = truckSearch.trim().toLowerCase();

    if (!search) {
      return TRUCK_OPTIONS;
    }

    return TRUCK_OPTIONS.filter((item) => {
      return (
        item.name.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search)
      );
    });
  }, [truckSearch]);

  const handleTruckOpen = (event: React.MouseEvent<HTMLElement>) => {
    setTruckAnchor(event.currentTarget);
  };

  const handleTruckClose = () => {
    setTruckAnchor(null);
    setTruckSearch("");
  };

  const handleTruckSelect = (truck: TruckOption) => {
    setForm((prev) => ({
      ...prev,
      truckType: truck.name,
    }));

    handleTruckClose();
  };

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------

  const submit = () => {
    if (!form.name || !form.email.includes("@") || !form.truckType) {
      return;
    }

    setStatus("loading");

    // TODO: backend banne par yahan real API call lagegi
    setTimeout(() => {
      setStatus("sent");
    }, 1300);
  };

  // --------------------------------------------------
  // ANIMATION
  // --------------------------------------------------

  const fieldVariant = {
    hidden: {
      opacity: 0,
      y: 18,
    },

    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <Box
      component="section"
      aria-labelledby="contact-title"
      sx={{
        position: "relative",
        bgcolor: "#0a0a0a",
        color: "#fff",
        py: { xs: 6, md: 6 },
        px: { xs: 3, sm: 4, md: 6, lg: 8 },
        overflow: "hidden",
      }}
    >
      {/* BACKGROUND GLOW */}

      <Box
        aria-hidden
        sx={{
          position: "absolute",
          bottom: "-10%",
          right: "-6%",
          width: 560,
          height: 460,
          background:
            "radial-gradient(ellipse, rgba(200,255,0,0.08), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* HEADER */}

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          maxWidth: 900,
          mx: "auto",
          mb: { xs: 6, md: 9 },
        }}
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: false,
            margin: "-80px",
          }}
          transition={{
            duration: 0.6,
          }}
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
            Get In Touch
          </Typography>

          <Typography
            id="contact-title"
            component="h2"
            sx={{
              fontWeight: 800,
              lineHeight: 1.12,
              fontSize: {
                xs: "1.9rem",
                sm: "2.5rem",
                md: "3.2rem",
              },
              background: `linear-gradient(90deg, #ffffff, ${LIME}, #00e5ff, #ffffff)`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
              animation: "contactShimmer 6s linear infinite",

              "@keyframes contactShimmer": {
                to: {
                  backgroundPosition: "200% center",
                },
              },

              "@media (prefers-reduced-motion: reduce)": {
                animation: "none",
              },
            }}
          >
            Contact us and we will be in touch the same day, your way
          </Typography>
        </motion.div>
      </Box>

      {/* GRID */}

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1120,
          mx: "auto",

          display: "grid",

          gridTemplateColumns: {
            xs: "minmax(0,1fr)",
            md: "0.85fr minmax(0,1fr)",
          },

          gap: {
            xs: 4,
            md: 6,
          },

          alignItems: "center",
        }}
      >
        {/* LEFT */}

        <motion.div
          initial={{
            opacity: 0,
            x: -40,
          }}
          whileInView={{
            opacity: 1,
            x: 0,
          }}
          viewport={{
            once: false,
            margin: "-80px",
          }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
          }}
        >
          <Typography
            sx={{
              fontSize: {
                xs: 15,
                md: 16.5,
              },
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.7,
              mb: 3,
              maxWidth: 420,
            }}
          >
            Tell us what type of truck or trailer you need and our team will
            help you find the right transportation solution.
          </Typography>

          <Box
            component={motion.ul}
            variants={{
              hidden: {},

              show: {
                transition: {
                  staggerChildren: 0.12,
                },
              },
            }}
            initial="hidden"
            whileInView="show"
            viewport={{
              once: false,
            }}
            sx={{
              listStyle: "none",
              p: 0,
              m: 0,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            {BENEFITS.map((b) => (
              <Box
                key={b}
                component={motion.li}
                variants={fieldVariant}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    bgcolor: "rgba(200,255,0,0.14)",
                    border: `1px solid ${LIME}55`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,

                    "& svg": {
                      fontSize: 15,
                      color: LIME,
                    },
                  }}
                >
                  <CheckRoundedIcon />
                </Box>

                <Typography
                  sx={{
                    fontSize: 15,
                    color: "rgba(255,255,255,0.85)",
                    fontWeight: 500,
                  }}
                >
                  {b}
                </Typography>
              </Box>
            ))}
          </Box>
        </motion.div>

        {/* RIGHT FORM CARD */}

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
              p: {
                xs: 3,
                md: 4,
              },
              overflow: "visible",
            }}
          >
            {/* CARD GLOW */}

            <Box
              aria-hidden
              sx={{
                position: "absolute",
                top: -70,
                right: -50,
                width: 260,
                height: 260,
                background:
                  "radial-gradient(circle, rgba(200,255,0,0.16), transparent 65%)",
                pointerEvents: "none",
              }}
            />

            <AnimatePresence mode="wait">
              {status === "sent" ? (
                /* SUCCESS */
                <motion.div
                  key="done"
                  initial={{
                    opacity: 0,
                    scale: 0.96,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.4,
                  }}
                  style={{
                    position: "relative",
                    textAlign: "center",
                    padding: "36px 8px",
                  }}
                >
                  {!reduce && <Confetti />}

                  <motion.div
                    initial={{
                      scale: 0,
                    }}
                    animate={{
                      scale: 1,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 12,
                      delay: 0.1,
                    }}
                    style={{
                      display: "inline-flex",
                    }}
                  >
                    <CheckCircleRoundedIcon
                      sx={{
                        fontSize: 64,
                        color: LIME,
                      }}
                    />
                  </motion.div>

                  <Typography
                    sx={{
                      fontSize: "1.4rem",
                      fontWeight: 800,
                      mt: 2,
                    }}
                  >
                    Message sent!
                  </Typography>

                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 14.5,
                      mt: 1,
                      maxWidth: 340,
                      mx: "auto",
                    }}
                  >
                    Thanks {form.name ? form.name.split(" ")[0] : ""} — our team
                    will reach out the same day.
                  </Typography>
                </motion.div>
              ) : (
                /* FORM */
                <Box
                  key="form"
                  component={motion.div}
                  variants={{
                    hidden: {},

                    show: {
                      transition: {
                        staggerChildren: 0.08,
                      },
                    },
                  }}
                  initial="hidden"
                  whileInView="show"
                  viewport={{
                    once: false,
                    margin: "-60px",
                  }}
                  sx={{
                    position: "relative",

                    display: "grid",

                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "1fr 1fr",
                    },

                    gap: 2.5,
                  }}
                >
                  {/* NAME */}

                  <motion.div variants={fieldVariant}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      required
                      placeholder="John Doe"
                      value={form.name}
                      onChange={set("name")}
                      sx={fieldSx}
                    />
                  </motion.div>

                  {/* ROLE */}

                  <motion.div variants={fieldVariant}>
                    <TextField
                      fullWidth
                      label="Role or position"
                      placeholder="Project manager"
                      value={form.role}
                      onChange={set("role")}
                      sx={fieldSx}
                    />
                  </motion.div>

                  {/* PHONE */}

                  <motion.div variants={fieldVariant}>
                    <TextField
                      fullWidth
                      label="Phone number"
                      placeholder="(323) 555-0147"
                      value={form.phone}
                      onChange={set("phone")}
                      sx={fieldSx}
                    />
                  </motion.div>

                  {/* EMAIL */}

                  <motion.div variants={fieldVariant}>
                    <TextField
                      fullWidth
                      label="Email"
                      required
                      type="email"
                      placeholder="name@company.com"
                      value={form.email}
                      onChange={set("email")}
                      sx={fieldSx}
                    />
                  </motion.div>

                  {/* COMPANY */}

                  <Box
                    component={motion.div}
                    variants={fieldVariant}
                    sx={{
                      gridColumn: {
                        sm: "span 2",
                      },
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Company name"
                      placeholder="Acme Logistics"
                      value={form.company}
                      onChange={set("company")}
                      sx={fieldSx}
                    />
                  </Box>

                  {/* ------------------------------------------------ */}
                  {/* ADVANCED TRUCK SELECTOR */}
                  {/* ------------------------------------------------ */}

                  <Box
                    component={motion.div}
                    variants={fieldVariant}
                    sx={{
                      gridColumn: {
                        sm: "span 2",
                      },
                    }}
                  >
                    <Typography
                      component="label"
                      sx={{
                        display: "block",
                        fontSize: 14,
                        color: "rgba(255,255,255,0.5)",
                        mb: 1,
                      }}
                    >
                      Truck Type{" "}
                      <Box
                        component="span"
                        sx={{
                          color: LIME,
                        }}
                      >
                        *
                      </Box>
                    </Typography>

                    {/* SELECT BUTTON */}

                    <Box
                      component="button"
                      type="button"
                      onClick={handleTruckOpen}
                      sx={{
                        width: "100%",
                        minHeight: 58,
                        borderRadius: "12px",
                        border:
                          truckOpen || selectedTruck
                            ? `1px solid ${LIME}`
                            : "1px solid rgba(255,255,255,0.14)",

                        bgcolor: "rgba(255,255,255,0.03)",

                        color: "#fff",

                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,

                        px: 2,

                        cursor: "pointer",

                        textAlign: "left",

                        transition: "all .25s ease",

                        boxShadow: truckOpen
                          ? `0 0 0 3px rgba(200,255,0,0.15)`
                          : "none",

                        "&:hover": {
                          borderColor: "rgba(255,255,255,0.3)",
                          bgcolor: "rgba(255,255,255,0.045)",
                        },
                      }}
                    >
                      {/* ICON */}

                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: "10px",

                          bgcolor: selectedTruck
                            ? "rgba(200,255,0,0.12)"
                            : "rgba(255,255,255,0.06)",

                          border: selectedTruck
                            ? `1px solid ${LIME}44`
                            : "1px solid rgba(255,255,255,0.08)",

                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",

                          flexShrink: 0,

                          "& svg": {
                            color: selectedTruck
                              ? LIME
                              : "rgba(255,255,255,0.55)",
                            fontSize: 20,
                          },
                        }}
                      >
                        {selectedTruck ? (
                          <TruckOptionIcon type={selectedTruck.icon} />
                        ) : (
                          <LocalShippingRoundedIcon />
                        )}
                      </Box>

                      {/* TEXT */}

                      <Box
                        sx={{
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        {selectedTruck ? (
                          <>
                            <Typography
                              sx={{
                                fontSize: 14.5,
                                fontWeight: 700,
                                color: "#fff",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {selectedTruck.name}
                            </Typography>

                            <Typography
                              sx={{
                                fontSize: 11.5,
                                color: "rgba(255,255,255,0.45)",
                                mt: 0.2,
                              }}
                            >
                              {selectedTruck.category}
                            </Typography>
                          </>
                        ) : (
                          <Typography
                            sx={{
                              fontSize: 14,
                              color: "rgba(255,255,255,0.38)",
                            }}
                          >
                            Choose your truck or trailer type
                          </Typography>
                        )}
                      </Box>

                      {/* ARROW */}

                      <KeyboardArrowDownRoundedIcon
                        sx={{
                          color: "rgba(255,255,255,0.55)",
                          transform: truckOpen
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                          transition: "transform .25s ease",
                        }}
                      />
                    </Box>

                    {/* ADVANCED POPOVER */}

                    <Popover
                      open={truckOpen}
                      anchorEl={truckAnchor}
                      onClose={handleTruckClose}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "left",
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "left",
                      }}
                      slotProps={{
                        paper: {
                          sx: {
                            mt: 1,
                            width: truckAnchor?.clientWidth || 400,

                            maxWidth: "calc(100vw - 48px)",

                            bgcolor: "#10130f",

                            color: "#fff",

                            border: "1px solid rgba(200,255,0,0.25)",

                            borderRadius: "16px",

                            overflow: "hidden",

                            boxShadow: "0 24px 70px rgba(0,0,0,0.6)",

                            backdropFilter: "blur(20px)",
                          },
                        },
                      }}
                    >
                      {/* SEARCH HEADER */}

                      <Box
                        sx={{
                          p: 1.5,
                          position: "relative",
                        }}
                      >
                        <TextField
                          autoFocus
                          fullWidth
                          size="small"
                          placeholder="Search truck or trailer..."
                          value={truckSearch}
                          onChange={(e) => setTruckSearch(e.target.value)}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              color: "#fff",
                              bgcolor: "rgba(255,255,255,0.04)",
                              borderRadius: "10px",

                              "& fieldset": {
                                borderColor: "rgba(255,255,255,0.1)",
                              },

                              "&:hover fieldset": {
                                borderColor: "rgba(255,255,255,0.2)",
                              },

                              "&.Mui-focused fieldset": {
                                borderColor: LIME,
                              },
                            },

                            "& input::placeholder": {
                              color: "rgba(255,255,255,0.35)",
                              opacity: 1,
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchRoundedIcon
                                  sx={{
                                    color: "rgba(255,255,255,0.4)",
                                  }}
                                />
                              </InputAdornment>
                            ),

                            endAdornment: truckSearch ? (
                              <InputAdornment position="end">
                                <Box
                                  component="button"
                                  type="button"
                                  onClick={() => setTruckSearch("")}
                                  sx={{
                                    border: 0,
                                    bgcolor: "transparent",
                                    color: "rgba(255,255,255,0.5)",
                                    display: "flex",
                                    cursor: "pointer",
                                    p: 0.5,
                                  }}
                                >
                                  <CloseRoundedIcon
                                    sx={{
                                      fontSize: 18,
                                    }}
                                  />
                                </Box>
                              </InputAdornment>
                            ) : null,
                          }}
                        />
                      </Box>

                      <Divider
                        sx={{
                          borderColor: "rgba(255,255,255,0.07)",
                        }}
                      />

                      {/* OPTIONS */}

                      <Box
                        sx={{
                          maxHeight: 390,
                          overflowY: "auto",

                          "&::-webkit-scrollbar": {
                            width: 5,
                          },

                          "&::-webkit-scrollbar-thumb": {
                            bgcolor: "rgba(255,255,255,0.1)",
                            borderRadius: "10px",
                          },

                          p: 1,
                        }}
                      >
                        {filteredTruckOptions.length === 0 ? (
                          <Box sx={{ p: 3, textAlign: "center" }}>
                            <Typography
                              sx={{
                                fontSize: 13.5,
                                color: "rgba(255,255,255,0.4)",
                              }}
                            >
                              No matching trucks or trailers found
                            </Typography>
                          </Box>
                        ) : (
                          filteredTruckOptions.map((item) => {
                            const isSelected = form.truckType === item.name;

                            return (
                              <Box
                                key={item.name}
                                component="button"
                                type="button"
                                onClick={() => handleTruckSelect(item)}
                                sx={{
                                  width: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1.5,
                                  p: 1.25,
                                  borderRadius: "10px",
                                  border: 0,
                                  cursor: "pointer",
                                  textAlign: "left",
                                  bgcolor: isSelected
                                    ? "rgba(200,255,0,0.12)"
                                    : "transparent",
                                  transition: "background-color .2s ease",
                                  "&:hover": {
                                    bgcolor: isSelected
                                      ? "rgba(200,255,0,0.18)"
                                      : "rgba(255,255,255,0.05)",
                                  },
                                  mb: 0.5,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: "8px",
                                    bgcolor: isSelected
                                      ? "rgba(200,255,0,0.2)"
                                      : "rgba(255,255,255,0.05)",
                                    border: isSelected
                                      ? `1px solid ${LIME}66`
                                      : "1px solid rgba(255,255,255,0.08)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                    "& svg": {
                                      fontSize: 18,
                                      color: isSelected
                                        ? LIME
                                        : "rgba(255,255,255,0.6)",
                                    },
                                  }}
                                >
                                  <TruckOptionIcon type={item.icon} />
                                </Box>

                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontSize: 14,
                                        fontWeight: isSelected ? 700 : 600,
                                        color: isSelected ? LIME : "#fff",
                                      }}
                                    >
                                      {item.name}
                                    </Typography>
                                    <Typography
                                      sx={{
                                        fontSize: 10.5,
                                        px: 1,
                                        py: 0.2,
                                        borderRadius: "6px",
                                        bgcolor: "rgba(255,255,255,0.06)",
                                        color: "rgba(255,255,255,0.5)",
                                      }}
                                    >
                                      {item.category}
                                    </Typography>
                                  </Box>
                                  <Typography
                                    sx={{
                                      fontSize: 12,
                                      color: "rgba(255,255,255,0.45)",
                                      mt: 0.2,
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {item.description}
                                  </Typography>
                                </Box>

                                {isSelected && (
                                  <CheckRoundedIcon
                                    sx={{ fontSize: 18, color: LIME }}
                                  />
                                )}
                              </Box>
                            );
                          })
                        )}
                      </Box>
                    </Popover>
                  </Box>

                  {/* ------------------------------------------------ */}
                  {/* MESSAGE / TEXTAREA FIELD */}
                  {/* ------------------------------------------------ */}

                  <Box
                    component={motion.div}
                    variants={fieldVariant}
                    sx={{
                      gridColumn: {
                        sm: "span 2",
                      },
                    }}
                  >
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Your Message / Details"
                      placeholder="Tell us about your route, timeline, or special requirements..."
                      value={form.message}
                      onChange={set("message")}
                      sx={fieldSx}
                    />
                  </Box>

                  {/* SUBMIT BUTTON */}

                  <Box
                    component={motion.div}
                    variants={fieldVariant}
                    sx={{
                      gridColumn: {
                        sm: "span 2",
                      },
                      mt: 1,
                    }}
                  >
                    <Button
                      fullWidth
                      disableElevation
                      onClick={submit}
                      disabled={status === "loading"}
                      sx={{
                        position: "relative",
                        overflow: "hidden",
                        bgcolor: LIME,
                        color: "#0a0a0a",
                        fontWeight: 800,
                        borderRadius: "12px",
                        py: 1.5,
                        textTransform: "none",
                        fontSize: 15,
                        "&:hover": {
                          bgcolor: "#d4ff33",
                        },
                        "&.Mui-disabled": {
                          bgcolor: LIME,
                          opacity: 0.8,
                          color: "#0a0a0a",
                        },
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: "-70%",
                          width: "55%",
                          height: "100%",
                          background:
                            "linear-gradient(120deg, transparent, rgba(255,255,255,0.6), transparent)",
                          transform: "skewX(-20deg)",
                          transition: "left .6s ease",
                        },
                        "&:hover::after": {
                          left: "130%",
                        },
                      }}
                    >
                      {status === "loading" ? (
                        <CircularProgress size={22} sx={{ color: "#0a0a0a" }} />
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  </Box>
                </Box>
              )}
            </AnimatePresence>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
