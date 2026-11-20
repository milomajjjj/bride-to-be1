
import { createServerFn } from "@tanstack/react-start";
import { rsvpSchema } from "./rsvp-schema";
import { eventConfig } from "./event-config";

export const submitRsvp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => rsvpSchema.parse(input))
  .handler(async ({ data }) => {
    if (!eventConfig.rsvp.enabled) {
      throw new Error("Replies are not open at the moment.");
    }

    // TODO: Save RSVP to Aiven database.
    throw new Error("RSVP database integration is not configured yet.");
  });
