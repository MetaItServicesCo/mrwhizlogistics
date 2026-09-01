"use client";

import { motion } from "motion/react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import Link from "next/link";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PhoneInTalkRoundedIcon from "@mui/icons-material/PhoneInTalkRounded";

import type { HotShotService } from "@/types/hotShot";

import { HOT_SHOT_SERVICES } from "@/data/hotShotServices";

import HotShotDetailHero from "@/components/hot-shot/HotShotDetailHero";
import HotShotWhyChoose from "@/components/hot-shot/HotShotWhyChoose";
import HotShotTransportOptions from "@/components/hot-shot/HotShotTransportOptions";
import HotShotQuote from "@/components/hot-shot/HotShotQuote";
import HotShotHowItWorks from "./HotShotHowItWorks";

const LIME = "#c8ff00";

const EASE = [0.22, 1, 0.36, 1] as const;

function Sidebar({ service }: { service: HotShotService }) {
  return (
    <Box
      sx={{
        position: "sticky",
        top: 110,
      }}
    >
      {/* SERVICE MENU */}

      <Typography
        sx={{
          color: "#fff",
          fontSize: 16,
          fontWeight: 900,
          mb: 1.5,
        }}
      >
        Hot Shot Services
      </Typography>

      <Box
        sx={{
          mb: 4,
          borderTop: "1px solid rgba(255,255,255,.08)",
        }}
      >
        {HOT_SHOT_SERVICES.map((item) => (
          <Box
            key={item.slug}
            component={Link}
            href={`/hot-shot/${item.slug}`}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              minHeight: 48,
              px: 1.5,
              borderBottom: "1px solid rgba(255,255,255,.07)",
              textDecoration: "none",

              color:
                item.slug === service.slug ? LIME : "rgba(255,255,255,.48)",

              bgcolor:
                item.slug === service.slug
                  ? "rgba(200,255,0,.06)"
                  : "transparent",

              transition: "all .25s ease",

              "&:hover": {
                color: LIME,
                bgcolor: "rgba(200,255,0,.05)",
              },
            }}
          >
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: 0.3,
              }}
            >
              {item.title}
            </Typography>

            <ArrowForwardRoundedIcon
              sx={{
                fontSize: 15,
              }}
            />
          </Box>
        ))}
      </Box>

      {/* QUOTE */}

      {/* <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          bgcolor: "#111",
          border: "1px solid rgba(255,255,255,.08)",
          p: 3,
          mb: 3,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 180,
            height: 180,
            right: -90,
            top: -90,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(200,255,0,.13), transparent 70%)",
          }}
        />

        <Box
          sx={{
            position: "relative",
            width: 40,
            height: 40,
            bgcolor: LIME,
            color: "#080808",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <ArrowForwardRoundedIcon
            sx={{
              fontSize: 20,
            }}
          />
        </Box>

        <Typography
          sx={{
            position: "relative",
            color: "#fff",
            fontSize: 15,
            fontWeight: 900,
            mb: 1,
          }}
        >
          Get a hot shot quote
        </Typography>

        <Typography
          sx={{
            position: "relative",
            color: "rgba(255,255,255,.45)",
            fontSize: 10.5,
            lineHeight: 1.7,
            mb: 2.5,
          }}
        >
          Tell us what needs to move and where it needs to go. Our dispatch team
          will help build the right solution.
        </Typography>

        <Box
          component={Link}
          href="#contact"
          sx={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            color: LIME,
            textDecoration: "none",
            fontSize: 10,
            fontWeight: 900,
          }}
        >
          Request quote
          <ArrowForwardRoundedIcon
            sx={{
              fontSize: 15,
            }}
          />
        </Box>
      </Box> */}

      {/* HELP */}

      {/* HELP */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-60px" }}
        transition={{ duration: 0.2, ease: EASE }}
        sx={{
          position: "relative",
          borderRadius: "16px",
          p: "1px",
          background: `linear-gradient(150deg, rgba(200,255,0,.4), rgba(255,255,255,.05) 45%)`,
          transition: "transform .35s ease",
          "&:hover": { transform: "translateY(-4px)" },
          "&:hover .help-icon": { transform: "scale(1.08)" },
          "&:hover .help-ring": { opacity: 1, transform: "scale(1.6)" },
          "&:hover .help-arrow": { transform: "translateX(4px)" },
        }}
      >
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "15px",
            bgcolor: "#101010",
            p: 3,
          }}
        >
          {/* corner glow */}
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              width: 170,
              height: 170,
              right: -85,
              bottom: -85,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(200,255,0,.14), transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* icon with pulse ring */}
          <Box sx={{ position: "relative", width: 46, height: 46, mb: 2 }}>
            <Box
              className="help-ring"
              aria-hidden
              sx={{
                position: "absolute",
                inset: 0,
                borderRadius: "12px",
                border: `1px solid ${LIME}`,
                opacity: 0,
                transform: "scale(1)",
                transition: "opacity .4s ease, transform .5s ease",
                pointerEvents: "none",
              }}
            />
            <Box
              className="help-icon"
              sx={{
                width: "100%",
                height: "100%",
                borderRadius: "12px",
                bgcolor: LIME,
                color: "#080808",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 20px rgba(200,255,0,.28)",
                transition: "transform .35s ease",
                "& svg": { fontSize: 22 },
              }}
            >
              <PhoneInTalkRoundedIcon />
            </Box>
          </Box>

          {/* online status */}
          <Box
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 0.8,
              mb: 1,
            }}
          >
            <Box
              component={motion.span}
              animate={{ opacity: [1, 0.35, 1], scale: [1, 0.8, 1] }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: LIME,
                boxShadow: `0 0 10px ${LIME}`,
              }}
            />
            <Typography
              sx={{
                color: "rgba(255,255,255,.5)",
                fontSize: 9.5,
                fontWeight: 800,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              Available 24/7
            </Typography>
          </Box>

          <Typography
            sx={{
              position: "relative",
              color: "#fff",
              fontWeight: 900,
              fontSize: 18,
              mb: 1,
            }}
          >
            Need help?
          </Typography>

          <Typography
            sx={{
              position: "relative",
              color: "rgba(255,255,255,.45)",
              fontSize: 14,
              lineHeight: 1.7,
              mb: 2,
            }}
          >
            Talk with our transportation team about your shipment.
          </Typography>

          {/* phone */}
          <Box
            component="a"
            href="tel:+1 (469) 767 8853"
            sx={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              color: LIME,
              textDecoration: "none",
              fontSize: 18,
              fontWeight: 900,
              transition: "color .25s ease",
              "&:hover": { color: "#d4ff33" },
            }}
          >
            <PhoneInTalkRoundedIcon sx={{ fontSize: 17 }} />
            +1 (469) 767 8853
            <ArrowForwardRoundedIcon
              className="help-arrow"
              sx={{ fontSize: 16, transition: "transform .3s ease" }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function HotShotServiceDetail({
  service,
}: {
  service: HotShotService;
}) {
  return (
    <Box
      component="main"
      sx={{
        bgcolor: "#080808",
        color: "#fff",
        minHeight: "100vh",
      }}
    >
      {/* HERO */}

      <HotShotDetailHero service={service} />

      {/* MAIN CONTENT */}

      <Box
        sx={{
          maxWidth: 1380,
          mx: "auto",
          px: {
            xs: 2.5,
            sm: 4,
            md: 6,
            lg: 8,
          },
          py: {
            xs: 8,
            md: 12,
          },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(0,1fr) 310px",
            },
            gap: {
              xs: 7,
              lg: 9,
            },
            alignItems: "start",
          }}
        >
          {/* LEFT */}

          <Box sx={{ overflow: "hidden" }}>
            {/* SERVICE OVERVIEW */}

            <motion.div
              initial={{
                opacity: 0,
                y: 40,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: false,
                margin: "-100px",
              }}
              transition={{
                duration: 0.7,
                ease: EASE,
              }}
            >
              <Typography
                sx={{
                  color: LIME,
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: 2.5,
                  mb: 2,
                }}
              >
                SERVICE OVERVIEW
              </Typography>

              <Typography
                component="h2"
                sx={{
                  color: "#fff",
                  fontWeight: 900,
                  fontSize: {
                    xs: "2rem",
                    md: "3.2rem",
                  },
                  lineHeight: 1.05,
                  letterSpacing: "-1.5px",
                  maxWidth: 850,
                  mb: 4,
                }}
              >
                Transportation built around your{" "}
                <Box
                  component="span"
                  sx={{
                    color: LIME,
                  }}
                >
                  delivery requirements.
                </Box>
              </Typography>
            </motion.div>

            {/* LARGE IMAGE */}

            <motion.div
              initial={{
                opacity: 0,
                y: 60,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: false,
                margin: "-100px",
              }}
              transition={{
                duration: 0.8,
                ease: EASE,
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  height: {
                    xs: 280,
                    sm: 380,
                    md: 500,
                  },
                  overflow: "hidden",
                  borderRadius: "18px",
                  mb: 4,
                }}
              >
                <Box
                  component="img"
                  src={service.image}
                  alt={service.title}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />

                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, transparent 45%, rgba(0,0,0,.85) 100%)",
                  }}
                />

                <Box
                  sx={{
                    position: "absolute",
                    left: 20,
                    bottom: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 1,
                    bgcolor: "rgba(0,0,0,.72)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,.1)",
                  }}
                >
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      bgcolor: LIME,
                      boxShadow: `0 0 12px ${LIME}`,
                    }}
                  />

                  <Typography
                    sx={{
                      color: "#fff",
                      fontSize: 9,
                      fontWeight: 900,
                      letterSpacing: 1,
                    }}
                  >
                    {service.badge}
                  </Typography>
                </Box>
              </Box>
            </motion.div>

            {/* DESCRIPTION */}

            <Box
              sx={{
                maxWidth: 900,
              }}
            >
              {service.description.map((paragraph, index) => (
                <motion.div
                  key={paragraph}
                  initial={{
                    opacity: 0,
                    y: 35,
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
                    duration: 0.65,
                    delay: index * 0.05,
                    ease: EASE,
                  }}
                >
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,.5)",
                      fontSize: {
                        xs: 14,
                        md: 15,
                      },
                      lineHeight: 1.9,
                      mb: 2.5,
                    }}
                  >
                    {paragraph}
                  </Typography>
                </motion.div>
              ))}
            </Box>

            {/* STATS */}

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
                duration: 0.7,
                ease: EASE,
              }}
            >
              <Box
                sx={{
                  mt: 6,
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(3,1fr)",
                  },
                  borderTop: "1px solid rgba(255,255,255,.1)",
                  borderBottom: "1px solid rgba(255,255,255,.1)",
                }}
              >
                {service.stats.map((stat) => (
                  <Box
                    key={stat.label}
                    sx={{
                      py: 3,
                      px: {
                        xs: 0,
                        sm: 2,
                      },
                      borderRight: {
                        xs: "none",
                        sm: "1px solid rgba(255,255,255,.08)",
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        color: LIME,
                        fontSize: {
                          xs: 25,
                          md: 31,
                        },
                        fontWeight: 900,
                        mb: 0.5,
                      }}
                    >
                      {stat.value}
                    </Typography>

                    <Typography
                      sx={{
                        color: "rgba(255,255,255,.35)",
                        fontSize: 9,
                        fontWeight: 900,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </motion.div>

            {/* WHY CHOOSE */}

            <HotShotWhyChoose service={service} />

            {/* TRANSPORT OPTIONS */}

            <HotShotTransportOptions service={service} />
            <HotShotHowItWorks />

            {/* QUOTE */}

            <HotShotQuote service={service} />
          </Box>

          {/* SIDEBAR */}
          <Box
            sx={{
              display: {
                xs: "none",
                lg: "block",
              },
              alignSelf: "stretch", // 👈 cell ko poori row height tak stretch karta hai → sticky ko jagah milti hai
            }}
          >
            <Sidebar service={service} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
