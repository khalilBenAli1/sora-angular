import { describe, expect, it } from 'vitest';
import { emailError, validateContact } from './contact';

describe('supported demo contact email syntax', () => {
  it.each(['alex<smith>@example.com', 'alex,smith@example.com'])(
    'rejects unsupported punctuation in an unquoted email: %s',
    (email) => {
      expect(emailError(email)).toBe('Please enter a valid email address.');
      expect(validateContact({ name: 'Léa Ben Ali', email, consent: true })).toHaveProperty(
        'email',
      );
    },
  );
  it.each(['alex.smith+dinner@example.com', "o'connor+dinner@example.co.uk"])(
    'preserves supported plus and dot addresses: %s',
    (email) => {
      expect(emailError(` ${email} `)).toBeNull();
      expect(
        validateContact({ name: ' Léa Ben Ali ', email: ` ${email} `, consent: true }),
      ).toEqual({});
    },
  );
  it('preserves raw length limits and simulation acknowledgement', () => {
    expect(emailError(`${'a'.repeat(243)}@example.com`)).toBeTruthy();
    expect(
      validateContact({ name: 'Léa', email: 'lea@example.com', consent: false }),
    ).toHaveProperty('consent');
  });
});
