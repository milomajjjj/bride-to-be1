import hero from "../assets/bridal-hero.png";
import wide from "../assets/bridal-wide.png?url";
import details from "../assets/bridal-details.png";
import bridePortrait from "../assets/bride-portrait.png";
import brideCelebration from "../assets/bride-celebration.png";
import brideAndSister from "../assets/bride-and-sister.png";


// Sample celebration details. Customize this single object for each invitation.
export const eventConfig = {
  id: "sophia-bride-to-be",
  brideName: "Sophia",
  startsAt: "2027-05-15T16:00:00+03:00",
  endsAt: "2027-05-15T19:00:00+03:00",
  date: "May 15, 2027",
  weekday: "Saturday",
  time: "4:00 PM",
  timeNote: "An afternoon of celebration",
  venue: "The Garden Room",
  location: "Beirut, Lebanon",
  mapsQuery: "Beirut Lebanon",
  dressCode: "Pretty in Pink",
  dressDescription: "Let's make this celebration picture-perfect! Dress in your favorite shades of pink, blush, nude, or champagne.",
  images: {
  hero,
  wide,
  mood: details,
  gallery: [
    bridePortrait,
    brideCelebration,
    brideAndSister,
  ],
},
  rsvp: { enabled: true, maxGuests: 10, replyBy: "May 1, 2027" },
};

export function getCountdown(target: string, now: number) {
  const total = Math.max(0, Math.floor((new Date(target).getTime() - now) / 1000));
  return { days: Math.floor(total / 86400), hours: Math.floor(total / 3600) % 24, minutes: Math.floor(total / 60) % 60, seconds: total % 60 };
}

export function calendarContent() {
  const stamp = (date: string) => new Date(date).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Bride to Be//Invitation//EN", "BEGIN:VEVENT", `UID:${eventConfig.id}@invitation`, `DTSTAMP:${stamp(new Date().toISOString())}`, `DTSTART:${stamp(eventConfig.startsAt)}`, `DTEND:${stamp(eventConfig.endsAt)}`, `SUMMARY:${eventConfig.brideName}'s Bride-to-Be Celebration`, `LOCATION:${eventConfig.venue} - ${eventConfig.location}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
}