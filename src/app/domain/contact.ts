export interface ContactDetails {
  name: string;
  email: string;
  consent: boolean;
}
export type ContactErrors = Partial<Record<keyof ContactDetails, string>>;
export function nameError(value: string): string | null {
  return value.trim().length >= 2 && value.trim().length <= 100
    ? null
    : 'Please enter a name between 2 and 100 characters.';
}
export function emailError(value: string): string | null {
  return value.length <= 254 &&
    /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z0-9.-]+$/i.test(value.trim())
    ? null
    : 'Please enter a valid email address.';
}
export function validateContact(value: ContactDetails): ContactErrors {
  const errors: ContactErrors = {};
  const name = nameError(value.name);
  const email = emailError(value.email);
  if (name) errors.name = name;
  if (email) errors.email = email;
  if (!value.consent) errors.consent = 'Please confirm that this is a simulated reservation.';
  return errors;
}
