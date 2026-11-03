# Artwork and font provenance

- `public/images/seasonal-plate-*.webp` are optimized versions of the original food photograph generated with the built-in ImageGen tool for this portfolio in November 2026. It depicts an illustrative seasonal plate for the fictional Sora restaurant. The approved source is `output/frontend-portfolio-prompts/references/assets/dining.png` in the parent workspace; the app has no runtime dependency on that path.
- Two locally bundled type families: Newsreader and Public Sans, distributed by Fontsource under their respective SIL Open Font Licenses. Complete font license notices ship in `public/FONT_LICENSES.txt`; Latin WOFF2 subsets are bundled by Angular without remote font requests.
- The Sora favicon and interface decoration are original code-native SVG/CSS/text. No private client artwork, logos, photographs, or datasets are included.
- MIT applies to original application code. It does not override third-party font licenses or establish exclusivity over generated imagery.

Exact approved image prompt is recorded in `docs/image-prompt.txt`.

- `public/images/dining-room-*.webp`: original atmospheric dining-room photography generated with built-in ImageGen on 2026-11-03 for the distinct Sora redesign. Optimized sizes 24–124 KB; exact prompt in `docs/dining-room-prompt.txt`. No real restaurant interior or third-party image was copied.
