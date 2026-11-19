import { createServerFn } from "@tanstack/react-start";
import { rsvpSchema } from "./rsvp-schema";
import { eventConfig } from "./event-config";

// This endpoint intentionally accepts public invitation replies. It never reads or
// returns guest records; the service credential is confined to this insert handler.
export const submitRsvp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => rsvpSchema.parse(input))
  .handler(async ({ data }) => {
    if (!eventConfig.rsvp.enabled) throw new Error("Replies are not open at the moment.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("celebration_rsvps").insert({
      submission_key: data.submissionKey,
      event_id: eventConfig.id,
      guest_name: data.guestName,
      attendance: data.attendance,
      guest_count: data.guestCount,
      message: data.message,
    });
    if (error && error.code !== "23505") throw new Error("Your reply couldn't be saved. Please try again.");
    return { success: true };
  });