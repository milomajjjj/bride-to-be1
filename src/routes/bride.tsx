import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Heart,
  LogOut,
  Users,
  CheckCircle,
  Clock,
  UserPlus,
  Copy,
  CalendarDays,
  MapPin,
  Link as LinkIcon,
} from "lucide-react";

export const Route = createFileRoute("/bride")({
  component: BrideDashboard,
});

const API_URL = import.meta.env["VITE_API_URL"];

type RSVP = {
  status: "pending" | "attending" | "declined";
  attendees_count: number;
};

type Guest = {
  id: number;
  name: string;
  email: string | null;
  attendance_limit: number;
  token: string;
  rsvp?: RSVP;
};

type Wedding = {
  id: number;
  title: string;
  slug: string;
  wedding_date: string | null;
  venue: string | null;
  guests_count?: number;
};

function BrideDashboard() {
  const navigate = useNavigate();

  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [guestLists, setGuestLists] = useState<Record<number, Guest[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const authToken = localStorage.getItem("auth_token");

  useEffect(() => {
    if (!authToken) {
      navigate({ to: "/login" });
      return;
    }

    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const weddingResponse = await fetch(`${API_URL}/api/weddings`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!weddingResponse.ok) {
        throw new Error("Could not load your weddings.");
      }

      const weddingData = await weddingResponse.json();
      const weddingItems: Wedding[] = weddingData.weddings ?? [];

      setWeddings(weddingItems);

      const guestResults = await Promise.all(
        weddingItems.map(async (wedding) => {
          const response = await fetch(
            `${API_URL}/api/weddings/${wedding.id}/guests`,
            {
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Could not load guests for ${wedding.title}.`);
          }

          const data = await response.json();

          return {
            weddingId: wedding.id,
            guests: data.guests ?? [],
          };
        })
      );

      const lists: Record<number, Guest[]> = {};

      guestResults.forEach((result) => {
        lists[result.weddingId] = result.guests;
      });

      setGuestLists(lists);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await fetch(`${API_URL}/api/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      navigate({ to: "/login" });
    }
  }

  const allGuests = useMemo(
    () => Object.values(guestLists).flat(),
    [guestLists]
  );

  const totalGuests = allGuests.length;

  const attending = allGuests.filter(
    (guest) => guest.rsvp?.status === "attending"
  );

  const pending = allGuests.filter(
    (guest) => !guest.rsvp || guest.rsvp.status === "pending"
  );

  const declined = allGuests.filter(
    (guest) => guest.rsvp?.status === "declined"
  );

  const totalAttendees = attending.reduce(
    (total, guest) => total + (guest.rsvp?.attendees_count ?? 0),
    0
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf6f3]">
        <p className="text-[#927c70]">Loading your dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf6f3] px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <header className="mb-10 flex items-center justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Heart className="h-6 w-6 text-[#bd927d]" />
              <span className="font-serif text-xl text-[#63483d]">
                Wedding Dashboard
              </span>
            </div>
            <p className="text-sm text-[#927c70]">
              Manage your guest invitations and track RSVPs.
            </p>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-lg border border-[#e8dcd5] bg-white px-4 py-2 text-sm text-[#63483d] hover:bg-[#f8eee9]"
          >
            <LogOut size={16} />
            Logout
          </button>
        </header>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}
        <section className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Guests"
            value={totalGuests}
            icon={<Users />}
          />
          <StatCard
            label="Attending"
            value={attending.length}
            icon={<CheckCircle />}
          />
          <StatCard
            label="Pending"
            value={pending.length}
            icon={<Clock />}
          />
          <StatCard
            label="Expected Attendees"
            value={totalAttendees}
            icon={<Heart />}
          />
        </section>

        {/* Weddings */}
        {weddings.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <Heart className="mx-auto mb-4 h-10 w-10 text-[#bd927d]" />
            <h2 className="font-serif text-2xl text-[#63483d]">
              No wedding invitation yet
            </h2>
            <p className="mt-2 text-sm text-[#927c70]">
              Your administrator will set up your wedding invitation.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {weddings.map((wedding) => (
              <WeddingSection
                key={wedding.id}
                wedding={wedding}
                guests={guestLists[wedding.id] ?? []}
                authToken={authToken!}
                onGuestAdded={(guest) => {
                  setGuestLists((current) => ({
                    ...current,
                    [wedding.id]: [
                      ...(current[wedding.id] ?? []),
                      guest,
                    ],
                  }));
                }}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#eee3dc] bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-[#927c70]">{label}</p>
        <span className="text-[#bd927d]">{icon}</span>
      </div>
      <p className="text-3xl font-semibold text-[#63483d]">{value}</p>
    </div>
  );
}

function WeddingSection({
  wedding,
  guests,
  authToken,
  onGuestAdded,
}: {
  wedding: Wedding;
  guests: Guest[];
  authToken: string;
  onGuestAdded: (guest: Guest) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [attendanceLimit, setAttendanceLimit] = useState("1");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function addGuest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setAdding(true);

    try {
      const response = await fetch(
        `${API_URL}/api/weddings/${wedding.id}/guests`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            name,
            email: email || null,
            attendance_limit: Number(attendanceLimit),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Could not add this guest."
        );
      }

      onGuestAdded(data.guest);

      setName("");
      setEmail("");
      setAttendanceLimit("1");
      setSuccess("Guest added and invitation link generated!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setAdding(false);
    }
  }

  function getInvitationLink(guest: Guest) {
  return `${window.location.origin}/?token=${guest.token}`;
}
  async function copyLink(guest: Guest) {
    try {
      await navigator.clipboard.writeText(getInvitationLink(guest));
      setSuccess(`Invitation link for ${guest.name} copied!`);
    } catch {
      setError("Could not copy the link. Please copy it manually.");
    }
  }

  function statusBadge(guest: Guest) {
    const status = guest.rsvp?.status ?? "pending";

    const styles = {
      attending: "bg-green-100 text-green-700",
      pending: "bg-amber-100 text-amber-700",
      declined: "bg-red-100 text-red-700",
    };

    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#eee3dc] bg-white shadow-sm">

      {/* Wedding Information */}
      <div className="border-b border-[#eee3dc] bg-[#f8f1ed] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="font-serif text-3xl text-[#63483d]">
              {wedding.title}
            </h2>

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#927c70]">
              {wedding.wedding_date && (
                <span className="flex items-center gap-2">
                  <CalendarDays size={16} />
                  {new Date(wedding.wedding_date).toLocaleDateString()}
                </span>
              )}

              {wedding.venue && (
                <span className="flex items-center gap-2">
                  <MapPin size={16} />
                  {wedding.venue}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-white px-5 py-3">
            <p className="text-xs text-[#927c70]">Invited guests</p>
            <p className="text-2xl font-semibold text-[#63483d]">
              {guests.length}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8 p-6 md:p-8">

        {/* Add Guest Form */}
        <div>
          <div className="mb-5 flex items-center gap-2">
            <UserPlus className="text-[#bd927d]" />
            <h3 className="font-serif text-2xl text-[#63483d]">
              Add a Guest
            </h3>
          </div>

          <form onSubmit={addGuest} className="grid gap-4 md:grid-cols-4">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Guest name"
              className="rounded-lg border border-[#e8dcd5] px-4 py-3 outline-none focus:border-[#bd927d]"
            />

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (optional)"
              className="rounded-lg border border-[#e8dcd5] px-4 py-3 outline-none focus:border-[#bd927d]"
            />

            <select
              value={attendanceLimit}
              onChange={(e) => setAttendanceLimit(e.target.value)}
              className="rounded-lg border border-[#e8dcd5] bg-white px-4 py-3 outline-none focus:border-[#bd927d]"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
                <option key={number} value={number}>
                  Maximum {number} {number === 1 ? "person" : "people"}
                </option>
              ))}
            </select>

            <button
              type="submit"
              disabled={adding}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#9c7160] px-5 py-3 text-white transition hover:bg-[#805849] disabled:opacity-60"
            >
              <UserPlus size={17} />
              {adding ? "Generating..." : "Add Guest"}
            </button>
          </form>

          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}

          {success && (
            <p className="mt-3 text-sm text-green-700">{success}</p>
          )}
        </div>

        {/* Guest List */}
        <div>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-serif text-2xl text-[#63483d]">
              Guest Invitations
            </h3>
            <span className="text-sm text-[#927c70]">
              {guests.length} guests
            </span>
          </div>

          {guests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#e8dcd5] p-8 text-center">
              <Users className="mx-auto mb-3 text-[#bd927d]" />
              <p className="text-sm text-[#927c70]">
                You haven't added any guests yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">
                <thead>
                  <tr className="border-b border-[#eee3dc] text-xs uppercase text-[#927c70]">
                    <th className="px-4 py-3">Guest</th>
                    <th className="px-4 py-3">Max people</th>
                    <th className="px-4 py-3">RSVP</th>
                    <th className="px-4 py-3">Attending</th>
                    <th className="px-4 py-3">Invitation</th>
                  </tr>
                </thead>

                <tbody>
                  {guests.map((guest) => (
                    <tr
                      key={guest.id}
                      className="border-b border-[#f1e9e4] last:border-0"
                    >
                      <td className="px-4 py-4">
                        <p className="font-medium text-[#63483d]">
                          {guest.name}
                        </p>
                        {guest.email && (
                          <p className="mt-1 text-xs text-[#927c70]">
                            {guest.email}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4 text-sm text-[#63483d]">
                        {guest.attendance_limit}
                      </td>

                      <td className="px-4 py-4">
                        {statusBadge(guest)}
                      </td>

                      <td className="px-4 py-4 text-sm text-[#63483d]">
                        {guest.rsvp?.status === "attending"
                          ? guest.rsvp.attendees_count
                          : 0}
                      </td>

                      <td className="px-4 py-4">
                        <button
                          onClick={() => copyLink(guest)}
                          className="flex items-center gap-2 rounded-lg border border-[#e8dcd5] px-3 py-2 text-sm text-[#805849] hover:bg-[#f8f1ed]"
                        >
                          <Copy size={15} />
                          Copy link
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-[#f8f1ed] p-4 text-sm text-[#805849]">
          <LinkIcon size={17} />
          Each guest receives a unique invitation link. Share it privately with them.
        </div>
      </div>
    </section>
  );
}


