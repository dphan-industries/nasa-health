# Deep Space Health Systems

Deep Space Health is this project's identity. It is an independent crew-health prototype for NASA Space Apps, not NASA medical software or a NASA-endorsed service.

The visual system follows the [NASA Space Apps brand page](https://www.spaceappschallenge.org/brand/) and its [May 23, 2025 guide](https://assets.spaceappschallenge.org/media/documents/Space_Apps_Brand_Guide_-_23_May_2025.pdf):

- Deep Blue `#07173F` for reading surfaces; Electric Blue `#0042A6` for controls and the top-left to bottom-right page gradient.
- Neon Yellow `#EAFE07` used sparingly for accents, primary actions, focus, and selection. No yellow page backgrounds.
- White text, with lighter blue secondary text. Checked core text combinations exceed 4.5:1 contrast.
- Overpass Regular/Bold for body copy and Fira Sans Bold/Black for headings, bundled locally in `public/fonts` with their licenses and service-worker precaching.
- Labeled line icons; color is supplemented by labels and selected states.

The Deep Space Health planet icon is a separate project graphic. The user-supplied official Space Apps color-and-white SVG is copied unchanged to `public/brand/space-apps-color-white.svg` and displayed proportionally directly on the Deep Blue header with clear space. No filters, recoloring, or altered lockups are applied. No standalone NASA insignia or worm logo is used.

## Crew and navigation

The Crew overview contains six explicitly fictional training profiles. Selecting a crew member shows that member's illustrative vital signs, sleep, mood, and check-in note. **My saved history** opens this browser's actual saved entries separately. This does not implement multi-device crew synchronization or access-controlled medical sharing.

The main screen still exposes Emergency assist. Feature pages use one large arrow-only **Back** control with an accessible label, without top-right Home or emergency buttons. Record vitals is centered. The wellbeing screen uses a labeled body-area menu; the body illustration has been removed.

Earlier preview screenshots: [centered vitals](screenshots/27-centered-vitals.png), [fictional crew overview](screenshots/28-crew-overview.png).

Current interface: plain feature descriptions, no promotional slogans, arrow-only Back navigation, and [crew records preview](screenshots/31-plain-crew-records.png).

Back is placed at the left of the page heading; the title is aligned to the right. Offline availability is shown in Device & data instead of beside every page title.

The current theme uses a dim, static SVG starfield and transparent reading surfaces. Navigation controls have subtle touch/hover feedback, and supported browsers crossfade screen changes in 360 ms. Reduced-motion preferences disable screen movement. The background is cached for offline use. [Home preview](docs/screenshots/33-relaxed-space-home.png) · [Vitals preview](docs/screenshots/34-seamless-vitals.png).
