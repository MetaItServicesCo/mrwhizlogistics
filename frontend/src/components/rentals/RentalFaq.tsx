"use client";

import { RENTAL_DEFAULTS, type RentalPageContent } from "@/lib/rentalContent";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";

const LIME = "#c8ff00";
const EASE = [0.22, 1, 0.36, 1] as const;


export default function RentalFaq({ content = RENTAL_DEFAULTS.page.sections.RentalFaq }: { content?: RentalPageContent["sections"]["RentalFaq"] }) {
  const { copy } = content;
  const reduce = useReducedMotion() ?? false;

  const [active, setActive] = useState<number | null>(0);

  const toggle = (index: number) => {
    setActive((current) => (current === index ? null : index));
  };

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        overflow: "hidden",
        bgcolor: "#080a08",
        color: "#fff",
        py: { xs: 8, sm: 10, md: 13 },
      }}
    >
      {/* Background glow */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: "15%",
          left: "-180px",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(200,255,0,0.07), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Box
        aria-hidden
        sx={{
          position: "absolute",
          bottom: "-180px",
          right: "-120px",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(200,255,0,0.06), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 1180,
          mx: "auto",
          px: { xs: 2.5, sm: 4, md: 6 },
        }}
      >
        {/* Heading */}
        <Box
          component={motion.div}
          initial={reduce ? {} : { opacity: 0, y: 25 }}
          whileInView={reduce ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.65, ease: EASE }}
          sx={{
            textAlign: "center",
            maxWidth: 760,
            mx: "auto",
            mb: { xs: 5, md: 7 },
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.8,
              px: 1.5,
              py: 0.65,
              mb: 2,
              borderRadius: "999px",
              bgcolor: "rgba(200,255,0,0.08)",
              border: `1px solid ${LIME}33`,
            }}
          >
            <HelpOutlineRoundedIcon
              sx={{
                color: LIME,
                fontSize: 17,
              }}
            />

            <Typography
              sx={{
                color: LIME,
                fontSize: 10.5,
                fontWeight: 900,
                letterSpacing: 1.7,
              }}
            >{copy.rentalFaq}</Typography>
          </Box>

          <Typography
            component="h2"
            sx={{
              fontWeight: 900,
              letterSpacing: "-1.5px",
              lineHeight: 1.05,
              fontSize: {
                xs: "2.2rem",
                sm: "3rem",
                md: "4rem",
              },
            }}
          >{copy.questions}<Box
              component="span"
              sx={{
                color: LIME,
                display: "block",
              }}
            >{copy.weveGotAnswers}</Box>
          </Typography>

          <Typography
            sx={{
              mt: 2,
              color: "rgba(255,255,255,0.52)",
              fontSize: { xs: 14, md: 16 },
              lineHeight: 1.7,
            }}
          >{copy.everythingYouNeedToKnow}</Typography>
        </Box>

        {/* FAQ */}
        <Box
          sx={{
            maxWidth: 900,
            mx: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 1.2,
          }}
        >
          {content.items.map((faq, index) => {
            const isOpen = active === index;

            return (
              <Box
                key={faq.question}
                component={motion.div}
                initial={reduce ? {} : { opacity: 0, y: 18 }}
                whileInView={reduce ? {} : { opacity: 1, y: 0 }}
                viewport={{
                  once: false,
                  amount: 0.08,
                }}
                transition={{
                  duration: 0.45,
                  ease: EASE,
                  delay: Math.min(index * 0.04, 0.25),
                }}
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: "16px",
                  border: isOpen
                    ? `1px solid ${LIME}55`
                    : "1px solid rgba(255,255,255,0.09)",
                  bgcolor: isOpen
                    ? "rgba(200,255,0,0.045)"
                    : "rgba(255,255,255,0.025)",
                  transition: "border-color 0.25s, background 0.25s",
                }}
              >
                {/* Lime active line */}
                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 3,
                    bgcolor: isOpen ? LIME : "transparent",
                    transition: "background 0.25s",
                  }}
                />

                <Box
                  component="button"
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  sx={{
                    width: "100%",
                    border: 0,
                    bgcolor: "transparent",
                    color: "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    px: { xs: 2, md: 2.5 },
                    py: { xs: 1.9, md: 2.25 },
                  }}
                >
                  {/* Number */}
                  <Typography
                    component="span"
                    sx={{
                      display: "block",
                      width: 30,
                      flexShrink: 0,
                      color: isOpen ? LIME : "rgba(255,255,255,0.3)",
                      fontSize: 12,
                      fontWeight: 900,
                      letterSpacing: 0.5,
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </Typography>

                  <Typography
                    component="span"
                    sx={{
                      display: "block",
                      flex: 1,
                      fontSize: { xs: 14, md: 15.5 },
                      fontWeight: 750,
                      lineHeight: 1.45,
                      color: isOpen ? "#fff" : "rgba(255,255,255,0.82)",
                    }}
                  >
                    {faq.question}
                  </Typography>

                  {/* Decorative: the whole row is the button. A nested
                      <IconButton> here was a <button> inside a <button>, which
                      the browser "repairs" while parsing - breaking hydration. */}
                  <Box
                    component="span"
                    aria-hidden="true"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background-color .2s, color .2s",
                      width: 34,
                      height: 34,
                      flexShrink: 0,
                      borderRadius: "10px",
                      color: isOpen ? "#0a0a0a" : LIME,
                      bgcolor: isOpen ? LIME : "rgba(200,255,0,0.08)",
                      "&:hover": {
                        bgcolor: LIME,
                        color: "#0a0a0a",
                      },
                    }}
                  >
                    {isOpen ? (
                      <RemoveRoundedIcon sx={{ fontSize: 18 }} />
                    ) : (
                      <AddRoundedIcon sx={{ fontSize: 18 }} />
                    )}
                  </Box>
                </Box>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <Box
                      component={motion.div}
                      initial={
                        reduce ? { opacity: 0 } : { height: 0, opacity: 0 }
                      }
                      animate={
                        reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }
                      }
                      exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: EASE,
                      }}
                      sx={{
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          pl: { xs: 7, md: 9 },
                          pr: { xs: 6, md: 8 },
                          pb: { xs: 2.2, md: 2.7 },
                        }}
                      >
                        <Typography
                          sx={{
                            color: "rgba(255,255,255,0.55)",
                            fontSize: { xs: 13, md: 14 },
                            lineHeight: 1.75,
                          }}
                        >
                          {faq.answer}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </AnimatePresence>
              </Box>
            );
          })}
        </Box>

        {/* Bottom reassurance */}
        <Box
          component={motion.div}
          initial={reduce ? {} : { opacity: 0, y: 15 }}
          whileInView={reduce ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.5, ease: EASE }}
          sx={{
            mt: 4,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
          }}
        >
          <LocalShippingRoundedIcon
            sx={{
              color: LIME,
              fontSize: 17,
            }}
          />

          <Typography
            sx={{
              color: "rgba(255,255,255,0.38)",
              fontSize: 12,
            }}
          >{copy.stillHaveQuestionsOurRental}</Typography>
        </Box>
      </Box>
    </Box>
  );
}
