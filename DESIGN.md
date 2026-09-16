# DESIGN.md

## Brand character
Friendly, slightly playful, hopeful, honest, and intimate—like a small letter from the present self to the future self. Avoid childish visuals and forced motivational language.

## Palette
- background: `#FAF6EF`
- surface: `#FFFFFF`
- primary text: `#25283A`
- secondary text: `#8D887F`
- primary: `#B9A2FF`
- primary dark: `#6550A4`
- success surface: `#D5EBDD`
- success text: `#477C5A`
- peach: `#F4D1C2`
- border: `#EAE4DB`
- dark background: `#181A29`
- dark surface: `#25283A`

## UI rules
- RTL-first.
- Use Vazirmatn if licensing and bundling are practical.
- Rounded cards: approximately 20–24dp.
- Primary actions: approximately 52–56dp height.
- Clear hierarchy, generous spacing, minimal decoration.
- Use envelope or paper-plane motifs sparingly.
- Avoid text embedded in icons.
- Motion should be short and purposeful: fade, envelope close on save, gentle reveal.
- Dark mode can be deferred until the core experience is stable.

## Screens
### Home
- greeting
- nearest locked message
- new-message CTA
- message list entry point
- settings entry point
- empty, loading, error, and multiple-message states

### Create Message
- required text field
- 1–5000 character validation
- date/time selection as a separate step
- optional friendly labels that can be removed
- clear confirmation before save

### Reveal Message
- unlocked message body
- created and unlock dates
- copy action
- create-new action
- deleted/error state
- notification deep-link entry

## Copy style
Use conversational Persian. Keep copy warm and direct. Avoid exaggerated promises and cliché motivational slogans.
