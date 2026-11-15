/* ============================================================
   Kenzie's scent report — PDF
   Built with jsPDF, using the same typefaces and palette as the
   site: Instrument Serif for display, Hanken Grotesk for body,
   DM Mono for labels. Every Ulta reference is a real PDF link
   annotation, so the links stay clickable in the saved file.
   ============================================================ */
(function (global) {
  "use strict";

  const PAGE = { W: 612, H: 792, M: 54 };
  const COL = PAGE.W - PAGE.M * 2;            // 504
  const FOOT = 32;                             // reserved strip at the page bottom

  const C = {
    ink:      [25, 22, 33],
    ink2:     [76, 70, 87],
    ink3:     [126, 119, 137],
    line:     [227, 224, 233],
    lineSoft: [238, 236, 242],
    surface:  [252, 251, 253],
    accent:   [74, 63, 143]
  };
  const FAM = {
    gourmand: [169, 99, 46], fruity: [188, 51, 74], floral: [173, 74, 133],
    amber: [107, 80, 160],   fresh:  [31, 123, 125], woody:  [100, 96, 46]
  };
  const ST = {
    yes: [62, 125, 94], neutral: [158, 120, 50], no: [129, 122, 140], none: [106, 92, 166]
  };

  /* t = 0 keeps the colour, t = 1 goes to white */
  function tint(c, t) {
    return [Math.round(c[0] + (255 - c[0]) * t),
            Math.round(c[1] + (255 - c[1]) * t),
            Math.round(c[2] + (255 - c[2]) * t)];
  }

  function registerFonts(doc) {
    const faces = global.REPORT_FONTS || [];
    faces.forEach(f => { doc.addFileToVFS(f.file, f.data); doc.addFont(f.file, f.family, f.style); });
    return faces.length > 0;
  }

  function buildReportPDF(d) {
    const { jsPDF } = global.jspdf || global;
    const doc = new jsPDF({ unit: "pt", format: "letter", compress: true });
    const hasFonts = registerFonts(doc);

    /* Fall back to the built-ins if the font bundle failed to load, so a
       missing file degrades the look instead of breaking the download. */
    const SERIF  = hasFonts ? "Instrument" : "times";
    const SANS   = hasFonts ? "Hanken"     : "helvetica";
    const MONO   = hasFonts ? "Mono"       : "courier";

    let y = PAGE.M;

    /* ---------- primitives ---------- */
    const setFill   = c => doc.setFillColor(c[0], c[1], c[2]);
    const setStroke = c => doc.setDrawColor(c[0], c[1], c[2]);
    const setText   = c => doc.setTextColor(c[0], c[1], c[2]);
    function font(fam, style, size) { doc.setFont(fam, style); doc.setFontSize(size); }

    function hr(yy, c, w) {
      setStroke(c || C.line); doc.setLineWidth(w || 0.6);
      doc.line(PAGE.M, yy, PAGE.M + COL, yy);
    }
    function need(h) {
      if (y + h > PAGE.H - PAGE.M - FOOT) { doc.addPage(); y = PAGE.M; return true; }
      return false;
    }
    /* Uppercase mono label with the letter-spacing the site uses */
    function label(txt, x, yy, size, c, align) {
      font(MONO, "normal", size); setText(c || C.ink3);
      doc.text(String(txt).toUpperCase(), x, yy, { charSpace: size * 0.11, align: align || "left" });
    }
    function labelWidth(txt, size) {
      font(MONO, "normal", size);
      const s = String(txt).toUpperCase();
      return doc.getTextWidth(s) + s.length * size * 0.11;
    }
    function wrap(txt, fam, style, size, width) {
      font(fam, style, size);
      return doc.splitTextToSize(String(txt), width);
    }
    /* Text that is also a clickable link, underlined in the accent colour */
    function linkText(txt, x, yy, size) {
      font(SANS, "normal", size); setText(C.accent);
      doc.text(txt, x, yy);
      const w = doc.getTextWidth(txt);
      setStroke(C.accent); doc.setLineWidth(0.5);
      doc.line(x, yy + 1.6, x + w, yy + 1.6);
      return w;
    }

    /* ---------- masthead ---------- */
    label("Kenzie's scent report   ·   " + d.date, PAGE.M, y + 8, 8);
    y += 26;

    font(SERIF, "normal", d.winner ? 40 : 34); setText(C.ink);
    const titleLines = doc.splitTextToSize(d.winner ? d.winner.name : "Your scent report", COL);
    titleLines.forEach(ln => { doc.text(ln, PAGE.M, y + 30); y += 40; });
    y += 2;

    font(SANS, "normal", 11); setText(C.ink2);
    const n = d.total || 30;
    const sub = d.winner
      ? "Out of " + n + " samples, this is the one you kept choosing."
      : n + " samples, sorted into yes, neutral and no.";
    doc.text(sub, PAGE.M, y + 10);
    y += 28;

    /* ---------- winner card ---------- */
    if (d.winner) {
      const w = d.winner, fc = FAM[w.fam] || C.accent;
      const vibeLines = wrap(w.vibe, SERIF, "italic", 15, COL - 48);
      const h = 154 + vibeLines.length * 19;
      need(h);

      setFill(tint(fc, 0.90)); setStroke(tint(fc, 0.55)); doc.setLineWidth(1);
      doc.roundedRect(PAGE.M, y, COL, h, 16, 16, "FD");

      let iy = y + 30;
      label("Your No. 1", PAGE.M + 24, iy, 8.5, fc);
      iy += 22;
      label(w.brand, PAGE.M + 24, iy, 8.5, C.ink3);
      iy += 20;
      font(SERIF, "normal", 30); setText(C.ink);
      doc.text(w.name, PAGE.M + 24, iy + 10);
      iy += 26;

      font(SERIF, "italic", 15); setText(C.ink2);
      vibeLines.forEach(ln => { iy += 19; doc.text(ln, PAGE.M + 24, iy); });
      iy += 20;

      setStroke(tint(fc, 0.70)); doc.setLineWidth(0.6);
      doc.line(PAGE.M + 24, iy, PAGE.M + COL - 24, iy);
      iy += 20;

      label("From $" + w.small + "  ·  " + w.smallSize + "  ·  " + w.fullSize + " $" + w.full,
            PAGE.M + 24, iy, 9, C.ink2);
      const lx = PAGE.M + 24 + labelWidth("From $" + w.small + "  ·  " + w.smallSize + "  ·  " + w.fullSize + " $" + w.full, 9) + 14;
      const lw = linkText("Buy at " + (w.shop || "Ulta"), lx, iy, 9.5);
      doc.link(lx, iy - 9, lw, 13, { url: w.url });

      y += h + 26;
    }

    /* ---------- one group: Yes / Neutral / No / Not reviewed ---------- */
    function group(g) {
      if (!g.items.length) return;
      const sc = ST[g.key] || C.accent;

      need(64);
      setFill(tint(sc, 0.90)); setStroke(tint(sc, 0.62)); doc.setLineWidth(0.8);
      doc.roundedRect(PAGE.M, y, COL, 32, 9, 9, "FD");
      setFill(sc); doc.circle(PAGE.M + 17, y + 16, 3.4, "F");
      font(SERIF, "normal", 17); setText(tint(sc, 0.18));
      doc.text(g.label, PAGE.M + 28, y + 22);
      const lw = doc.getTextWidth(g.label);
      label(g.sub, PAGE.M + 28 + lw + 12, y + 21, 7.5, C.ink3);
      label(String(g.items.length), PAGE.M + COL - 16, y + 21, 9, C.ink3, "right");
      y += 32 + 14;

      g.items.forEach((it, i) => {
        const metaTxt = it.famLabel + "   ·   " + it.notes.join(", ");
        const textW = COL - 24 - 86;
        const metaLines = wrap(metaTxt, SANS, "normal", 9, textW);
        const noteLines = it.note ? wrap("“" + it.note + "”", SERIF, "italic", 11, textW) : [];
        const h = 14 + 20 + metaLines.length * 11.5 + (noteLines.length ? 6 + noteLines.length * 13 : 0) + 16 + 9;

        if (need(h)) { /* new page: no orphan separator */ }

        const tx = PAGE.M + 24;
        let iy = y + 12;

        if (g.ranked) label(String(i + 1), PAGE.M + 2, iy + 17, 9, C.ink3);
        else { setFill(tint(sc, 0.45)); doc.circle(PAGE.M + 9, iy + 13, 2.2, "F"); }

        label(it.brand, tx, iy, 7.5, C.ink3);
        iy += 16;
        font(SERIF, "normal", 17); setText(C.ink);
        doc.text(it.name, tx, iy);
        iy += 5;

        font(SANS, "normal", 9); setText(C.ink3);
        metaLines.forEach(ln => { iy += 11.5; doc.text(ln, tx, iy); });

        if (noteLines.length) {
          iy += 6;
          const top = iy - 2;
          font(SERIF, "italic", 11); setText(C.ink2);
          noteLines.forEach(ln => { iy += 13; doc.text(ln, tx + 10, iy); });
          setStroke(tint(sc, 0.5)); doc.setLineWidth(1.4);
          doc.line(tx + 2, top, tx + 2, iy + 2);
        }

        iy += 15;
        const lw2 = linkText("View at " + (it.shop || "Ulta"), tx, iy, 9);
        doc.link(tx, iy - 9, lw2, 13, { url: it.url });

        /* price, right aligned */
        label("from $" + it.small, PAGE.M + COL, y + 28, 9, C.ink2, "right");
        label(it.fullSize + "  $" + it.full, PAGE.M + COL, y + 40, 7.5, C.ink3, "right");

        y += h;
        if (i < g.items.length - 1) hr(y - 6, C.lineSoft);
      });
      y += 14;
    }

    d.groups.forEach(group);

    /* ---------- profile ---------- */
    if (d.profile) {
      const p = d.profile;
      const sentLines = wrap(p.sentence, SANS, "normal", 10.5, COL - 48);
      const h = 58 + sentLines.length * 15 + p.families.length * 18 + 34;
      need(h);

      setFill(C.surface); setStroke(C.line); doc.setLineWidth(0.8);
      doc.roundedRect(PAGE.M, y, COL, h, 16, 16, "FD");

      let iy = y + 26;
      font(SERIF, "normal", 19); setText(C.ink);
      doc.text("What your nose likes", PAGE.M + 24, iy);
      iy += 10;

      font(SANS, "normal", 10.5); setText(C.ink2);
      sentLines.forEach(ln => { iy += 15; doc.text(ln, PAGE.M + 24, iy); });
      iy += 16;

      const barX = PAGE.M + 150, barW = COL - 150 - 24 - 42;
      p.families.forEach(f => {
        const fc = FAM[f.key] || C.accent;
        label(f.label, PAGE.M + 24, iy + 3, 8, C.ink2);
        setFill([245, 244, 248]);
        doc.roundedRect(barX, iy - 4, barW, 8, 4, 4, "F");
        const w = Math.max(8, Math.round(barW * (f.n / p.n)));
        setFill(fc);
        doc.roundedRect(barX, iy - 4, w, 8, 4, 4, "F");
        label(String(f.n), PAGE.M + COL - 24, iy + 3, 8.5, C.ink3, "right");
        iy += 18;
      });

      iy += 12;
      label("Sweetness " + p.sweet + "/100   ·   Strength " + p.weight + "/100", PAGE.M + 24, iy, 8, C.ink3);
      y += h + 26;
    }

    /* ---------- before you buy ---------- */
    const steps = d.steps || [];
    if (steps.length) {
      const wrapped = steps.map(t => wrap(t, SANS, "normal", 10.5, COL - 72));
      const h = 52 + wrapped.reduce((a, l) => a + l.length * 15 + 12, 0);
      need(h);

      setFill(C.surface); setStroke(C.line); doc.setLineWidth(0.8);
      doc.roundedRect(PAGE.M, y, COL, h, 16, 16, "FD");

      let iy = y + 26;
      font(SERIF, "normal", 19); setText(C.ink);
      doc.text("Before you buy", PAGE.M + 24, iy);
      iy += 16;

      wrapped.forEach((lines, i) => {
        iy += 14;
        setStroke(C.line); doc.setLineWidth(0.8); setFill([245, 244, 248]);
        doc.circle(PAGE.M + 31, iy - 4, 8, "FD");
        label(String(i + 1), PAGE.M + 31, iy - 1, 8, C.ink2, "center");
        font(SANS, "normal", 10.5); setText(C.ink2);
        lines.forEach((ln, j) => { doc.text(ln, PAGE.M + 48, iy + j * 15); });
        iy += lines.length * 15 - 2;
      });
      y += h;
    }

    /* ---------- footers ---------- */
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      const fy = PAGE.H - PAGE.M + 4;
      hr(fy - 14, C.line, 0.5);
      label("Kenzie's scent report   ·   " + d.date, PAGE.M, fy, 7.5, C.ink3);
      label(i + " / " + pages, PAGE.M + COL, fy, 7.5, C.ink3, "right");
    }
    return doc;
  }

  /* ------------------------------------------------------------
     Hand the file over: the native share sheet where the device
     has one (phones), a plain download everywhere else (laptops).
     ------------------------------------------------------------ */
  async function saveReportPDF(payload, filename) {
    const name = filename || "kenzie-scent-report.pdf";
    const doc = buildReportPDF(payload);
    const blob = doc.output("blob");

    try {
      if (global.navigator && navigator.canShare && typeof File !== "undefined") {
        const file = new File([blob], name, { type: "application/pdf" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: "Kenzie's scent report" });
          return "shared";
        }
      }
    } catch (err) {
      if (err && err.name === "AbortError") return "cancelled";
      /* anything else: fall through to a normal download */
    }

    doc.save(name);
    return "downloaded";
  }

  global.buildReportPDF = buildReportPDF;
  global.saveReportPDF = saveReportPDF;
})(typeof window !== "undefined" ? window : globalThis);
