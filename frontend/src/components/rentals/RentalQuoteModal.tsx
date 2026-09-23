"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  FormControlLabel,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowBackRounded,
  ArrowForwardRounded,
  CheckCircleRounded,
  CloseRounded,
  LocalShippingRounded,
  SendRounded,
} from "@mui/icons-material";

import type { RentalItem } from "@/data/hotShotRentals";
import type {
  RentalQuoteFormData,
  RentalQuotePayload,
  RentalDuration,
  PreferredContactMethod,
} from "@/types/rentalQuote";
import {
  CONTACT_METHOD_OPTIONS,
  RENTAL_DURATION_OPTIONS,
} from "@/types/rentalQuote";
import { submitRentalQuote } from "@/lib/publicApi";
import { errorMessage } from "@/lib/useResource";

const LIME = "#c8ff00";
const BG_DARK = "#09090b";
const CARD_BG = "#121215";
const BORDER = "rgba(255, 255, 255, 0.08)";

type RentalQuoteModalProps = {
  open: boolean;
  onClose: () => void;
  rental?: RentalItem | null;
};

const initialForm: RentalQuoteFormData = {
  fullName: "",
  companyName: "",
  email: "",
  phone: "",
  preferredContactMethod: "phone",
  rentalSlug: "truck-trailer",
  rentalName: "",
  rentalDuration: "daily",
  startDate: "",
  endDate: "",
  pickupLocation: "",
  returnLocation: "",
  deliveryRequired: false,
  deliveryAddress: "",
  intendedUse: "",
  loadDescription: "",
  cargoType: "",
  estimatedWeight: "",
  estimatedMileage: "",
  specialRequirements: "",
  additionalNotes: "",
  agreeToContact: false,
};

const STEPS = ["Customer Info", "Timeline & Routing", "Review & Submit"];

const textFieldStyles = {
  "& .MuiInputBase-input": { color: "#ffffff !important" },
  "& .MuiInputLabel-root": { color: "#ffffff !important" },
  "& .MuiInputLabel-root.Mui-focused": { color: `${LIME} !important` },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.2)" },
    "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.4)" },
    "&.Mui-focused fieldset": { borderColor: LIME },
  },
  "& .MuiSelect-icon": { color: "#ffffff !important" },
  /* Fix for native HTML date picker calendar icon color in dark mode */
  "& input[type='date']::-webkit-calendar-picker-indicator": {
    filter: "invert(1) brightness(2)",
    cursor: "pointer",
  },
};

