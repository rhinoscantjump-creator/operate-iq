import type { Business, Contact } from "../types/index.js";
import { createBookingLink } from "../tools/shared.js";

export interface CalendarAdapter {
  id: string;
  bookingLinkFor(business: Business, contact: Contact): string;
}

export function createBookingLinkAdapter(): CalendarAdapter {
  return {
    id: "calendar-booking-link",
    bookingLinkFor(business, contact) {
      return createBookingLink(business, contact);
    },
  };
}
