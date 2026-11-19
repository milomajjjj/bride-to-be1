import { describe, expect, it } from "vitest";
import { getCountdown } from "@/lib/event-config";
import { rsvpSchema } from "@/lib/rsvp-schema";

const reply = { submissionKey: "1ba1d126-938b-471c-9b2d-e5f7f642f332", guestName: "Test Guest", attendance: "accept", guestCount: 2, message: "With love", website: "" };
describe("Invitation rules", () => {
  it("counts days, hours, minutes and seconds to the configured event", () => {
    expect(getCountdown("2027-05-15T16:00:00Z", Date.parse("2027-05-14T14:57:56Z"))).toEqual({ days: 1, hours: 1, minutes: 2, seconds: 4 });
  });
  it("never displays a negative countdown after the celebration", () => {
    expect(getCountdown("2027-05-15T16:00:00Z", Date.parse("2027-05-16T16:00:00Z"))).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });
  it("accepts a guest name, attendance, party size and optional note", () => { expect(rsvpSchema.parse(reply).guestCount).toBe(2); });
  it("rejects an RSVP without a guest name", () => { expect(rsvpSchema.safeParse({ ...reply, guestName: " " }).success).toBe(false); });
  it("stores a decline with no attending guests", () => { expect(rsvpSchema.parse({ ...reply, attendance: "decline", guestCount: 0 }).guestCount).toBe(0); });
  it("rejects acceptance without any guests", () => { expect(rsvpSchema.safeParse({ ...reply, guestCount: 0 }).success).toBe(false); });
});