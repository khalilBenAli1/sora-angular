export type MenuCategory = 'To begin' | 'From the kitchen' | 'Something sweet' | 'To sip';
export interface Dish {
  id: string;
  name: string;
  description: string;
  detail: string;
  price: number;
  category: MenuCategory;
  note?: string;
}
export const categories: MenuCategory[] = [
  'To begin',
  'From the kitchen',
  'Something sweet',
  'To sip',
];
export const menu: Dish[] = [
  {
    id: 'ricotta',
    name: 'Whipped ricotta',
    description: 'Preserved lemon, herbs, grilled bread',
    detail:
      'A soft, generous beginning. Creamy ricotta, bright preserved lemon and a handful of garden herbs, served with warm bread for the table.',
    price: 1400,
    category: 'To begin',
    note: 'For sharing',
  },
  {
    id: 'beets',
    name: 'Roasted beets',
    description: 'Cultured cream, walnut, garden leaves',
    detail:
      'Slow-roasted beets meet cool cultured cream, toasted walnut and tender leaves. Earthy, bright and gently dressed.',
    price: 1600,
    category: 'To begin',
  },
  {
    id: 'crudo',
    name: 'Citrus crudo',
    description: 'Cucumber, dill, a bright little dressing',
    detail:
      'A delicate seasonal fish crudo with crisp cucumber, fresh dill and a light citrus dressing. Prepared to order.',
    price: 1800,
    category: 'To begin',
  },
  {
    id: 'roots',
    name: 'A seasonal plate',
    description: 'Roasted roots, tahini cream, toasted seeds',
    detail:
      'Our illustrated signature plate: roasted carrots and roots, tahini cream, toasted seeds and herbs. The photograph shows the spirit of this fictional seasonal menu.',
    price: 2600,
    category: 'From the kitchen',
    note: 'From the garden',
  },
  {
    id: 'pasta',
    name: 'Hand-cut pappardelle',
    description: 'Mushroom, brown butter, aged cheese',
    detail:
      'Wide ribbons of pasta with seared mushrooms and nutty brown butter, finished with aged cheese and a little black pepper.',
    price: 2800,
    category: 'From the kitchen',
  },
  {
    id: 'fish',
    name: 'Fish of the evening',
    description: 'White beans, fennel, lemon butter',
    detail:
      'A gently cooked fillet served over soft white beans, with shaved fennel and lemon butter. A quietly satisfying main course.',
    price: 3400,
    category: 'From the kitchen',
  },
  {
    id: 'pear',
    name: 'Pear & almond',
    description: 'Warm almond cake, poached pear, cream',
    detail:
      'A small warm almond cake with gently poached pear and a spoonful of cream. The kind of dessert that asks you to stay a little longer.',
    price: 1200,
    category: 'Something sweet',
  },
  {
    id: 'chocolate',
    name: 'Dark chocolate',
    description: 'Olive oil, sea salt, a crisp little biscuit',
    detail:
      'A rich chocolate crémeux with a few drops of olive oil, sea salt and a crisp biscuit alongside.',
    price: 1300,
    category: 'Something sweet',
  },
  {
    id: 'citrus-spritz',
    name: 'Garden spritz',
    description: 'Citrus, rosemary, sparkling water',
    detail:
      'A bright alcohol-free spritz with seasonal citrus, a little rosemary and plenty of bubbles.',
    price: 900,
    category: 'To sip',
    note: 'Alcohol-free',
  },
  {
    id: 'tea',
    name: 'After-dinner tea',
    description: 'A warm, thoughtful finish',
    detail:
      'Choose from a small selection of loose-leaf teas. Ask for the evening’s selection when you imagine your table.',
    price: 500,
    category: 'To sip',
  },
];
export function euros(cents: number): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
    minimumFractionDigits: cents % 100 ? 2 : 0,
  }).format(cents / 100);
}
