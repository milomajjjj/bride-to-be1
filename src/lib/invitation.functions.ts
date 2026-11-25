
import { createServerFn } from "@tanstack/react-start";
import type { InvitationData } from "@/components/invitation-rsvp";

const API_URL = import.meta.env["VITE_API_URL"];

export const getInvitationByToken = createServerFn({
  method: "GET",
})
  .validator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    try {
      if (!API_URL) {
        throw new Error("API URL is not configured.");
      }

      const response = await fetch(
        `${API_URL}/api/invitation/${encodeURIComponent(data.token)}`,
        {
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Invitation not found.");
      }

      return {
        invitation: result as InvitationData,
        error: "",
      };
    } catch (err) {
      return {
        invitation: null,
        error:
          err instanceof Error
            ? err.message
            : "Could not load invitation.",
      };
    }
  });
