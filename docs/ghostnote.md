# Ghostnote knowledge base

What is specific to this project: its principles, decisions and conventions. General Expo guidance lives in `AGENTS.md`; where the two disagree, this file wins.

Keep it short. Add a line when a decision is made, change it when the decision changes, and delete what is no longer true.

## Product

- Ghostnote is an iOS app for learning and practising drum rudiments, such as rolls and paradiddles.
- It is built for one drummer first, and is meant to go through the full App Store release flow.
- iOS only for now. Android and web are not targets, so no code or dependency is added for them.

## Engineering principles

### 1. Native-first

Use what iOS provides before drawing an imitation of it in JavaScript.

- Navigation uses native containers: the native stack and native tabs (`expo-router/native-tabs`), not JavaScript tab bars or headers.
- Icons are SF Symbols through `expo-symbols`, not icon fonts or image sets.
- System behaviour is left to the system: safe-area insets, scroll edge effects, the tab bar's glass material, Dynamic Type and haptics.
- A custom control is built only when iOS has no equivalent, or when the design needs something the native one cannot do. The exception is named in the decisions log below.
- The cost is accepted: native components are styled less freely than the mock-up. The mock-up bends to the platform, not the other way round.

### 2. Minimal

- Every dependency needs a reason. Prefer an Expo module, and install with `npx expo install`.
- No demo code, no unused assets, no speculative abstractions.

### 3. Configuration over native code

- `ios/` is generated and git-ignored. Native behaviour is set in `app.json` and config plugins, never by editing `ios/`.

## Design

### Colour

Tokens live in `src/theme/colors.ts`. Components use tokens, never raw hex values.

| Token            | Value     | Purpose                                                     |
| ---------------- | --------- | ----------------------------------------------------------- |
| `background`     | `#151619` | Near-black: main screen and navigation background           |
| `surface`        | `#26272B` | Charcoal practice panel                                     |
| `accent`         | `#E77A4C` | Apricot: Start Practice, active navigation, completed goals |
| `violet`         | `#B19AD8` | Soft lavender-violet: rudiment position numbers             |
| `text.primary`   | `#F5F3F0` | Headings and main content                                   |
| `text.secondary` | `#A5A5AB` | Metadata, labels, inactive navigation                       |
| `text.onAccent`  | `#191919` | Text on the accent colour                                   |
| `border`         | `#3B3D43` | Subtle dividers and separators                              |
| `disabled`       | `#696B72` | Incomplete weekly goals and inactive elements               |

`border` and `disabled` are supporting tokens for lines and marks; they do not have enough contrast for text.

The app is dark only: `userInterfaceStyle` is `dark` in `app.json`. There is no light theme.

### Typography

Tokens live in `src/theme/typography.ts`.

| Font                             | Usage                                 |
| -------------------------------- | ------------------------------------- |
| Bodoni Moda, Medium and SemiBold | "Today's Practice" and major headings |
| Inter, Medium and SemiBold       | Rudiment names, buttons, navigation   |
| Inter, Regular and Medium        | Metadata, BPM labels, descriptions    |

- Fonts are embedded at build time by the `expo-font` plugin in `app.json`, so there is no runtime font loading.
- iOS addresses embedded fonts by PostScript name: `BodoniModa-Medium`, `BodoniModa-SemiBold`, `Inter-Regular`, `Inter-Medium`, `Inter-SemiBold`.
- With a custom `fontFamily`, weight comes from the family name. Do not add `fontWeight`.

### Visual direction

An oversized editorial serif heading, a numbered rudiment list, monochrome photography and restrained apricot and violet accents on near-black. Screens are built from reusable components, not traced from the mock-up.

## Stack

Expo SDK 58, Expo Router, React Native 0.88, React 19 with the React Compiler, TypeScript 6, ESLint 9 flat config, Prettier. Read exact versions from `package.json`.

## Structure

- `src/app/` holds routes only. `(tabs)/` holds the four tabs: Practice, Metronome, Rudiments, Insights.
- `src/components/` holds reusable components, in kebab-case files with named exports.
- `src/theme/` holds design tokens.
- Imports use the `@/` alias for `src/`.

## Working on it

- `npx expo start`, then `i`, for everyday work on JavaScript.
- `npx expo run:ios` after adding a package with native code or changing `app.json`. If plugins or `app.json` changed, run `npx expo prebuild -p ios` first.
- Before a change is done: `npm run lint`, `npm run typecheck`, `npm run format:check`.

## Decisions

| Date       | Decision                                                                                                                                 | Why                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 2026-11-12 | Expo with Expo Router and TypeScript, iOS only                                                                                           | Fastest route to the App Store for a first native app                                |
| 2026-11-12 | Splash screen is native config only                                                                                                      | No JavaScript is needed to show or hide it                                           |
| 2026-11-12 | Bodoni Moda and Inter, embedded at build time                                                                                            | Editorial direction of the design; no loading state                                  |
| 2026-11-12 | Native tabs replace the JavaScript tab bar                                                                                               | Native-first; the bar no longer matches the flat bar in the mock-up                  |
| 2026-11-12 | Dark appearance only                                                                                                                     | The design has one theme, and the system tab bar follows the app's appearance        |
| 2026-11-12 | Near-black, charcoal and apricot palette with a violet secondary accent, chosen after trying sand with cobalt and ice blue with midnight | Owner's choice; the only palette tried where every text pair passes WCAG AA contrast |
| 2026-11-12 | Bundle identifier `dev.wiola.ghostnote`                                                                                                  | Reverse of the owner's domain                                                        |

## Open

- App icon is still the Expo placeholder.
- The rudiment photographs are placeholders.
- Screens have layout only. Practice, metronome, rudiment library and insights have no behaviour yet.
