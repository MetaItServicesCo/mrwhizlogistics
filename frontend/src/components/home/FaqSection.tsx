"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import ContactPhoneRoundedIcon from "@mui/icons-material/ContactPhoneRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
const LIME = "#c8ff00";

// --------------------------------------------------
// FAQ CATEGORIES
// --------------------------------------------------

const CATEGORIES = [
  "Hot Shot Trucking",
  "Box Truck",
  "Semi-Truck",
  "General FAQ",
] as const;

type Cat = (typeof CATEGORIES)[number];

// --------------------------------------------------
// FAQ TYPE
// --------------------------------------------------

type Faq = {
  cat: Cat;
  q: string;
  a: string;
};

// --------------------------------------------------
// FAQ DATA
// --------------------------------------------------

const FAQS: Faq[] = [
  // ==================================================
  // HOT SHOT TRUCKING
  // ==================================================

  {
    cat: "Hot Shot Trucking",
    q: "What is Hot Shot trucking?",
    a: "Hot Shot trucking is a fast and flexible freight transportation service designed for smaller, time-sensitive loads that don't require a full-size semi-truck.",
  },

  {
    cat: "Hot Shot Trucking",
    q: "What type of freight can you transport with Hot Shot trucks?",
    a: "We can handle equipment, machinery, construction materials, automotive parts, agricultural equipment, and other suitable freight.",
  },

  {
    cat: "Hot Shot Trucking",
    q: "How quickly can Hot Shot freight be delivered?",
    a: "Hot Shot services are designed for time-sensitive shipments. Delivery time depends on the pickup location, destination, load size, and route.",
  },

  {
    cat: "Hot Shot Trucking",
    q: "Do you offer same-day Hot Shot delivery?",
    a: "Yes, same-day and expedited delivery may be available depending on the shipment details, location, and driver availability.",
  },

  {
    cat: "Hot Shot Trucking",
    q: "What size loads can a Hot Shot truck handle?",
    a: "Hot Shot capacity depends on the truck and trailer configuration. Contact us with your freight dimensions and weight so we can determine the appropriate equipment.",
  },

  {
    cat: "Hot Shot Trucking",
    q: "Do you provide expedited Hot Shot transportation?",
    a: "Yes. We offer expedited transportation options for customers who need their freight moved quickly and reliably.",
  },

  // ==================================================
  // BOX TRUCK
  // ==================================================

  {
    cat: "Box Truck",
    q: "What is Box Truck transportation?",
    a: "Box truck transportation is ideal for moving smaller and medium-sized shipments in an enclosed cargo area, providing protection from weather and road conditions.",
  },

  {
    cat: "Box Truck",
    q: "What types of freight can be transported in a Box Truck?",
    a: "Box trucks are suitable for general freight, retail goods, furniture, packaged products, equipment, supplies, and other cargo that fits within the truck's capacity.",
  },

  {
    cat: "Box Truck",
    q: "Are Box Trucks suitable for local deliveries?",
    a: "Yes. Box trucks are an excellent option for local, regional, and scheduled delivery services.",
  },

  {
    cat: "Box Truck",
    q: "Can you handle commercial and business deliveries?",
    a: "Yes. We can provide transportation solutions for businesses, warehouses, retailers, manufacturers, contractors, and other commercial customers.",
  },

  {
    cat: "Box Truck",
    q: "Do Box Trucks protect freight from weather?",
    a: "Yes. The enclosed cargo area helps protect shipments from rain, snow, dust, and other outdoor conditions.",
  },

  {
    cat: "Box Truck",
    q: "Can I use a Box Truck for expedited delivery?",
    a: "Depending on availability and shipment requirements, expedited Box Truck delivery can be arranged.",
  },

  // ==================================================
  // SEMI-TRUCK
  // ==================================================

  {
    cat: "Semi-Truck",
    q: "What is Semi-Truck transportation?",
    a: "Semi-truck transportation is designed for larger and heavier freight that requires a tractor-trailer and greater cargo capacity.",
  },

  {
    cat: "Semi-Truck",
    q: "What types of freight can you transport with Semi-Trucks?",
    a: "We can transport a wide range of commercial freight, including palletized goods, machinery, equipment, construction materials, and other large shipments.",
  },

  {
    cat: "Semi-Truck",
    q: "Do you offer long-distance Semi-Truck transportation?",
    a: "Yes. Semi-trucks are well suited for regional and long-distance freight transportation.",
  },

  {
    cat: "Semi-Truck",
    q: "Can you transport full truckload (FTL) shipments?",
    a: "Yes. We can provide transportation solutions for full truckload shipments based on your freight requirements and destination.",
  },

  {
    cat: "Semi-Truck",
    q: "How do I know if I need a Semi-Truck?",
    a: "A Semi-Truck is generally the right choice when your shipment is too large, heavy, or numerous for a Hot Shot or Box Truck. We can help determine the appropriate equipment for your load.",
  },

  {
    cat: "Semi-Truck",
    q: "Do you provide reliable freight delivery?",
    a: "Yes. Our goal is to provide dependable transportation, professional service, and on-time delivery while keeping your freight moving efficiently.",
  },

  // ==================================================
  // GENERAL FAQ
  // ==================================================

  {
    cat: "General FAQ",
    q: "How do I get a quote for my shipment?",
    a: "Simply contact us with your pickup location, delivery location, freight type, dimensions, weight, and preferred delivery date. Our team can recommend the right trucking solution and provide a quote.",
  },
];