export default function RentalQuoteModal({
  open,
  onClose,
  rental,
}: RentalQuoteModalProps) {
  const [form, setForm] = useState<RentalQuoteFormData>(initialForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof RentalQuoteFormData, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!open) return;
    setSubmitted(false);
    setSubmitError(null);
    setErrors({});
    setActiveStep(0);
    setForm((previous) => ({
      ...initialForm,
      ...previous,
      rentalSlug: rental?.slug ?? previous.rentalSlug,
      rentalName: rental?.title ?? previous.rentalName,
    }));
  }, [open, rental]);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const updateField = <K extends keyof RentalQuoteFormData>(
    field: K,
    value: RentalQuoteFormData[K],
  ) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: "" }));
  };

  const validateStep = (step: number) => {
    const nextErrors: Partial<Record<keyof RentalQuoteFormData, string>> = {};

    if (step === 0) {
      if (!form.fullName.trim()) nextErrors.fullName = "Full name is required.";
      if (!form.email.trim()) {
        nextErrors.email = "Email is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        nextErrors.email = "Invalid email format.";
      }
      if (!form.phone.trim()) nextErrors.phone = "Phone number is required.";
    } else if (step === 1) {
      if (!form.startDate) nextErrors.startDate = "Start date is required.";
      if (form.rentalDuration === "custom" && !form.endDate) {
        nextErrors.endDate = "End date is required.";
      }
      if (!form.pickupLocation.trim())
        nextErrors.pickupLocation = "Pickup location required.";
      if (!form.returnLocation.trim())
        nextErrors.returnLocation = "Return location required.";
      if (form.deliveryRequired && !form.deliveryAddress.trim()) {
        nextErrors.deliveryAddress = "Delivery address required.";
      }
    } else if (step === 2) {
      if (!form.agreeToContact)
        nextErrors.agreeToContact = "You must agree to be contacted.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const buildPayload = (): RentalQuotePayload => ({
    customer: {
      fullName: form.fullName.trim(),
      companyName: form.companyName.trim() || undefined,
      email: form.email.trim(),
      phone: form.phone.trim(),
      preferredContactMethod: form.preferredContactMethod,
    },
    rental: {
      slug: form.rentalSlug,
      name: form.rentalName,
      duration: form.rentalDuration,
      startDate: form.startDate,
      endDate: form.endDate,
    },
    logistics: {
      pickupLocation: form.pickupLocation.trim(),
      returnLocation: form.returnLocation.trim(),
      deliveryRequired: form.deliveryRequired,
      deliveryAddress: form.deliveryRequired
        ? form.deliveryAddress.trim()
        : undefined,
    },
    load: {
      intendedUse: form.intendedUse.trim(),
      description: form.loadDescription.trim(),
      cargoType: form.cargoType.trim(),
      estimatedWeight: form.estimatedWeight.trim() || undefined,
      estimatedMileage: form.estimatedMileage.trim() || undefined,
    },
    requirements: {
      specialRequirements: form.specialRequirements.trim() || undefined,
      additionalNotes: form.additionalNotes.trim() || undefined,
    },
    metadata: {
      source: "website",
      submittedAt: new Date().toISOString(),
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
    },
  });

  const handleSubmit = async () => {
    if (!validateStep(2)) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitRentalQuote(buildPayload());
      setSubmitted(true);
    } catch (error) {
      setSubmitError(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const progressPercentage = ((activeStep + 1) / STEPS.length) * 100;

  return (
    <Dialog
      open={open}
      onClose={() => !submitting && onClose()}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            bgcolor: BG_DARK,
            backgroundImage: "none",
            color: "#fff",
            border: `1px solid ${BORDER}`,
            borderRadius: { xs: 3, sm: 4 },
            overflow: "hidden",
            boxShadow: "0 25px 60px rgba(0,0,0,0.8)",
            mx: { xs: 2, sm: "auto" },
          },
        },
      }}
    >
      <DialogContent sx={{ p: 0, bgcolor: BG_DARK, position: "relative" }}>
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Box
                sx={{
                  minHeight: 450,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  p: { xs: 3, sm: 6 },
                  bgcolor: BG_DARK,
                }}
              >
                <Stack spacing={3} sx={{ alignItems: "center", maxWidth: 420 }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      bgcolor: "rgba(200,255,0,0.1)",
                      display: "grid",
                      placeItems: "center",
                      color: LIME,
                      border: `1px solid rgba(200,255,0,0.3)`,
                      boxShadow: "0 0 30px rgba(200,255,0,0.15)",
                    }}
                  >
                    <CheckCircleRounded sx={{ fontSize: 44 }} />
                  </Box>
                  <Typography
                    variant="h4"

                    sx={{
                      color: "#ffffff !important",
                      fontWeight: 900,
                      letterSpacing: "-0.5px",
                      fontSize: { xs: "1.5rem", sm: "2rem" },
                    }}
                  >
                    Request Submitted!
                  </Typography>
                  <Typography
                    sx={{
                      color: "rgba(255, 255, 255, 0.9) !important",
                      lineHeight: 1.6,
                      fontSize: 14.5,
                    }}
                  >
                    Thank you,{" "}
                    <Box
                      component="span"
                      sx={{ color: "#ffffff !important", fontWeight: 700 }}
                    >
                      {form.fullName}
                    </Box>
                    . Our logistics coordinator will reach out to you shortly to
                    finalize your dispatch.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={onClose}
                    sx={{
                      mt: 2,
                      bgcolor: LIME,
                      color: "#000",
                      fontWeight: 800,
                      py: 1.4,
                      px: 5,
                      borderRadius: 2,
                      textTransform: "none",
                      "&:hover": { bgcolor: "#d7ff4d" },
                    }}
                  >
                    Done
                  </Button>
                </Stack>
              </Box>
            </motion.div>
          ) : (
            <motion.div
              key="wizard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* TOP HEADER */}
              <Box
                sx={{
                  px: { xs: 3, sm: 4 },
                  py: 2.5,
                  borderBottom: `1px solid ${BORDER}`,
                  bgcolor: CARD_BG,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center" }}
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: LIME,
                      color: "#000",
                      boxShadow: "0 0 15px rgba(200,255,0,0.2)",
                    }}
                  >
                    <LocalShippingRounded sx={{ fontSize: 22 }} />
                  </Box>
                  <Box>
                    <Typography
                      color={LIME}
                      sx={{
                        fontSize: 10,
                        fontWeight: 900,
                        letterSpacing: 1.5,
                        textTransform: "uppercase",
                      }}
                    >
                      Express Fleet Booking
                    </Typography>
                    <Typography
                      variant="h6"

                      noWrap
                      sx={{
                        maxWidth: { xs: 200, sm: 400 },
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: { xs: "1.1rem", sm: "1.25rem" },
                      }}
                    >
                      {rental?.title ?? "Hot Shot Equipment"}
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  onClick={onClose}
                  disabled={submitting}
                  sx={{
                    minWidth: 38,
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    color: "#fff",
                    bgcolor: "rgba(255,255,255,0.04)",
                    border: `1px solid ${BORDER}`,
                    "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                  }}
                >
                  <CloseRounded fontSize="small" />
                </Button>
              </Box>

              {/* STEPPER PROGRESS INDICATOR */}
              <Box
                sx={{
                  bgcolor: CARD_BG,
                  px: { xs: 3, sm: 4 },
                  pb: 2,
                  pt: 1,
                  borderBottom: `1px solid ${BORDER}`,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                    alignItems: "center",
                  }}
                >
                  <Typography
                    color={LIME}
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Step {activeStep + 1} of {STEPS.length}: {STEPS[activeStep]}
                  </Typography>
                  <Typography
                    sx={{
                      color: "rgba(255, 255, 255, 0.9)",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {Math.round(progressPercentage)}% Completed
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progressPercentage}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: "rgba(255,255,255,0.05)",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: LIME,
                      borderRadius: 3,
                      boxShadow: "0 0 10px rgba(200,255,0,0.4)",
                    },
                  }}
                />
              </Box>

              {/* WIZARD CONTENT AREA */}
              <Box
                sx={{
                  p: { xs: 3, sm: 4 },
                  minHeight: { xs: 340, sm: 380 },
                  maxHeight: "55vh",
                  overflowY: "auto",
                  bgcolor: BG_DARK,
                  "&::-webkit-scrollbar": { width: "5px" },
                  "&::-webkit-scrollbar-thumb": {
                    bgcolor: "rgba(255,255,255,0.1)",
                    borderRadius: "3px",
                  },
                }}
              >
                {activeStep === 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Stack spacing={2.5}>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ color: "#ffffff !important", fontWeight: 700 }}
                        >
                          Client Identity
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "rgba(255, 255, 255, 0.8) !important" }}
                        >
                          Enter your personal or corporate contact information.
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                          gap: 2.5,
                        }}
                      >
                        <TextField
                          label="Full Name"
                          value={form.fullName}
                          onChange={(e) =>
                            updateField("fullName", e.target.value)
                          }
                          error={!!errors.fullName}
                          helperText={errors.fullName}
                          required
                          fullWidth
                          sx={textFieldStyles}
                        />
                        <TextField
                          label="Company Name"
                          value={form.companyName}
                          onChange={(e) =>
                            updateField("companyName", e.target.value)
                          }
                          placeholder="Optional"
                          fullWidth
                          sx={textFieldStyles}
                        />
                        <TextField
                          label="Email Address"
                          type="email"
                          value={form.email}
                          onChange={(e) => updateField("email", e.target.value)}
                          error={!!errors.email}
                          helperText={errors.email}
                          required
                          fullWidth
                          sx={textFieldStyles}
                        />
                        <TextField
                          label="Phone Number"
                          value={form.phone}
                          onChange={(e) => updateField("phone", e.target.value)}
                          error={!!errors.phone}
                          helperText={errors.phone}
                          required
                          fullWidth
                          sx={textFieldStyles}
                        />
                        <Box sx={{ gridColumn: { sm: "span 2" } }}>
                          <TextField
                            select
                            label="Preferred Communication Channel"
                            value={form.preferredContactMethod}
                            onChange={(e) =>
                              updateField(
                                "preferredContactMethod",
                                e.target.value as PreferredContactMethod,
                              )
                            }
                            fullWidth
                            sx={textFieldStyles}
                          >
                            {CONTACT_METHOD_OPTIONS.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Box>
                      </Box>
                    </Stack>
                  </motion.div>
                )}

                {activeStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Stack spacing={2.5}>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ color: "#ffffff !important", fontWeight: 700 }}
                        >
                          Timeline & Routing
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "rgba(255, 255, 255, 0.8) !important" }}
                        >
                          Define rental duration and dispatch/delivery path.
                        </Typography>
                      </Box>
                      <TextField
                        select
                        label="Rental Plan Duration"
                        value={form.rentalDuration}
                        onChange={(e) =>
                          updateField(
                            "rentalDuration",
                            e.target.value as RentalDuration,
                          )
                        }
                        fullWidth
                        sx={textFieldStyles}
                      >
                        {RENTAL_DURATION_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                          gap: 2.5,
                        }}
                      >
                        <TextField
                          label="Start Date"
                          type="date"
                          value={form.startDate}
                          onChange={(e) =>
                            updateField("startDate", e.target.value)
                          }
                          error={!!errors.startDate}
                          helperText={errors.startDate}
                          required
                          fullWidth

                          sx={textFieldStyles}
                          slotProps={{
                            htmlInput: { min: today },
                            inputLabel: {
                              shrink: true,
                              style: { color: "#ffffff" },
                            },
                          }}
                        />
                        {form.rentalDuration === "custom" && (
                          <TextField
                            label="End Date"
                            type="date"
                            value={form.endDate}
                            onChange={(e) =>
                              updateField("endDate", e.target.value)
                            }
                            error={!!errors.endDate}
                            helperText={errors.endDate}
                            required
                            fullWidth

                            sx={textFieldStyles}
                            slotProps={{
                              htmlInput: { min: form.startDate || today },
                              inputLabel: {
                                shrink: true,
                                style: { color: "#ffffff" },
                              },
                            }}
                          />
                        )}
                      </Box>
                      <Divider sx={{ borderColor: BORDER, my: 1 }} />
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                          gap: 2.5,
                        }}
                      >
                        <TextField
                          label="Pickup Location"
                          placeholder="City, State / Depot"
                          value={form.pickupLocation}
                          onChange={(e) =>
                            updateField("pickupLocation", e.target.value)
                          }
                          error={!!errors.pickupLocation}
                          helperText={errors.pickupLocation}
                          required
                          fullWidth
                          sx={textFieldStyles}
                        />
                        <TextField
                          label="Return Location"
                          placeholder="City, State / Drop Depot"
                          value={form.returnLocation}
                          onChange={(e) =>
                            updateField("returnLocation", e.target.value)
                          }
                          error={!!errors.returnLocation}
                          helperText={errors.returnLocation}
                          required
                          fullWidth
                          sx={textFieldStyles}
                        />
                      </Box>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={form.deliveryRequired}
                            onChange={(e) =>
                              updateField("deliveryRequired", e.target.checked)
                            }
                            sx={{
                              color: "#ffffff",
                              "&.Mui-checked": { color: LIME },
                            }}
                          />
                        }
                        label={
                          <Typography
                            sx={{ color: "#ffffff !important", fontSize: 13.5 }}
                          >
                            Require transport/rig delivery to my site location
                          </Typography>
                        }
                      />
                      {form.deliveryRequired && (
                        <TextField
                          label="Site Delivery Address"
                          placeholder="Complete address & gate instructions"
                          value={form.deliveryAddress}
                          onChange={(e) =>
                            updateField("deliveryAddress", e.target.value)
                          }
                          error={!!errors.deliveryAddress}
                          helperText={errors.deliveryAddress}
                          required
                          fullWidth
                          sx={textFieldStyles}
                        />
                      )}
                    </Stack>
                  </motion.div>
                )}

                {activeStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Stack spacing={2.5}>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ color: "#ffffff !important", fontWeight: 700 }}
                        >
                          Review Quote Details
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "rgba(255, 255, 255, 0.8) !important" }}
                        >
                          Confirm your specifications before transmitting.
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          p: 2.5,
                          borderRadius: 2,
                          bgcolor: CARD_BG,
                          border: `1px solid ${BORDER}`,
                        }}
                      >
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                            gap: 2,
                            mb: 2,
                          }}
                        >
                          <Box>
                            <Typography
                              sx={{
                                color: "rgba(255, 255, 255, 0.7) !important",
                                fontSize: 11,
                              }}
                            >
                              Full Name
                            </Typography>
                            <Typography
                              sx={{
                                color: "#ffffff !important",
                                fontWeight: 600,
                                fontSize: 14,
                              }}
                            >
                              {form.fullName || "N/A"}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              sx={{
                                color: "rgba(255, 255, 255, 0.7) !important",
                                fontSize: 11,
                              }}
                            >
                              Email
                            </Typography>
                            <Typography
                              sx={{
                                color: "#ffffff !important",
                                fontWeight: 600,
                                fontSize: 14,
                              }}
                            >
                              {form.email || "N/A"}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              sx={{
                                color: "rgba(255, 255, 255, 0.7) !important",
                                fontSize: 11,
                              }}
                            >
                              Phone
                            </Typography>
                            <Typography
                              sx={{
                                color: "#ffffff !important",
                                fontWeight: 600,
                                fontSize: 14,
                              }}
                            >
                              {form.phone || "N/A"}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              sx={{
                                color: "rgba(255, 255, 255, 0.7) !important",
                                fontSize: 11,
                              }}
                            >
                              Rental Plan
                            </Typography>
                            <Typography
                              sx={{
                                color: "#ffffff !important",
                                fontWeight: 600,
                                fontSize: 14,
                              }}
                            >{`${form.rentalDuration.toUpperCase()} (${form.startDate} to ${form.endDate || "End"})`}</Typography>
                          </Box>
                          <Box>
                            <Typography
                              sx={{
                                color: "rgba(255, 255, 255, 0.7) !important",
                                fontSize: 11,
                              }}
                            >
                              Pickup Point
                            </Typography>
                            <Typography
                              sx={{
                                color: "#ffffff !important",
                                fontWeight: 600,
                                fontSize: 14,
                              }}
                            >
                              {form.pickupLocation || "N/A"}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              sx={{
                                color: "rgba(255, 255, 255, 0.7) !important",
                                fontSize: 11,
                              }}
                            >
                              Dropoff Point
                            </Typography>
                            <Typography
                              sx={{
                                color: "#ffffff !important",
                                fontWeight: 600,
                                fontSize: 14,
                              }}
                            >
                              {form.returnLocation || "N/A"}
                            </Typography>
                          </Box>
                        </Box>
                        <Divider sx={{ borderColor: BORDER, my: 1.5 }} />
                        <Typography
                          sx={{
                            color: "rgba(255, 255, 255, 0.7) !important",
                            fontSize: 12,
                            textTransform: "uppercase",
                            fontWeight: 700,
                          }}

                          gutterBottom
                        >
                          Intended Use
                        </Typography>
                        <Typography
                          sx={{ color: "#ffffff !important", fontSize: 13.5 }}
                        >
                          {form.intendedUse || "None specified"}
                        </Typography>
                      </Box>

                      <Box sx={{ pt: 1 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={form.agreeToContact}
                              onChange={(e) =>
                                updateField("agreeToContact", e.target.checked)
                              }
                              sx={{
                                color: "#ffffff",
                                "&.Mui-checked": { color: LIME },
                              }}
                            />
                          }
                          label={
                            <Typography
                              sx={{ color: "#ffffff !important", fontSize: 13 }}
                            >
                              I confirm the details above are accurate and
                              authorize Hot Shot Rentals to contact me.
                            </Typography>
                          }
                        />
                        {errors.agreeToContact && (
                          <Typography
                            color="#ff6b6b"
                            sx={{ ml: 4, mt: 0.5, fontSize: 11.5 }}
                          >
                            {errors.agreeToContact}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </motion.div>
                )}
              </Box>

              {submitError && (
                <Box sx={{ px: { xs: 3, sm: 4 }, pb: 1 }}>
                  <Typography
                    role="alert"
                    sx={{
                      px: 2,
                      py: 1.4,
                      fontSize: 13,
                      color: "#ff8a80",
                      borderRadius: 2,
                      bgcolor: "rgba(255,82,82,0.08)",
                      border: "1px solid rgba(255,82,82,0.3)",
                    }}
                  >
                    {submitError}
                  </Typography>
                </Box>
              )}

              {/* FOOTER CONTROLS */}
              <Box
                sx={{
                  px: { xs: 3, sm: 4 },
                  py: 2.5,
                  bgcolor: CARD_BG,
                  borderTop: `1px solid ${BORDER}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Button
                  onClick={handleBack}
                  disabled={activeStep === 0 || submitting}
                  sx={{
                    color: activeStep === 0 ? "transparent" : "#fff",
                    visibility: activeStep === 0 ? "hidden" : "visible",
                    fontWeight: 700,
                    textTransform: "none",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
                  }}
                >
                  Back
                </Button>

                {activeStep < STEPS.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<ArrowForwardRounded />}
                    sx={{
                      bgcolor: LIME,
                      color: "#000",
                      fontWeight: 800,
                      px: 4,
                      py: 1.2,
                      borderRadius: 2,
                      textTransform: "none",
                      boxShadow: "0 4px 15px rgba(200,255,0,0.2)",
                      "&:hover": { bgcolor: "#d7ff4d" },
                    }}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    disabled={submitting}
                    onClick={() => void handleSubmit()}
                    startIcon={
                      submitting ? (
                        <CircularProgress size={18} sx={{ color: "#000" }} />
                      ) : (
                        <SendRounded />
                      )
                    }
                    sx={{
                      bgcolor: LIME,
                      color: "#000",
                      fontWeight: 900,
                      px: 4,
                      py: 1.2,
                      borderRadius: 2,
                      textTransform: "none",
                      boxShadow: "0 4px 15px rgba(200,255,0,0.2)",
                      "&:hover": { bgcolor: "#d7ff4d" },
                    }}
                  >
                    Submit Request
                  </Button>
                )}
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
