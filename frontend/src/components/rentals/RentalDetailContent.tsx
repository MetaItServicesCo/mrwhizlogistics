"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

import { motion, AnimatePresence, useReducedMotion } from "motion/react";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import PhoneInTalkRoundedIcon from "@mui/icons-material/PhoneInTalkRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import StraightenRoundedIcon from "@mui/icons-material/StraightenRounded";
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

import type { RentalItem } from "@/data/hotShotRentals";

const LIME = "#c8ff00";
const BG = "#070807";
const PANEL = "#0d0f0d";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function RentalDetailContent({
  item,
  relatedItems,
}: {
  item: RentalItem;
  relatedItems: RentalItem[];
}) {
  const reduceMotion = useReducedMotion() ?? false;

  const [activeImage, setActiveImage] = useState(0);

  const images =
    item.images?.length > 0
      ? item.images
      : [item.image || "/images/hot-shot-hero.jpg"];

  const nextImage = () => {
    setActiveImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const availability = item.availability || "On Request";

  const availabilityColor =
    availability === "Available"
      ? LIME
      : availability === "Limited"
        ? "#ffd54a"
        : "#ffffff";

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        bgcolor: BG,
        color: "#fff",
        py: {
          xs: 6,
          sm: 8,
          md: 10,
          lg: 12,
        },
      }}
    >
      {/* =========================================================
          BACKGROUND
      ========================================================= */}

      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: -280,
          right: -280,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(200,255,0,0.035), transparent 68%)",
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
      />

      <Box
        aria-hidden
        sx={{
          position: "absolute",
          bottom: -300,
          left: -300,
          width: 720,
          height: 720,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.02), transparent 68%)",
          pointerEvents: "none",
        }}
      />

      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.13,
          pointerEvents: "none",
          backgroundImage: `
            linear-gradient(
              rgba(255,255,255,0.018) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,0.018) 1px,
              transparent 1px
            )
          `,
          backgroundSize: "72px 72px",
          maskImage:
            "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
        }}
      />

      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* =========================================================
            TOP INFORMATION RAIL
        ========================================================= */}

        <Box
          component={motion.div}
          initial={reduceMotion ? {} : { opacity: 0, y: 18 }}
          animate={reduceMotion ? {} : { opacity: 1, y: 0 }}
          transition={{
            duration: 0.65,
            ease: EASE,
          }}
          sx={{
            mb: {
              xs: 3,
              md: 4,
            },
            display: "flex",
            flexDirection: {
              xs: "column",
              lg: "row",
            },
            alignItems: {
              xs: "stretch",
              lg: "center",
            },
            justifyContent: "space-between",
            gap: 2,
            px: {
              xs: 2,
              sm: 2.5,
              md: 3,
            },
            py: {
              xs: 2,
              md: 1.8,
            },
            borderRadius: "18px",
            bgcolor: "rgba(255,255,255,0.022)",
            border: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(14px)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: {
                xs: 1.8,
                md: 3,
              },
            }}
          >
            <InfoRailItem
              icon={<LocalOfferRoundedIcon />}
              label="Rental Rate"
              value={item.priceHint || "Custom Pricing"}
              accent
            />

            <RailDivider />

            <InfoRailItem
              icon={<CalendarMonthRoundedIcon />}
              label="Rental Terms"
              value="Daily · Weekly · Monthly"
            />

            <RailDivider />

            <InfoRailItem
              icon={<LocationOnRoundedIcon />}
              label="Service Area"
              value={item.location || "Wylie, TX & Surrounding Areas"}
            />
          </Box>

          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: availabilityColor,
                boxShadow: `0 0 12px ${availabilityColor}`,
              }}
            />

            <Typography
              sx={{
                fontSize: {
                  xs: 10,
                  md: 11,
                },
                fontWeight: 850,
                letterSpacing: 1.2,
                color: availabilityColor,
                textTransform: "uppercase",
              }}
            >
              {availability}
            </Typography>
          </Box>
        </Box>

        {/* =========================================================
            MAIN LAYOUT
        ========================================================= */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(0, 1.38fr) minmax(390px, 0.62fr)",
            },
            gap: {
              xs: 4,
              lg: 3.5,
              xl: 5,
            },
            alignItems: "start",
          }}
        >
          {/* =======================================================
              LEFT SIDE
          ======================================================= */}

          <Box
            component={motion.div}
            initial={reduceMotion ? {} : { opacity: 0, x: -25 }}
            animate={reduceMotion ? {} : { opacity: 1, x: 0 }}
            transition={{
              duration: 0.8,
              ease: EASE,
            }}
          >
            {/* =====================================================
                MAIN GALLERY
            ===================================================== */}

            <Box
              sx={{
                position: "relative",
                height: {
                  xs: 330,
                  sm: 470,
                  md: 560,
                  lg: 620,
                },
                borderRadius: {
                  xs: "22px",
                  md: "28px",
                },
                overflow: "hidden",
                bgcolor: "#101210",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 35px 100px rgba(0,0,0,0.38)",
              }}
            >
              <AnimatePresence mode="wait">
                <Box
                  key={activeImage}
                  component={motion.img}
                  initial={
                    reduceMotion
                      ? {}
                      : {
                          opacity: 0,
                          scale: 1.035,
                        }
                  }
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.985,
                  }}
                  transition={{
                    duration: 0.55,
                    ease: EASE,
                  }}
                  src={images[activeImage]}
                  alt={`${item.title} rental image ${activeImage + 1}`}
                  sx={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </AnimatePresence>

              {/* Image overlay */}

              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  background: `
                    linear-gradient(
                      180deg,
                      rgba(0,0,0,0.06) 20%,
                      rgba(0,0,0,0.03) 50%,
                      rgba(0,0,0,0.76) 100%
                    )
                  `,
                }}
              />

              {/* Top badges */}

              <Box
                sx={{
                  position: "absolute",
                  top: {
                    xs: 15,
                    md: 22,
                  },
                  left: {
                    xs: 15,
                    md: 22,
                  },
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                <GlassBadge>
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 900,
                      letterSpacing: 1.4,
                      textTransform: "uppercase",
                    }}
                  >
                    {item.category || "Rental Equipment"}
                  </Typography>
                </GlassBadge>

                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.7,
                    px: 1.4,
                    py: 0.75,
                    borderRadius: "999px",
                    bgcolor: "rgba(200,255,0,0.9)",
                    color: "#070807",
                  }}
                >
                  <CheckRoundedIcon sx={{ fontSize: 14 }} />

                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: 950,
                      letterSpacing: 1.2,
                      textTransform: "uppercase",
                    }}
                  >
                    Ready to Rent
                  </Typography>
                </Box>
              </Box>

              {/* Image count */}

              <GlassBadge
                sx={{
                  position: "absolute",
                  top: {
                    xs: 15,
                    md: 22,
                  },
                  right: {
                    xs: 15,
                    md: 22,
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 850,
                    letterSpacing: 0.8,
                  }}
                >
                  {String(activeImage + 1).padStart(2, "0")} /{" "}
                  {String(images.length).padStart(2, "0")}
                </Typography>
              </GlassBadge>

              {/* Product title */}

              <Box
                sx={{
                  position: "absolute",
                  left: {
                    xs: 18,
                    md: 28,
                  },
                  bottom: {
                    xs: 20,
                    md: 28,
                  },
                  pr: {
                    xs: 15,
                    sm: 150,
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 900,
                    color: LIME,
                    textTransform: "uppercase",
                    letterSpacing: 2,
                    mb: 0.9,
                  }}
                >
                  Commercial Rental Equipment
                </Typography>

                <Typography
                  component="h1"
                  sx={{
                    fontSize: {
                      xs: "1.8rem",
                      sm: "2.35rem",
                      md: "2.85rem",
                    },
                    fontWeight: 950,
                    lineHeight: 1,
                    letterSpacing: "-1.5px",
                    textShadow: "0 5px 25px rgba(0,0,0,0.6)",
                  }}
                >
                  {item.title}
                </Typography>
              </Box>

              {/* Gallery controls */}

              {images.length > 1 && (
                <Box
                  sx={{
                    position: "absolute",
                    right: {
                      xs: 15,
                      md: 22,
                    },
                    bottom: {
                      xs: 15,
                      md: 22,
                    },
                    display: "flex",
                    gap: 1,
                  }}
                >
                  <GalleryButton
                    ariaLabel="Previous rental image"
                    onClick={prevImage}
                  >
                    <ArrowBackIosNewRoundedIcon />
                  </GalleryButton>

                  <GalleryButton
                    ariaLabel="Next rental image"
                    onClick={nextImage}
                  >
                    <ArrowForwardIosRoundedIcon />
                  </GalleryButton>
                </Box>
              )}
            </Box>

            {/* =====================================================
                THUMBNAILS
            ===================================================== */}

            {images.length > 1 && (
              <Box
                sx={{
                  display: "flex",
                  gap: 1.2,
                  mt: 1.5,
                  overflowX: "auto",
                  pb: 0.5,

                  "&::-webkit-scrollbar": {
                    height: 4,
                  },

                  "&::-webkit-scrollbar-thumb": {
                    bgcolor: "rgba(255,255,255,0.15)",
                    borderRadius: 20,
                  },
                }}
              >
                {images.map((img, index) => {
                  const active = activeImage === index;

                  return (
                    <Box
                      key={`${img}-${index}`}
                      onClick={() => setActiveImage(index)}
                      sx={{
                        position: "relative",
                        flex: "0 0 auto",
                        width: {
                          xs: 92,
                          sm: 112,
                        },
                        height: {
                          xs: 66,
                          sm: 78,
                        },
                        p: "3px",
                        cursor: "pointer",
                        borderRadius: "13px",
                        border: active
                          ? `1px solid ${LIME}`
                          : "1px solid rgba(255,255,255,0.08)",
                        bgcolor: active
                          ? "rgba(200,255,0,0.05)"
                          : "rgba(255,255,255,0.02)",
                        transition: "all .3s ease",

                        "&:hover": {
                          borderColor: "rgba(200,255,0,0.4)",
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src={img}
                        alt={`${item.title} thumbnail ${index + 1}`}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "9px",
                          opacity: active ? 1 : 0.55,
                          transition: "all .3s ease",
                        }}
                      />

                      {active && (
                        <Box
                          sx={{
                            position: "absolute",
                            left: "18%",
                            right: "18%",
                            bottom: -1,
                            height: 2,
                            borderRadius: 10,
                            bgcolor: LIME,
                            boxShadow: `0 0 12px ${LIME}`,
                          }}
                        />
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* =====================================================
                TECHNICAL SPECIFICATIONS
            ===================================================== */}

            <Box
              sx={{
                mt: {
                  xs: 6,
                  md: 8,
                },
              }}
            >
              <SectionHeading
                eyebrow="Technical Information"
                title="Equipment Specifications"
                description="Everything you need to know about the equipment before booking your rental."
              />

              <Box
                sx={{
                  mt: 3.5,
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                  },
                  gap: {
                    xs: 1.3,
                    sm: 1.5,
                  },
                }}
              >
                <SpecTile
                  icon={<StraightenRoundedIcon />}
                  label="Size / Dimensions"
                  value={item.size || "Not specified"}
                />

                <SpecTile
                  icon={<FitnessCenterRoundedIcon />}
                  label="Capacity"
                  value={item.capacity || "Not specified"}
                />

                <SpecTile
                  icon={<LinkRoundedIcon />}
                  label="Hitch"
                  value={item.hitch || "Not specified"}
                />

                <SpecTile
                  icon={<LocationOnRoundedIcon />}
                  label="Location"
                  value={item.location || "Wylie, TX & Surrounding Areas"}
                />

                <SpecTile
                  icon={<BuildRoundedIcon />}
                  label="Equipment Included"
                  value={item.equipment || "Not specified"}
                />

                <SpecTile
                  icon={<CreditCardRoundedIcon />}
                  label="Deposit"
                  value={item.deposit || "Not specified"}
                />

                <SpecTile
                  icon={<VerifiedUserRoundedIcon />}
                  label="Requirements"
                  value={item.requirements || "Not specified"}
                />

                <SpecTile
                  icon={<BadgeRoundedIcon />}
                  label="Minimum Age"
                  value={item.minAge || "Not specified"}
                />
              </Box>
            </Box>

            {/* =====================================================
                RENTAL HIGHLIGHTS
            ===================================================== */}

            <Box
              sx={{
                mt: 2,
                p: {
                  xs: 2.5,
                  sm: 3,
                  md: 3.2,
                },
                borderRadius: "20px",
                bgcolor: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.065)",
              }}
            >
              <Typography
                sx={{
                  fontSize: 10.5,
                  fontWeight: 900,
                  color: LIME,
                  letterSpacing: 1.8,
                  textTransform: "uppercase",
                  mb: 2,
                }}
              >
                Rental Highlights
              </Typography>

              {item.specs && item.specs.length > 0 ? (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "1fr 1fr",
                    },
                    gap: 1.3,
                  }}
                >
                  {item.specs.map((spec) => (
                    <HighlightItem key={spec} text={spec} />
                  ))}
                </Box>
              ) : (
                <Typography
                  sx={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  Professional commercial-grade rental equipment.
                </Typography>
              )}
            </Box>
          </Box>

          {/* =======================================================
              RIGHT SIDE / BOOKING CARD
          ======================================================= */}

          <Box
            component={motion.div}
            initial={reduceMotion ? {} : { opacity: 0, x: 25 }}
            animate={reduceMotion ? {} : { opacity: 1, x: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.08,
              ease: EASE,
            }}
            sx={{
              position: {
                xs: "relative",
                lg: "sticky",
              },
              top: {
                lg: 100,
              },
            }}
          >
            <Box
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: {
                  xs: "22px",
                  md: "26px",
                },
                bgcolor: PANEL,
                border: "1px solid rgba(255,255,255,0.075)",
                boxShadow: "0 30px 90px rgba(0,0,0,0.35)",
              }}
            >
              {/* Premium top rail */}

              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: `
                    linear-gradient(
                      90deg,
                      ${LIME},
                      rgba(200,255,0,0.25) 55%,
                      transparent
                    )
                  `,
                }}
              />

              <Box
                sx={{
                  p: {
                    xs: 3,
                    sm: 3.5,
                    lg: 4,
                  },
                }}
              >
                {/* Header */}

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    mb: 2.2,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10.5,
                      fontWeight: 900,
                      color: LIME,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                    }}
                  >
                    Equipment Rental
                  </Typography>

                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.7,
                    }}
                  >
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        bgcolor: availabilityColor,
                        boxShadow: `0 0 10px ${availabilityColor}`,
                      }}
                    />

                    <Typography
                      sx={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: availabilityColor,
                        textTransform: "uppercase",
                      }}
                    >
                      {availability}
                    </Typography>
                  </Box>
                </Box>

                {/* Title */}

                <Typography
                  sx={{
                    fontSize: {
                      xs: "2rem",
                      sm: "2.3rem",
                      lg: "2.55rem",
                    },
                    lineHeight: 1.02,
                    fontWeight: 950,
                    letterSpacing: "-1.5px",
                  }}
                >
                  {item.title}
                </Typography>

                {/* Description */}

                <Typography
                  sx={{
                    mt: 2,
                    fontSize: {
                      xs: 14,
                      md: 14.5,
                    },
                    lineHeight: 1.75,
                    color: "rgba(255,255,255,0.57)",
                  }}
                >
                  {item.desc}
                </Typography>

                {/* Pricing */}

                <Box
                  sx={{
                    mt: 3.2,
                    p: 2.2,
                    borderRadius: "16px",
                    bgcolor: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.38)",
                      fontWeight: 850,
                      letterSpacing: 1.3,
                      textTransform: "uppercase",
                    }}
                  >
                    Starting Rental Rate
                  </Typography>

                  <Box
                    sx={{
                      mt: 0.6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: {
                          xs: "1.7rem",
                          sm: "1.9rem",
                        },
                        lineHeight: 1,
                        fontWeight: 950,
                        color: LIME,
                        letterSpacing: "-0.8px",
                      }}
                    >
                      {item.priceHint || "Contact for Pricing"}
                    </Typography>

                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "13px",
                        color: LIME,
                        bgcolor: "rgba(200,255,0,0.065)",
                        border: "1px solid rgba(200,255,0,0.13)",
                      }}
                    >
                      <LocalOfferRoundedIcon />
                    </Box>
                  </Box>

                  {item.pricingIncludes && (
                    <Typography
                      sx={{
                        mt: 1.5,
                        pt: 1.4,
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        fontSize: 11.5,
                        lineHeight: 1.65,
                        color: "rgba(255,255,255,0.44)",
                      }}
                    >
                      {item.pricingIncludes}
                    </Typography>
                  )}
                </Box>

                {/* Quick information */}

                <Box
                  sx={{
                    mt: 2.2,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 1,
                  }}
                >
                  <QuickInfo
                    label="Category"
                    value={item.category || "Commercial"}
                  />

                  <QuickInfo label="Booking" value="Quote Required" />

                  <QuickInfo label="Pickup" value="Wylie, TX" />

                  <QuickInfo label="Terms" value="Flexible" />
                </Box>

                {/* Requirements */}

                <Box
                  sx={{
                    mt: 3,
                    pt: 3,
                    borderTop: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10.5,
                      fontWeight: 900,
                      color: "rgba(255,255,255,0.86)",
                      textTransform: "uppercase",
                      letterSpacing: 1.3,
                      mb: 1.8,
                    }}
                  >
                    Rental Requirements
                  </Typography>

                  <Requirement
                    text={
                      item.requirements ||
                      "Valid driver's license & current insurance"
                    }
                  />

                  <Requirement
                    text={`Minimum age: ${item.minAge || "21 years or older"}`}
                  />

                  <Requirement
                    text={item.deposit || "Credit card required for deposit"}
                  />
                </Box>

                {/* CTA */}

                <Box
                  sx={{
                    mt: 3.2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.2,
                  }}
                >
                  <Button
                    component={Link}
                    href={`/contact?rental=${item.slug}`}
                    endIcon={<ArrowForwardRoundedIcon />}
                    fullWidth
                    sx={{
                      minHeight: 55,
                      borderRadius: "14px",
                      bgcolor: LIME,
                      color: "#070807",
                      fontSize: 14.5,
                      fontWeight: 950,
                      textTransform: "none",
                      boxShadow: "0 15px 38px rgba(200,255,0,0.10)",
                      transition:
                        "transform .3s ease, background-color .3s ease, box-shadow .3s ease",

                      "& .MuiButton-endIcon": {
                        transition: "transform .3s ease",
                      },

                      "&:hover": {
                        bgcolor: "#d6ff35",
                        transform: "translateY(-2px)",
                        boxShadow: "0 20px 45px rgba(200,255,0,0.15)",

                        "& .MuiButton-endIcon": {
                          transform: "translateX(4px)",
                        },
                      },
                    }}
                  >
                    Request Rental Quote
                  </Button>

                  <Button
                    component="a"
                    href="tel:+14697678853"
                    startIcon={<PhoneInTalkRoundedIcon />}
                    fullWidth
                    sx={{
                      minHeight: 52,
                      borderRadius: "14px",
                      bgcolor: "rgba(255,255,255,0.025)",
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.11)",
                      fontSize: 14,
                      fontWeight: 800,
                      textTransform: "none",

                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.05)",
                        borderColor: "rgba(255,255,255,0.22)",
                      },
                    }}
                  >
                    Call +1 (469) 767-8853
                  </Button>
                </Box>

                {/* Trust */}

                <Box
                  sx={{
                    mt: 2.4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.8,
                  }}
                >
                  <ShieldRoundedIcon
                    sx={{
                      color: LIME,
                      fontSize: 15,
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: 10.5,
                      color: "rgba(255,255,255,0.34)",
                      textAlign: "center",
                    }}
                  >
                    Commercial-grade equipment · Flexible rental options
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* =========================================================
            RELATED RENTALS
        ========================================================= */}

        {relatedItems.length > 0 && (
          <Box
            sx={{
              mt: {
                xs: 10,
                md: 14,
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: {
                  xs: "column",
                  md: "row",
                },
                alignItems: {
                  xs: "flex-start",
                  md: "flex-end",
                },
                justifyContent: "space-between",
                gap: 2,
                mb: 4,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: 10.5,
                    fontWeight: 900,
                    color: LIME,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    mb: 0.9,
                  }}
                >
                  More Equipment
                </Typography>

                <Typography
                  sx={{
                    fontSize: {
                      xs: "2rem",
                      md: "2.75rem",
                    },
                    lineHeight: 1.05,
                    fontWeight: 950,
                    letterSpacing: "-1.4px",
                  }}
                >
                  Explore Other Rentals
                </Typography>
              </Box>

              <Typography
                sx={{
                  maxWidth: 450,
                  fontSize: 13.5,
                  lineHeight: 1.65,
                  color: "rgba(255,255,255,0.45)",
                }}
              >
                Choose the right equipment configuration for your hauling,
                construction, commercial, or transportation requirements.
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                },
                gap: 2,
              }}
            >
              {relatedItems.map((rel, index) => {
                const relatedImage =
                  rel.images?.[0] || rel.image || "/images/hot-shot-hero.jpg";

                return (
                  <Box
                    key={rel.slug}
                    component={motion.div}
                    initial={
                      reduceMotion
                        ? {}
                        : {
                            opacity: 0,
                            y: 24,
                          }
                    }
                    whileInView={{
                      opacity: 1,
                      y: 0,
                    }}
                    viewport={{
                      once: true,
                      amount: 0.2,
                    }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.07,
                      ease: EASE,
                    }}
                  >
                    <Box
                      component={Link}
                      href={`/rentals/${rel.slug}`}
                      sx={{
                        display: "block",
                        height: "100%",
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          height: 360,
                          overflow: "hidden",
                          borderRadius: "22px",
                          bgcolor: "#0d0f0d",
                          border: "1px solid rgba(255,255,255,0.07)",
                          transition:
                            "transform .35s ease, border-color .35s ease, box-shadow .35s ease",

                          "&:hover": {
                            transform: "translateY(-7px)",
                            borderColor: "rgba(200,255,0,0.24)",
                            boxShadow: "0 28px 65px rgba(0,0,0,0.35)",
                          },

                          "&:hover .related-img": {
                            transform: "scale(1.045)",
                          },

                          "&:hover .related-arrow": {
                            bgcolor: LIME,
                            color: "#080a08",
                            transform: "translate(3px,-3px)",
                          },
                        }}
                      >
                        <Box
                          className="related-img"
                          component="img"
                          src={relatedImage}
                          alt={rel.title}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform .6s ease",
                          }}
                        />

                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            background: `
                              linear-gradient(
                                180deg,
                                rgba(0,0,0,0.03) 25%,
                                rgba(0,0,0,0.92) 100%
                              )
                            `,
                          }}
                        />

                        <Box
                          sx={{
                            position: "absolute",
                            top: 16,
                            right: 16,
                          }}
                        >
                          <Box
                            className="related-arrow"
                            sx={{
                              width: 42,
                              height: 42,
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: "rgba(5,5,5,0.62)",
                              color: "#fff",
                              border: "1px solid rgba(255,255,255,0.15)",
                              backdropFilter: "blur(12px)",
                              transition: "all .3s ease",
                            }}
                          >
                            <OpenInNewRoundedIcon sx={{ fontSize: 18 }} />
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            position: "absolute",
                            left: 22,
                            right: 22,
                            bottom: 22,
                          }}
                        >
                          <Typography
                            sx={{
                              mb: 0.6,
                              fontSize: 10,
                              fontWeight: 900,
                              color: LIME,
                              letterSpacing: 1.7,
                              textTransform: "uppercase",
                            }}
                          >
                            {rel.category || "Rental Equipment"}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: {
                                xs: "1.4rem",
                                md: "1.55rem",
                              },
                              fontWeight: 900,
                              letterSpacing: "-0.6px",
                              lineHeight: 1.08,
                            }}
                          >
                            {rel.title}
                          </Typography>

                          <Typography
                            sx={{
                              mt: 1,
                              fontSize: 12.5,
                              color: "rgba(255,255,255,0.58)",
                              lineHeight: 1.55,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {rel.desc}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}

/* ===============================================================
   INFORMATION RAIL
================================================================ */

function InfoRailItem({
  icon,
  label,
  value,
  accent = false,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          color: accent ? LIME : "rgba(255,255,255,0.45)",

          "& svg": {
            fontSize: 19,
          },
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography
          sx={{
            fontSize: 9,
            color: "rgba(255,255,255,0.3)",
            textTransform: "uppercase",
            letterSpacing: 1,
            fontWeight: 850,
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            mt: 0.15,
            fontSize: 12,
            color: accent ? LIME : "rgba(255,255,255,0.8)",
            fontWeight: 750,
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

function RailDivider() {
  return (
    <Box
      sx={{
        display: {
          xs: "none",
          lg: "block",
        },
        width: 1,
        height: 30,
        bgcolor: "rgba(255,255,255,0.08)",
      }}
    />
  );
}

/* ===============================================================
   GLASS BADGE
================================================================ */

function GlassBadge({
  children,
  sx = {},
}: {
  children: ReactNode;
  sx?: Record<string, unknown>;
}) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        px: 1.4,
        py: 0.75,
        borderRadius: "999px",
        bgcolor: "rgba(5,7,5,0.72)",
        border: "1px solid rgba(255,255,255,0.13)",
        backdropFilter: "blur(12px)",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

/* ===============================================================
   GALLERY BUTTON
================================================================ */

function GalleryButton({
  children,
  onClick,
  ariaLabel,
}: {
  children: ReactNode;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <Button
      aria-label={ariaLabel}
      onClick={onClick}
      sx={{
        minWidth: 46,
        width: 46,
        height: 46,
        p: 0,
        borderRadius: "50%",
        bgcolor: "rgba(7,8,7,0.7)",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.15)",
        backdropFilter: "blur(14px)",
        transition: "all .3s ease",

        "& svg": {
          fontSize: 17,
        },

        "&:hover": {
          bgcolor: LIME,
          color: "#080a08",
          borderColor: LIME,
        },
      }}
    >
      {children}
    </Button>
  );
}

/* ===============================================================
   SECTION HEADING
================================================================ */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: 10.5,
          fontWeight: 900,
          color: LIME,
          letterSpacing: 2,
          textTransform: "uppercase",
          mb: 0.8,
        }}
      >
        {eyebrow}
      </Typography>

      <Typography
        sx={{
          fontSize: {
            xs: "1.8rem",
            md: "2.35rem",
          },
          fontWeight: 950,
          letterSpacing: "-1px",
          lineHeight: 1.05,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 1.4,
          maxWidth: 680,
          fontSize: 13.5,
          lineHeight: 1.7,
          color: "rgba(255,255,255,0.46)",
        }}
      >
        {description}
      </Typography>
    </Box>
  );
}