// --------------------------------------------------
// CATEGORY ICON
// --------------------------------------------------

function CategoryIcon({ cat }: { cat: Cat }) {
  if (cat === "Hot Shot Trucking") {
    return <LocalShippingRoundedIcon />;
  }

  if (cat === "Box Truck") {
    return <Inventory2RoundedIcon />;
  }

  if (cat === "Semi-Truck") {
    return <LocalShippingRoundedIcon />;
  }

  return <ContactPhoneRoundedIcon />;
}

// --------------------------------------------------
// FAQ ROW
// --------------------------------------------------

function FaqRow({
  faq,
  open,
  onToggle,
  index,
}: {
  faq: Faq;
  open: boolean;
  onToggle: () => void;
  index: number;
}) {
  const btnId = `faq-btn-${faq.cat}-${index}`;
  const panelId = `faq-panel-${faq.cat}-${index}`;

  return (
    <Box
      component={motion.div}
      layout
      variants={{
        hidden: {
          opacity: 0,
          y: 18,
        },

        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
      sx={{
        position: "relative",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {/* OPEN ACCENT */}

      <Box
        component={motion.div}
        animate={{
          scaleY: open ? 1 : 0,
        }}
        transition={{
          duration: 0.3,
        }}
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          bgcolor: LIME,
          transformOrigin: "center",
          borderRadius: 2,
        }}
      />

      {/* QUESTION */}

      <Box component="h3" sx={{ m: 0 }}>
        <Box
          component="button"
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          id={btnId}
          sx={{
            width: "100%",

            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",

            gap: 2,

            background: "none",
            border: "none",

            cursor: "pointer",
            textAlign: "left",

            py: {
              xs: 2.2,
              md: 2.6,
            },

            pl: {
              xs: 2,
              md: 2.5,
            },

            pr: 1,

            color: "inherit",
            fontFamily: "inherit",
          }}
        >
          <Typography
            component="span"
            sx={{
              fontSize: {
                xs: "1rem",
                md: "1.12rem",
              },

              fontWeight: 600,

              color: open ? LIME : "#fff",

              transition: "color .3s",

              lineHeight: 1.4,
            }}
          >
            {faq.q}
          </Typography>

          <Box
            component={motion.div}
            animate={{
              rotate: open ? 135 : 0,
              color: open ? LIME : "rgba(255,255,255,0.5)",
            }}
            transition={{
              duration: 0.3,
            }}
            sx={{
              flexShrink: 0,
              display: "flex",
            }}
          >
            <AddRoundedIcon />
          </Box>
        </Box>
      </Box>

      {/* ANSWER */}

      <Box
        component={motion.div}
        id={panelId}
        role="region"
        aria-labelledby={btnId}
        initial={false}
        animate={{
          height: open ? "auto" : 0,
          opacity: open ? 1 : 0,
        }}
        transition={{
          duration: 0.35,
          ease: "easeInOut",
        }}
        sx={{
          overflow: "hidden",
        }}
      >
        <Typography
          sx={{
            pl: {
              xs: 2,
              md: 2.5,
            },

            pr: {
              xs: 4,
              md: 6,
            },

            pb: 2.6,

            color: "rgba(255,255,255,0.62)",

            fontSize: {
              xs: 14,
              md: 15,
            },

            lineHeight: 1.75,
          }}
        >
          {faq.a}
        </Typography>
      </Box>
    </Box>
  );
}

// --------------------------------------------------
// MAIN FAQ SECTION
// --------------------------------------------------

export default function FaqSection() {
  const [cat, setCat] = useState<Cat>("Hot Shot Trucking");

  const [openKey, setOpenKey] = useState<string | null>(null);

  const list = FAQS.filter((faq) => faq.cat === cat);

  // --------------------------------------------------
  // FAQ SCHEMA
  // --------------------------------------------------

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",

    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",

      name: faq.q,

      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <>
      {/* ================================================
          SEO FAQ SCHEMA
      ================================================= */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />

      {/* ================================================
          FAQ SECTION
      ================================================= */}

      <Box
        component="section"
        aria-labelledby="faq-title"
        sx={{
          position: "relative",

          bgcolor: "#0a0a0a",

          color: "#fff",

          py: {
            xs: 6,
            md: 6,
          },

          px: {
            xs: 3,
            sm: 4,
            md: 6,
            lg: 8,
          },

          overflow: "hidden",
        }}
      >
        {/* BACKGROUND GLOW */}

        <Box
          aria-hidden
          sx={{
            position: "absolute",

            top: "10%",
            left: "-6%",

            width: 480,
            height: 400,

            background:
              "radial-gradient(ellipse, rgba(200,255,0,0.07), transparent 70%)",

            pointerEvents: "none",
          }}
        />

        {/* SECOND GLOW */}

        <Box
          aria-hidden
          sx={{
            position: "absolute",

            bottom: "-15%",
            right: "-8%",

            width: 520,
            height: 420,

            background:
              "radial-gradient(ellipse, rgba(0,229,255,0.045), transparent 70%)",

            pointerEvents: "none",
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,

            maxWidth: 1180,
            mx: "auto",

            display: "grid",

            gridTemplateColumns: {
              xs: "minmax(0,1fr)",
              md: "0.7fr minmax(0,1fr)",
            },

            gap: {
              xs: 4,
              md: 8,
            },

            alignItems: "start",
          }}
        >
          {/* ==================================================
              LEFT
          ================================================== */}

          <Box
            sx={{
              position: {
                md: "sticky",
              },

              top: {
                md: 100,
              },
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
                margin: "-90px",
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
                Trucking FAQ
              </Typography>

              <Typography
                id="faq-title"
                component="h2"
                sx={{
                  fontWeight: 800,

                  lineHeight: 1.1,

                  fontSize: {
                    xs: "2.2rem",
                    md: "3.2rem",
                  },

                  mb: 2,
                }}
              >
                Frequently Asked Questions
              </Typography>

              <Typography
                sx={{
                  color: "rgba(255,255,255,0.6)",

                  fontSize: {
                    xs: 14.5,
                    md: 16,
                  },

                  lineHeight: 1.7,

                  maxWidth: 360,
                }}
              >
                Find answers to common questions about our Hot Shot, Box Truck,
                and Semi-Truck transportation services.
              </Typography>

              {/* SMALL SERVICE STATS */}

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,

                  mt: 3,
                }}
              >
                {["Hot Shot", "Box Truck", "Semi-Truck"].map((item) => (
                  <Box
                    key={item}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.7,

                      px: 1.2,
                      py: 0.7,

                      borderRadius: "999px",

                      border: "1px solid rgba(200,255,0,0.2)",

                      bgcolor: "rgba(200,255,0,0.04)",
                    }}
                  >
                    <CheckRoundedIcon
                      sx={{
                        color: LIME,
                        fontSize: 14,
                      }}
                    />

                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.65)",
                      }}
                    >
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </motion.div>
          </Box>

          {/* ==================================================
              RIGHT
          ================================================== */}

          <Box
            sx={{
              minWidth: 0,
            }}
          >
            {/* CATEGORY TABS */}

            <Box
              sx={{
                display: "flex",

                gap: 1,

                mb: 3,

                overflowX: "auto",

                pb: 1,

                scrollbarWidth: "none",

                "&::-webkit-scrollbar": {
                  display: "none",
                },
              }}
            >
              {CATEGORIES.map((category) => {
                const active = category === cat;

                return (
                  <Box
                    key={category}
                    component="button"
                    type="button"
                    onClick={() => {
                      setCat(category);
                      setOpenKey(null);
                    }}
                    sx={{
                      position: "relative",

                      flexShrink: 0,

                      cursor: "pointer",

                      fontFamily: "inherit",

                      whiteSpace: "nowrap",

                      px: 2,

                      py: 1,

                      borderRadius: "999px",

                      fontSize: 11.5,

                      fontWeight: 700,

                      letterSpacing: 1,

                      textTransform: "uppercase",

                      border: "1px solid transparent",

                      color: active ? "#0a0a0a" : "rgba(255,255,255,0.7)",

                      transition: "color .3s",

                      display: "flex",
                      alignItems: "center",
                      gap: 0.7,
                    }}
                  >
                    {active && (
                      <Box
                        component={motion.div}
                        layoutId="faqTab"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 32,
                        }}
                        sx={{
                          position: "absolute",

                          inset: 0,

                          borderRadius: "999px",

                          bgcolor: LIME,

                          zIndex: -1,
                        }}
                      />
                    )}

                    {!active && (
                      <Box
                        sx={{
                          position: "absolute",

                          inset: 0,

                          borderRadius: "999px",

                          border: "1px solid rgba(255,255,255,0.15)",

                          zIndex: -1,
                        }}
                      />
                    )}

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",

                        "& svg": {
                          fontSize: 15,
                        },
                      }}
                    >
                      <CategoryIcon cat={category} />
                    </Box>

                    {category}
                  </Box>
                );
              })}
            </Box>

            {/* ACTIVE CATEGORY TITLE */}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                mb: 2.5,
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,

                  borderRadius: "10px",

                  bgcolor: "rgba(200,255,0,0.1)",

                  border: "1px solid rgba(200,255,0,0.2)",

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  color: LIME,

                  "& svg": {
                    fontSize: 20,
                  },
                }}
              >
                <CategoryIcon cat={cat} />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: "#fff",
                  }}
                >
                  {cat}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.4)",
                    mt: 0.2,
                  }}
                >
                  {list.length} {list.length === 1 ? "question" : "questions"}
                </Typography>
              </Box>
            </Box>

            {/* ACCORDION */}

            <AnimatePresence mode="wait">
              <Box
                key={cat}
                component={motion.div}
                variants={{
                  hidden: {},

                  show: {
                    transition: {
                      staggerChildren: 0.07,
                    },
                  },
                }}
                initial="hidden"
                animate="show"
                exit={{
                  opacity: 0,
                }}
                sx={{
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {list.map((faq, index) => {
                  const key = `${faq.cat}-${index}`;

                  return (
                    <FaqRow
                      key={key}
                      faq={faq}
                      index={index}
                      open={openKey === key}
                      onToggle={() => setOpenKey(openKey === key ? null : key)}
                    />
                  );
                })}
              </Box>
            </AnimatePresence>
          </Box>
        </Box>
      </Box>
    </>
  );
}
