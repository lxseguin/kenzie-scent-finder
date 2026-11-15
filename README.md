# Kenzie's Scent Finder

A small web app for working through a pile of perfume samples: tap any one,
say **yes / neutral / no**, jot a note, and save a designed PDF report at the end.

**Live:** https://lxseguin.github.io/kenzie-scent-finder/

- 34 fragrances (two Ulta sampler sets + four D.S. & Durga), each with scent
  family, plain-English notes, a sweetness/strength reading, price and a shop link.
- Progress is saved in the browser, so she can close the tab and come back.
- Optional head-to-head round ranks her favourites down to a single number one.
- "Save my report" builds a PDF with jsPDF — same typefaces and palette as the
  site, with every shop link clickable. On a phone it opens the share sheet;
  on a computer it downloads.

Nothing is sent anywhere. All state lives in `localStorage` on her own device.

### Layout
```
index.html       app: data, UI, state
report-pdf.js    PDF layout
fonts/fonts.js   Instrument Serif, Hanken Grotesk, DM Mono (SIL OFL 1.1)
vendor/          jsPDF 2.5.1 (MIT)
```
Prices checked November 2026.