/* ===============================================================
   SPECIFICATION TILE
================================================================ */

function SpecTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "flex-start",
        gap: {
          xs: 1.5,
          md: 1.8,
        },
        p: {
          xs: 2.1,
          sm: 2.3,
          md: 2.5,
        },
        minHeight: {
          xs: 112,
          md: 122,
        },
        borderRadius: "17px",
        bgcolor: "rgba(255,255,255,0.022)",
        border: "1px solid rgba(255,255,255,0.065)",
        transition:
          "transform .3s ease, border-color .3s ease, background-color .3s ease",

        "&:hover": {
          transform: "translateY(-3px)",
          borderColor: "rgba(200,255,0,0.18)",
          bgcolor: "rgba(255,255,255,0.032)",
        },
      }}
    >
      {/* Icon */}

      <Box
        sx={{
          flex: "0 0 auto",
          width: {
            xs: 42,
            md: 45,
          },
          height: {
            xs: 42,
            md: 45,
          },
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: LIME,
          bgcolor: "rgba(200,255,0,0.065)",
          border: "1px solid rgba(200,255,0,0.12)",

          "& svg": {
            fontSize: {
              xs: 20,
              md: 21,
            },
          },
        }}
      >
        {icon}
      </Box>

      {/* Text */}

      <Box
        sx={{
          minWidth: 0,
          pt: 0.1,
        }}
      >
        {/* LABEL — increased */}

        <Typography
          sx={{
            fontSize: {
              xs: 11,
              md: 11.5,
            },
            color: "rgba(255,255,255,0.42)",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: {
              xs: 0.8,
              md: 1,
            },
            lineHeight: 1.25,
          }}
        >
          {label}
        </Typography>

        {/* VALUE — increased */}

        <Typography
          sx={{
            mt: {
              xs: 0.8,
              md: 0.9,
            },
            fontSize: {
              xs: 15,
              sm: 15.5,
              md: 16,
            },
            lineHeight: 1.55,
            color: "#f4f4f4",
            fontWeight: 700,
            letterSpacing: "-0.15px",
            overflowWrap: "anywhere",
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

/* ===============================================================
   HIGHLIGHT
================================================================ */

function HighlightItem({ text }: { text: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        p: 1.4,
        borderRadius: "13px",
        bgcolor: "rgba(255,255,255,0.018)",
        border: "1px solid rgba(255,255,255,0.055)",
      }}
    >
      <Box
        sx={{
          width: 22,
          height: 22,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          bgcolor: "rgba(200,255,0,0.08)",
          color: LIME,
        }}
      >
        <CheckRoundedIcon sx={{ fontSize: 14 }} />
      </Box>

      <Typography
        sx={{
          fontSize: {
            xs: 12.5,
            md: 13,
          },
          color: "rgba(255,255,255,0.7)",
          fontWeight: 650,
          lineHeight: 1.4,
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}

/* ===============================================================
   QUICK INFO
================================================================ */

function QuickInfo({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        px: 1.5,
        py: 1.35,
        borderRadius: "12px",
        bgcolor: "rgba(255,255,255,0.018)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Typography
        sx={{
          fontSize: 9.5,
          color: "rgba(255,255,255,0.3)",
          fontWeight: 850,
          textTransform: "uppercase",
          letterSpacing: 0.8,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.5,
          fontSize: 12,
          color: "rgba(255,255,255,0.8)",
          fontWeight: 750,
          lineHeight: 1.35,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

/* ===============================================================
   REQUIREMENT
================================================================ */

function Requirement({ text }: { text: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1,
        mb: 1.25,

        "&:last-child": {
          mb: 0,
        },
      }}
    >
      <Box
        sx={{
          width: 21,
          height: 21,
          flexShrink: 0,
          mt: 0.05,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          bgcolor: "rgba(200,255,0,0.07)",
          border: "1px solid rgba(200,255,0,0.14)",
          color: LIME,
        }}
      >
        <CheckRoundedIcon sx={{ fontSize: 13 }} />
      </Box>

      <Typography
        sx={{
          fontSize: 13,
          lineHeight: 1.55,
          color: "rgba(255,255,255,0.62)",
          fontWeight: 550,
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}
