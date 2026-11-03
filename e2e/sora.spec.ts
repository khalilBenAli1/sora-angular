import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 10, 3, 12));
  await page.emulateMedia({ reducedMotion: 'reduce' });
});
async function visit(page: Page, route: string) {
  await page.goto(`./#${route}`);
  const headings: Record<string, string | RegExp> = {
    '/': 'SORA',
    '/reserve': 'Make an evening of it.',
    '/desk': /An evening.*in view/,
    '/story': /Less complication.*More season/,
    '/visit': /A little planning.*look forward/,
    '/missing': /find you.*place at the table/,
  };
  await expect(
    page.getByRole('main').getByRole('heading', { level: 1, name: headings[route] }),
  ).toBeVisible();
}
async function beginReservation(page: Page) {
  await visit(page, '/reserve');
  await page.getByRole('button', { name: /^18:00/ }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
}
async function completeSample(page: Page) {
  await page.getByRole('button', { name: 'Use sample details', exact: true }).click();
  await page
    .getByRole('checkbox', { name: /I understand this is a simulated reservation/ })
    .check();
  await page.getByRole('button', { name: 'Review my evening', exact: true }).click();
  await page.getByRole('button', { name: 'Complete demo reservation', exact: true }).click();
  const reference = (await page.getByText(/Demo reference · SR-/).textContent())?.match(
    /SR-[A-Z0-9]{8}/,
  )?.[0];
  expect(reference).toBeTruthy();
  if (!reference) throw new Error('Missing confirmation reference');
  return reference;
}

test('menu categories and dish details work with the keyboard; the mobile rail is discoverable', async ({
  page,
  browserName,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await visit(page, '/');
  await page.getByRole('button', { name: 'Explore the evening', exact: true }).click();
  await expect(page.getByText('Explore the courses', { exact: true })).toBeVisible();
  const next = page.getByRole('button', { name: 'Next dishes', exact: true });
  await expect(next).toBeEnabled();
  await next.click();
  await expect(page.getByRole('button', { name: 'Previous dishes', exact: true })).toBeEnabled();
  const first = page.getByRole('button', { name: /Whipped ricotta/ });
  await first.focus();
  const nextControl = browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+Tab' : 'Tab';
  await page.keyboard.press(nextControl);
  const second = page.getByRole('button', { name: /Roasted beets/ });
  await expect(second).toBeFocused();
  await expect(second).toBeInViewport({ ratio: 0.7 });
  await page.keyboard.press(nextControl);
  const third = page.getByRole('button', { name: /Citrus crudo/ });
  await expect(third).toBeFocused();
  await expect(third).toBeInViewport({ ratio: 0.7 });
  await page.keyboard.press('Enter');
  const dish = page.getByRole('dialog', { name: 'Citrus crudo', exact: true });
  await expect(dish).toBeVisible();
  await expect(dish.getByText(/delicate seasonal fish crudo/)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dish).not.toBeVisible();
  await expect(third).toBeFocused();
  await page.getByRole('button', { name: '02 From the kitchen', exact: true }).click();
  await expect(page.getByRole('button', { name: /A seasonal plate/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Whipped ricotta/ })).toHaveCount(0);
});

test('reservation contact validation, review, privacy and restart work end to end', async ({
  page,
}) => {
  await beginReservation(page);
  await page.getByRole('button', { name: 'Review my evening', exact: true }).click();
  await expect(
    page.getByText('Please enter a valid email address.', { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel('Your name', { exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Use sample details', exact: true }).click();
  await expect(page.getByLabel('Email address', { exact: true })).toHaveValue('alex@example.com');
  await page.getByLabel('Your name', { exact: true }).fill('Taylor Example');
  await page.getByLabel('Email address', { exact: true }).fill('taylor.contact@example.test');
  await page.getByRole('button', { name: 'Review my evening', exact: true }).click();
  await expect(
    page.getByText('Please confirm that this is a simulated reservation.', { exact: true }),
  ).toBeVisible();
  const consent = page.getByRole('checkbox', {
    name: /I understand this is a simulated reservation/,
  });
  await consent.focus();
  await page.keyboard.press('Space');
  await page.getByRole('button', { name: 'Review my evening', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('taylor.contact@example.test', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Complete demo reservation', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1, name: /Your table/ })).toBeFocused();
  await expect(page.getByText(/Thank you, Taylor/)).toBeVisible();
  const stored = await page.evaluate(() => localStorage.getItem('sora:reservations:v1'));
  expect(stored).not.toContain('Taylor Example');
  expect(stored).not.toContain('taylor.contact@example.test');
  expect(stored).not.toContain('email');
  expect(stored).toContain('Sora guest 5');
  await page.getByRole('button', { name: 'Imagine another evening', exact: true }).click();
  await expect(page.getByText(/Demo reference · SR-/)).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^18:00/ })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
});

test('a reservation can be edited, reloaded and cancelled, releasing its seating capacity', async ({
  page,
}) => {
  await beginReservation(page);
  const reference = await completeSample(page);
  await page.getByRole('link', { name: 'View the demo desk', exact: true }).click();
  await expect(
    page.getByText('Demo access · Local sample data. No sign-in or real customer records.', {
      exact: false,
    }),
  ).toBeVisible();
  await page.getByRole('button', { name: `Edit ${reference}`, exact: true }).click();
  const editor = page.getByRole('dialog', { name: 'A little change of plan', exact: true });
  await editor.getByLabel('Evening', { exact: true }).fill('2026-11-05');
  await editor.getByLabel('Guests', { exact: true }).selectOption({ label: '6 guests' });
  await editor.getByLabel('Seating', { exact: true }).selectOption('19:30');
  await editor.getByRole('button', { name: 'Save changes', exact: false }).click();
  await expect(editor).not.toBeVisible();
  await page.reload();
  const record = page.getByRole('article', { name: new RegExp(reference) });
  await expect(record.getByText(/5 Nov/)).toBeVisible();
  await expect(record).toContainText('6 guests');
  await expect(record).toContainText('19:30');
  await visit(page, '/reserve');
  await page.getByRole('button', { name: /\b5 November 2026/ }).click();
  await expect(page.getByRole('button', { name: /^19:30 6 places$/ })).toBeVisible();
  await visit(page, '/desk');
  const cancel = page.getByRole('button', { name: `Cancel ${reference}`, exact: true });
  await cancel.focus();
  await cancel.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'A change of plans?', exact: true });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(cancel).toBeFocused();
  await cancel.press('Enter');
  await dialog.getByRole('button', { name: 'Cancel reservation', exact: true }).click();
  await expect(record.getByText('cancelled', { exact: true })).toBeVisible();
  await expect(
    page.getByText(`${reference} has been cancelled. Its places are available again.`, {
      exact: true,
    }),
  ).toBeVisible();
  await visit(page, '/reserve');
  await page.getByRole('button', { name: /\b5 November 2026/ }).click();
  await expect(page.getByRole('button', { name: /^19:30 12 places$/ })).toBeVisible();
});

test('desk search, status, calendar selection, empty results and reset derive from the same records', async ({
  page,
}) => {
  await visit(page, '/desk');
  await page.getByLabel(/^Status/).selectOption('confirmed');
  await expect(page.getByRole('article')).toHaveCount(3);
  await page.getByLabel('Search reservations', { exact: true }).fill('Alex');
  await expect(page.getByRole('article')).toHaveCount(1);
  await page.getByLabel('Evening', { exact: true }).filter({ visible: true }).fill('2026-11-05');
  await expect(
    page.getByRole('heading', { name: 'No reservations match this view.', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Show all reservations', exact: false }).click();
  await expect(page.getByRole('article')).toHaveCount(4);
  await page.getByRole('button', { name: 'Calendar', exact: true }).click();
  await page.getByRole('button', { name: /\b4 November 2026, 3 reservations$/ }).click();
  await expect(page.getByLabel('Evening', { exact: true }).filter({ visible: true })).toHaveValue(
    '2026-11-04',
  );
  await expect(page.getByRole('article')).toHaveCount(3);
  await page.getByRole('button', { name: 'Reset demo data', exact: true }).click();
  await page
    .getByRole('dialog', { name: 'Start a fresh evening?', exact: true })
    .getByRole('button', { name: 'Reset demo', exact: true })
    .click();
  await expect(page.getByText(/reset to its four sample reservations/)).toBeVisible();
  await page.getByRole('button', { name: 'List', exact: true }).click();
  await expect(page.getByRole('article')).toHaveCount(4);
});

test('availability exposes closed/full evenings and a recoverable connection failure', async ({
  page,
}) => {
  await visit(page, '/reserve');
  await page.getByRole('button', { name: /\b9 November 2026.*kitchen closed/ }).click();
  await expect(
    page.getByText('The kitchen rests on Mondays. Try another evening.', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: /\b17 November 2026/ }).click();
  await expect(
    page.getByText('This evening is fully booked. Try another date.', { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: /^18:00 Full$/ })).toBeDisabled();
  await page.getByRole('button', { name: /\b13 November 2026/ }).click();
  await expect(
    page.getByRole('heading', { name: 'A small interruption.', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.getByRole('button', { name: /^18:00 12 places$/ })).toBeEnabled();
  await expect(page.getByRole('button', { name: /\b2 November 2026/ })).toBeDisabled();
});

test('the calendar crosses month boundaries and rejects out-of-horizon input safely', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await visit(page, '/reserve');
  await page.getByRole('button', { name: 'Next month', exact: true }).click();
  await expect(page.getByText('December 2026', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /\b1 December 2026/ }).click();
  await expect(page.getByLabel('Your date', { exact: true })).toHaveValue('2026-12-01');
  await page.getByLabel('Your date', { exact: true }).fill('9999-12-31');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(
    page.getByText('Choose a date within the next 180 days.', { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel('Your date', { exact: true })).toBeFocused();
  await page.getByLabel('Your date', { exact: true }).fill('2026-11-02');
  await expect(page.getByText('Choose today or a future date.', { exact: true })).toBeVisible();
});

test('mobile navigation supports Escape, restored focus and direct routes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await visit(page, '/');
  const trigger = page.getByRole('button', { name: 'Open menu', exact: true });
  await trigger.focus();
  await trigger.press('Enter');
  const menu = page.getByRole('dialog', { name: 'The evening awaits', exact: true });
  await expect(menu).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.press('Enter');
  await menu.getByRole('link', { name: 'Our philosophy', exact: true }).click();
  await expect(page).toHaveURL(/#\/story$/);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: /Less complication/ })).toBeVisible();
  await visit(page, '/missing');
  await expect(page.getByRole('link', { name: 'Back to Sora', exact: false })).toBeVisible();
});

test('main routes have no automated WCAG A/AA findings or runtime errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const route of ['/', '/reserve', '/desk', '/story', '/visit']) {
    await test.step(route, async () => {
      await visit(page, route);
      if (route === '/reserve') await page.getByRole('button', { name: /^18:00/ }).waitFor();
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(result.violations).toEqual([]);
    });
  }
  expect(errors).toEqual([]);
});

test('valid long contact details wrap in narrow review and confirmation screens', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await beginReservation(page);
  const name = 'Alexandria'.repeat(10);
  const email = `${'a'.repeat(60)}@${'b'.repeat(60)}.example.test`;
  await page.getByLabel('Your name', { exact: true }).fill(name);
  await page.getByLabel('Email address', { exact: true }).fill(email);
  await page
    .getByRole('checkbox', { name: /I understand this is a simulated reservation/ })
    .check();
  await page.getByRole('button', { name: 'Review my evening', exact: true }).click();
  await expect(page.getByText(email, { exact: false })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
  await page.getByRole('button', { name: 'Complete demo reservation', exact: true }).click();
  await expect(
    page.getByText(`Thank you, ${name}. Your practice reservation is ready.`, { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
});

test('key layouts reflow without page overflow at390,768 and1440 pixels', async ({ page }) => {
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ['/', '/reserve', '/desk']) {
      await test.step(`${route} at${width}px`, async () => {
        await visit(page, route);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
          ),
        ).toBe(true);
      });
    }
  }
});
