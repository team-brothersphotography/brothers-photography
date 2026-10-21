import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import Layout from "../components/layout/Layout";
import Button from "../components/ui/Button";
import Calendar from "../components/ui/Calendar";
import StepProgress from "../components/ui/StepProgress";
import { FieldWrapper, Input, TextArea } from "../components/ui/Field";
import { listServices } from "../api/services";
import { getAvailability, createBooking } from "../api/bookings";
import { extractErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatDate, formatTime } from "../utils/format";
import { trackActivity } from "../services/activityTracker";
import type { Booking, Service, SlotAvailability } from "../types";

const STEPS = ["Service", "Date", "Time", "Details", "Confirm"];

export default function BookingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const queryServiceId = searchParams.get("service") ? Number(searchParams.get("service")) : null;
  const preselectedServiceId = queryServiceId || (location.state as { serviceId?: number } | null)?.serviceId;

  const [step, setStep] = useState(preselectedServiceId ? 1 : 0);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(preselectedServiceId ?? null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<SlotAvailability[] | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [dayBlocked, setDayBlocked] = useState(false);

  const [details, setDetails] = useState({
    full_name: user?.full_name || "",
    phone_number: user?.phone_number || "",
    event_location: "",
    number_of_guests: "",
    message: "",
  });

  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    listServices().then(setServices);
    trackActivity("BOOKING_STARTED", "/booking");
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    setSlots(null);
    setSelectedTime(null);
    const iso = format(selectedDate, "yyyy-MM-dd");
    getAvailability(iso).then((res) => {
      setSlots(res.slots);
      setDayBlocked(res.day_blocked);
    });
  }, [selectedDate]);

  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId) || null,
    [services, selectedServiceId]
  );

  function goNext() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleConfirm() {
    if (!selectedService || !selectedDate || !selectedTime) return;
    setSubmitError("");
    setIsSubmitting(true);
    try {
      const booking = await createBooking({
        service_id: selectedService.id,
        full_name: details.full_name,
        phone_number: details.phone_number,
        event_location: details.event_location,
        number_of_guests: details.number_of_guests ? Number(details.number_of_guests) : null,
        message: details.message,
        event_date: format(selectedDate, "yyyy-MM-dd"),
        event_time: `${selectedTime}:00`,
      });
      setConfirmedBooking(booking);
      trackActivity("BOOKING_SUBMITTED", "/booking", {
        reference: booking.reference_number,
        service: selectedService.name,
      });
    } catch (err) {
      setSubmitError(extractErrorMessage(err));
      // If the slot just got taken, send them back to the time step to re-check availability.
      if (extractErrorMessage(err).toLowerCase().includes("slot")) {
        setStep(2);
        if (selectedDate) {
          const iso = format(selectedDate, "yyyy-MM-dd");
          getAvailability(iso).then((res) => {
            setSlots(res.slots);
            setDayBlocked(res.day_blocked);
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user) {
    return (
      <Layout>
        <section className="mx-auto max-w-lg px-6 py-24 text-center">
          <h1 className="font-display text-3xl text-cream">Log in to book a shoot</h1>
          <p className="mt-3 text-cream-dim">
            Create an account or log in first so we can tie your booking to your profile.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button onClick={() => navigate("/login", { state: { from: { pathname: "/book" } } })}>
              Log in
            </Button>
            <Button variant="outline" onClick={() => navigate("/register")}>
              Create account
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  if (confirmedBooking) {
    return (
      <Layout>
        <section className="mx-auto max-w-lg px-6 py-24 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-gold">Booking submitted</p>
          <h1 className="mt-2 font-display text-4xl text-cream">Thank you, {confirmedBooking.full_name.split(" ")[0]}!</h1>
          <p className="mt-4 text-cream-dim">
            Your request for <strong className="text-cream">{confirmedBooking.service.name}</strong> on{" "}
            {formatDate(confirmedBooking.event_date)} at {formatTime(confirmedBooking.event_time)} has been
            received and is currently <strong className="text-gold">pending confirmation</strong>.
          </p>
          <div className="mt-6 inline-block rounded-xl border border-line bg-panel px-6 py-4">
            <p className="text-xs uppercase tracking-wide text-cream-dim">Booking reference</p>
            <p className="mt-1 font-display text-2xl text-gold">{confirmedBooking.reference_number}</p>
          </div>
          <div className="mt-8 flex justify-center gap-3">
            <Button onClick={() => navigate("/my-bookings")}>View my bookings</Button>
            <Button variant="ghost" onClick={() => navigate("/")}>
              Back to home
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="mx-auto max-w-3xl px-6 py-14">
        <p className="text-sm uppercase tracking-[0.2em] text-gold">Book your shoot</p>
        <h1 className="mt-2 font-display text-4xl text-cream">Let's lock in your date</h1>

        <div className="mt-8 overflow-x-auto pb-2">
          <StepProgress steps={STEPS} currentStep={step} />
        </div>

        <div className="mt-10 rounded-2xl border border-line bg-panel-soft p-6 md:p-8">
          {step === 0 && (
            <div>
              <p className="font-display text-2xl text-cream">Select a service</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedServiceId(service.id)}
                    className={`rounded-xl border p-4 text-left transition-colors ${
                      selectedServiceId === service.id
                        ? "border-gold bg-gold/10"
                        : "border-line bg-panel hover:border-gold/40"
                    }`}
                  >
                    <p className="text-cream">{service.name}</p>
                    {service.highlights[0] && (
                      <p className="mt-1 text-xs text-cream-dim">{service.highlights[0]}</p>
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-8 flex justify-end">
                <Button disabled={!selectedServiceId} onClick={goNext}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <p className="font-display text-2xl text-cream">Choose your event date</p>
              <p className="mt-1 text-sm text-cream-dim">Past dates can't be selected.</p>
              <div className="mt-5 max-w-sm">
                <Calendar selectedDate={selectedDate} onSelect={setSelectedDate} />
              </div>
              <div className="mt-8 flex justify-between">
                <Button variant="ghost" onClick={goBack}>
                  Back
                </Button>
                <Button disabled={!selectedDate} onClick={goNext}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="font-display text-2xl text-cream">Pick a time</p>
              <p className="mt-1 text-sm text-cream-dim">
                {selectedDate && formatDate(format(selectedDate, "yyyy-MM-dd"))}
              </p>

              {dayBlocked ? (
                <p className="mt-6 text-clay">
                  This date is fully unavailable. Please go back and choose another date.
                </p>
              ) : slots === null ? (
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="h-11 animate-pulse rounded-lg bg-panel" />
                  ))}
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {slots.map((slot) => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`rounded-lg border py-2.5 text-sm transition-colors ${
                        !slot.available
                          ? "cursor-not-allowed border-line/50 text-cream-dim/40 line-through"
                          : selectedTime === slot.time
                            ? "border-gold bg-gold text-ink"
                            : "border-line text-cream hover:border-gold/40"
                      }`}
                    >
                      {formatTime(slot.time + ":00")}
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-8 flex justify-between">
                <Button variant="ghost" onClick={goBack}>
                  Back
                </Button>
                <Button disabled={!selectedTime} onClick={goNext}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                goNext();
              }}
            >
              <p className="font-display text-2xl text-cream">Your details</p>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <FieldWrapper label="Full name">
                  <Input
                    required
                    value={details.full_name}
                    onChange={(e) => setDetails((d) => ({ ...d, full_name: e.target.value }))}
                  />
                </FieldWrapper>
                <FieldWrapper label="Phone number">
                  <Input
                    type="tel"
                    required
                    value={details.phone_number}
                    onChange={(e) => setDetails((d) => ({ ...d, phone_number: e.target.value }))}
                  />
                </FieldWrapper>
                <FieldWrapper label="Event location">
                  <Input
                    required
                    value={details.event_location}
                    onChange={(e) => setDetails((d) => ({ ...d, event_location: e.target.value }))}
                    placeholder="Venue / address"
                  />
                </FieldWrapper>
                <FieldWrapper label="Number of guests (optional)">
                  <Input
                    type="number"
                    min={0}
                    value={details.number_of_guests}
                    onChange={(e) => setDetails((d) => ({ ...d, number_of_guests: e.target.value }))}
                  />
                </FieldWrapper>
              </div>
              <div className="mt-5">
                <FieldWrapper label="Additional message (optional)">
                  <TextArea
                    value={details.message}
                    onChange={(e) => setDetails((d) => ({ ...d, message: e.target.value }))}
                    placeholder="Anything we should know ahead of the shoot?"
                  />
                </FieldWrapper>
              </div>
              <div className="mt-8 flex justify-between">
                <Button type="button" variant="ghost" onClick={goBack}>
                  Back
                </Button>
                <Button type="submit">Continue</Button>
              </div>
            </form>
          )}

          {step === 4 && selectedService && selectedDate && selectedTime && (
            <div>
              <p className="font-display text-2xl text-cream">Review your booking</p>
              <dl className="mt-6 divide-y divide-line/60 text-sm">
                {[
                  ["Service", selectedService.name],
                  ["Date", formatDate(format(selectedDate, "yyyy-MM-dd"))],
                  ["Time", formatTime(selectedTime + ":00")],
                  ["Name", details.full_name],
                  ["Phone", details.phone_number],
                  ["Location", details.event_location],
                  ...(details.number_of_guests ? [["Guests", details.number_of_guests]] : []),
                  ...(details.message ? [["Message", details.message]] : []),
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-6 py-3">
                    <dt className="text-cream-dim">{label}</dt>
                    <dd className="text-right text-cream">{value}</dd>
                  </div>
                ))}
              </dl>

              {submitError && <p className="mt-4 text-sm text-clay">{submitError}</p>}

              <div className="mt-8 flex justify-between">
                <Button variant="ghost" onClick={goBack}>
                  Back
                </Button>
                <Button onClick={handleConfirm} isLoading={isSubmitting}>
                  Confirm booking
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
