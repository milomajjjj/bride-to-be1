import { z } from "zod";
import { eventConfig } from "./event-config";

export const rsvpSchema = z.object({
  submissionKey: z.string().uuid(),
  guestName: z.string().trim().min(1, "Please enter your name.").max(100),
  attendance: z.enum(["accept", "decline"]),
  guestCount: z.number().int().min(0).max(eventConfig.rsvp.maxGuests),
  message: z.string().trim().max(1000),
  website: z.string().max(0),
}).refine((data) => data.attendance === "decline" ? data.guestCount === 0 : data.guestCount >= 1, { message: "Please choose the number of guests attending.", path: ["guestCount"] });