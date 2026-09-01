"use client";

import { motion } from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";

import { HOT_SHOT_SERVICES } from "@/data/hotShotServices";

const LIME = "#c8ff00";
const EASE = [0.22, 1, 0.36, 1] as const;

function getIcon(icon: string) {
  switch (icon) {
    case "bolt":
      return <BoltRoundedIcon />;

    case "truck":
      return <LocalShippingRoundedIcon />;

    case "construction":
      return <ConstructionRoundedIcon />;

    case "inventory":
      return <Inventory2RoundedIcon />;

    case "store":
      return <StorefrontRoundedIcon />;

    default:
      return <BuildRoundedIcon />;
  }
}

function ServiceCard({
  service,
  index,
}: {
  service: (typeof HOT_SHOT_SERVICES)[number];
  index: number;
}) {
  return (
    <Box
      component={motion.div}
      initial={{
        opacity: 0,
        y: 80,
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
        delay: index * 0.08,
        ease: EASE,
      }}
      sx={{
        position: "relative",
      }}
    >
      <Box
        component={Link}
        href={`/hot-shot/${service.slug}`}
        sx={{
          display: "block",
          position: "relative",
          height: "100%",
          textDecoration: "none",
          color: "#fff",
          overflow: "hidden",
          borderRadius: "20px",
          bgcolor: "#101010",
          border: "1px solid rgba(255,255,255,.08)",
          transition: "all .45s ease",

          "&:hover": {
            transform: "translateY(-10px)",
            borderColor: "rgba(200,255,0,.45)",
            boxShadow: "0 30px 80px rgba(0,0,0,.55)",
          },

          "&:hover .service-image": {
            transform: "scale(1.08)",
          },

          "&:hover .service-arrow": {
            backgroundColor: LIME,
            color: "#080808",
            transform: "translateX(5px)",
          },
        }}
      >
        {/* IMAGE */}

        <Box
          sx={{
            position: "relative",
            height: {
              xs: 220,
              md: 250,
            },
            overflow: "hidden",
          }}
        >
          <Box
            className="service-image"
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${service.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transition: "transform .8s cubic-bezier(.2,.8,.2,1)",
            }}
          />

          {/* IMAGE OVERLAY */}

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,.05) 20%, rgba(8,8,8,.96) 100%)",
            }}
          />

          {/* NUMBER */}

          <Box
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              px: 1.2,
              py: 0.5,
              borderRadius: "8px",
              bgcolor: "rgba(0,0,0,.65)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,.1)",
            }}
          >
            <Typography
              sx={{
                color: LIME,
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              {service.number}
            </Typography>
          </Box>

          {/* ICON */}

          <Box
            sx={{
              position: "absolute",
              right: 18,
              bottom: -20,
              width: 52,
              height: 52,
              borderRadius: "14px",
              bgcolor: LIME,
              color: "#080808",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
              boxShadow: "0 15px 35px rgba(200,255,0,.25)",
              "& svg": {
                fontSize: 25,
              },
            }}
          >
            {getIcon(service.features[0]?.icon)}
          </Box>
        </Box>

        {/* CONTENT */}

        <Box
          sx={{
            p: {
              xs: 3,
              md: 3.5,
            },
            pt: 4,
          }}
        >
          <Typography
            sx={{
              color: LIME,
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: 2,
              textTransform: "uppercase",
              mb: 1.2,
            }}
          >
            {service.badge}
          </Typography>

          <Typography
            component="h3"
            sx={{
              fontSize: {
                xs: "1.35rem",
                md: "1.55rem",
              },
              fontWeight: 900,
              color: "#fff",
              mb: 1.2,
            }}
          >
            {service.title}
          </Typography>

          <Typography
            sx={{
              color: "rgba(255,255,255,.58)",
              fontSize: 14,
              lineHeight: 1.7,
              minHeight: {
                md: 72,
              },
            }}
          >
            {service.shortDescription}
          </Typography>

          {/* POINTS */}

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1.1,
              mt: 2.5,
            }}
          >
            {service.features.slice(0, 3).map((feature) => (
              <Box
                key={feature.title}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <CheckCircleRoundedIcon
                  sx={{
                    color: LIME,
                    fontSize: 17,
                  }}
                />

                <Typography
                  sx={{
                    color: "rgba(255,255,255,.78)",
                    fontSize: 12,
                  }}
                >
                  {feature.title}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* FOOTER */}

          <Box
            sx={{
              mt: 3,
              pt: 2,
              borderTop: "1px solid rgba(255,255,255,.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              sx={{
                color: "#fff",
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              View Service
            </Typography>

            <Box
              className="service-arrow"
              sx={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                border: "1px solid rgba(200,255,0,.45)",
                color: LIME,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all .3s ease",
              }}
            >
              <ArrowForwardRoundedIcon
                sx={{
                  fontSize: 19,
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function HotShotServices() {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        bgcolor: "#080808",
        color: "#fff",
        px: {
          xs: 2.5,
          sm: 4,
          md: 6,
          lg: 8,
        },
        py: {
          xs: 8,
          md: 13,
        },
        overflow: "hidden",
      }}
    >
      {/* BACKGROUND GLOW */}

      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 700,
          height: 400,
          background:
            "radial-gradient(circle, rgba(200,255,0,.08), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* HEADER */}

      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          maxWidth: 800,
          mx: "auto",
          textAlign: "center",
          mb: {
            xs: 6,
            md: 8,
          },
        }}
      >
        <Typography
          sx={{
            color: LIME,
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: 3,
            mb: 2,
          }}
        >
          WHAT WE MOVE
        </Typography>

        <Typography
          component="h2"
          sx={{
            color: "#fff",
            fontWeight: 900,
            fontSize: {
              xs: "2.1rem",
              sm: "2.8rem",
              md: "3.8rem",
            },
            lineHeight: 1.05,
            letterSpacing: "-1.5px",
          }}
        >
          HotShot freight.
          <Box
            component="span"
            sx={{
              color: LIME,
            }}
          >
            {" "}
            Every kind of load.
          </Box>
        </Typography>

        <Typography
          sx={{
            mt: 2.5,
            color: "rgba(255,255,255,.55)",
            fontSize: 15,
            lineHeight: 1.7,
          }}
        >
          Whatever needs to be there today, we have a dedicated transportation
          solution built to move it fast.
        </Typography>
      </Box>

      {/* GRID */}

      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1250,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            lg: "repeat(3, 1fr)",
          },
          gap: {
            xs: 2.5,
            md: 3,
          },
        }}
      >
        {HOT_SHOT_SERVICES.map((service, index) => (
          <ServiceCard key={service.slug} service={service} index={index} />
        ))}
      </Box>
    </Box>
  );
}
