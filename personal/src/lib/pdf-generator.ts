import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { AssessmentResults } from './types';

// ── Brand Colors ──
const BRAND_ORANGE = '#E8950A';
const DARK_NAVY = '#1A1A2E';
const DARK_TEXT = '#111827';
const BODY_TEXT = '#374151';
const MUTED_TEXT = '#6B7280';
const LIGHT_BG = '#F8F9FA';
const BORDER = '#E5E7EB';
const WHITE = '#FFFFFF';

// ── Score Colors ──
const EXPOSURE_COLOR = '#DC2626';
const EXPOSURE_BG = '#FEF2F2';
const RESILIENCE_COLOR = '#059669';
const RESILIENCE_BG = '#F0FDF4';
const READINESS_COLOR = '#7C3AED';
const READINESS_BG = '#F5F3FF';

// ── Insight Colors ──
const INSIGHT_SURPRISING = '#E8950A';
const INSIGHT_UNCOMFORTABLE = '#DC2626';
const INSIGHT_MOAT = '#059669';
const INSIGHT_BLINDSPOT = '#D97706';

// ── Layout Constants ──
const MARGIN = 50;
const PAGE_BOTTOM_PAD = 80;

// ── Profile Colors ──
const PROFILE_COLORS: Record<string, string> = {
  'The Hidden Expert': '#0891B2',
  'The Unaware Automator': '#D97706',
  'The Calculated Adapter': '#059669',
  'The Sleeping Giant': '#7C3AED',
  'The Bridge Builder': '#0891B2',
  'The Steady Hand': '#64748B',
  'The Reluctant Skeptic': '#DC2626',
  'The Dark Horse': '#7C3AED',
};

function getProfileColor(profile: string): string {
  return PROFILE_COLORS[profile] || BRAND_ORANGE;
}

// ── Score Interpretations ──
function getExposureLabel(score: number): { label: string; desc: string } {
  if (score <= 30)
    return {
      label: 'Resilient',
      desc: 'Your work has strong human elements that are difficult to automate. You operate in spaces where judgment, relationships, and creativity dominate.',
    };
  if (score <= 60)
    return {
      label: 'Augmentation Zone',
      desc: "Parts of your work follow patterns that AI can assist with. This isn't a threat — it's an opportunity to offload the repetitive and invest in what makes you uniquely valuable.",
    };
  return {
    label: 'High Opportunity for Growth',
    desc: "Significant portions of your work are pattern-based and predictable. This doesn't mean you're replaceable — it means the sooner you adapt, the bigger your advantage.",
  };
}

function getResilienceLabel(score: number): { label: string; desc: string } {
  if (score <= 30)
    return {
      label: 'Needs Development',
      desc: "Your human advantage needs investment. The skills that make you irreplaceable — judgment, relational intelligence, creative synthesis — aren't yet your primary tools.",
    };
  if (score <= 60)
    return {
      label: 'Moderate Defense',
      desc: "You have some genuinely defensible skills, but they may not be deep enough to protect you through rapid change. Now is the time to double down on what AI can't replicate.",
    };
  return {
    label: 'Strong Human Moat',
    desc: 'You have a strong human moat. Your work relies heavily on things machines struggle with — reading situations, building trust, navigating ambiguity. Protect and deepen this.',
  };
}

function getReadinessLabel(score: number): { label: string; desc: string } {
  if (score <= 30)
    return {
      label: 'Cautious Explorer',
      desc: "Change may feel threatening right now. That's honest, and it's more common than you think. The first step isn't to embrace everything — it's to stop pretending nothing is happening.",
    };
  if (score <= 60)
    return {
      label: 'Cautious Pragmatist',
      desc: "You're aware of what's coming but not yet acting on it consistently. You have the clarity most people lack. The gap between knowing and doing is where your biggest risk lives.",
    };
  return {
    label: 'AI Champion',
    desc: "You're behaviorally prepared for what's coming. Your instinct is to experiment, adapt, and figure things out. That's rare and valuable. Now channel it deliberately.",
  };
}

// ── PDF Helpers ──

function usableWidth(doc: PDFKit.PDFDocument): number {
  return doc.page.width - MARGIN * 2;
}

function addHeader(doc: PDFKit.PDFDocument): number {
  const y = 45;
  doc.rect(MARGIN, y, 4, 30).fill(BRAND_ORANGE);
  doc
    .font('Helvetica-Bold')
    .fontSize(14)
    .fillColor(DARK_TEXT)
    .text('AI Defense Project', MARGIN + 12, y + 2);
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor(MUTED_TEXT)
    .text('Personal AI Readiness Assessment', MARGIN + 12, y + 19);
  doc
    .moveTo(MARGIN, y + 38)
    .lineTo(doc.page.width - MARGIN, y + 38)
    .strokeColor(BORDER)
    .lineWidth(1)
    .stroke();
  return y + 48;
}

function addFooter(doc: PDFKit.PDFDocument): void {
  const footY = doc.page.height - 45;
  doc
    .moveTo(MARGIN, footY - 10)
    .lineTo(doc.page.width - MARGIN, footY - 10)
    .strokeColor(BORDER)
    .lineWidth(0.5)
    .stroke();
  doc
    .font('Helvetica')
    .fontSize(7)
    .fillColor(MUTED_TEXT)
    .text('AI Defense Project  |  aidefenseproject.com', MARGIN, footY);
  doc.fillColor(BRAND_ORANGE).text('CONFIDENTIAL', doc.page.width - 120, footY);
}

function addPageIfNeeded(doc: PDFKit.PDFDocument, y: number, needed: number): number {
  if (y + needed > doc.page.height - PAGE_BOTTOM_PAD) {
    addFooter(doc);
    doc.addPage();
    return addHeader(doc);
  }
  return y;
}

function drawScoreBar(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  score: number,
  color: string,
): void {
  const barHeight = 8;
  doc.roundedRect(x, y, width, barHeight, 4).fill(BORDER);
  const fillWidth = Math.max(8, (score / 100) * width);
  doc.roundedRect(x, y, fillWidth, barHeight, 4).fill(color);
}

function drawCircleBadge(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  radius: number,
  bgColor: string,
  text: string,
): void {
  doc.circle(x + radius, y + radius, radius).fill(bgColor);
  doc
    .font('Helvetica-Bold')
    .fontSize(radius * 1.1)
    .fillColor(WHITE)
    .text(text, x, y + radius * 0.3, { width: radius * 2, align: 'center' });
}

// ═══════════════════════════════════════
// MAIN GENERATOR
// ═══════════════════════════════════════
export async function generatePersonalPDF(results: AssessmentResults): Promise<Buffer> {
  // Pre-generate QR code
  const qrBuffer = await QRCode.toBuffer('https://personal.aidefenseproject.com', {
    width: 150,
    margin: 1,
    color: { dark: DARK_NAVY },
  });

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: MARGIN, bottom: 20, left: MARGIN, right: MARGIN },
        info: {
          Title: `AI Defense Assessment - ${results.profile}`,
          Author: 'AI Defense Project',
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const profileColor = getProfileColor(results.profile);
      const pw = usableWidth(doc);

      // ═══════════════════════════════════
      // PAGE 1: COVER
      // ═══════════════════════════════════

      // Full-width dark navy banner across top third
      const bannerHeight = 280;
      doc.rect(0, 0, doc.page.width, bannerHeight).fill(DARK_NAVY);

      // Subtle decorative lines in banner
      doc.save();
      doc.opacity(0.06);
      for (let i = 0; i < 6; i++) {
        doc
          .moveTo(0, 40 + i * 45)
          .lineTo(doc.page.width, 20 + i * 45)
          .strokeColor(WHITE)
          .lineWidth(1)
          .stroke();
      }
      doc.restore();

      // Small "Personal AI Readiness Assessment" label at top of banner
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#9CA3AF')
        .text('PERSONAL AI READINESS ASSESSMENT', MARGIN, 55, {
          width: pw,
          align: 'center',
          characterSpacing: 3,
        });

      // Profile name in large white text
      doc
        .font('Helvetica-Bold')
        .fontSize(36)
        .fillColor(WHITE)
        .text(results.profile, MARGIN, 110, {
          width: pw,
          align: 'center',
        });

      // Tagline in muted white
      doc
        .font('Helvetica-Oblique')
        .fontSize(14)
        .fillColor('#D1D5DB')
        .text(results.profileTagline, MARGIN + 40, 170, {
          width: pw - 80,
          align: 'center',
          lineGap: 4,
        });

      // Date in banner
      const dateStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#6B7280')
        .text(`Generated ${dateStr}`, MARGIN, 230, {
          width: pw,
          align: 'center',
        });

      // Three large score cards below the banner
      const cardTop = bannerHeight + 35;
      const cardGap = 18;
      const cardW = (pw - cardGap * 2) / 3;
      const cardH = 135;

      const scores = [
        {
          label: 'Exposure',
          value: results.exposure,
          color: EXPOSURE_COLOR,
          bgColor: EXPOSURE_BG,
        },
        {
          label: 'Resilience',
          value: results.resilience,
          color: RESILIENCE_COLOR,
          bgColor: RESILIENCE_BG,
        },
        {
          label: 'Readiness',
          value: results.readiness,
          color: READINESS_COLOR,
          bgColor: READINESS_BG,
        },
      ];

      scores.forEach((s, i) => {
        const cx = MARGIN + i * (cardW + cardGap);

        // Card background with rounded corners
        doc.roundedRect(cx, cardTop, cardW, cardH, 10).fill(s.bgColor);

        // Colored top border (3px)
        doc.rect(cx, cardTop, cardW, 3).fill(s.color);

        // Label in uppercase small text
        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor(MUTED_TEXT)
          .text(s.label.toUpperCase(), cx + 14, cardTop + 16, {
            width: cardW - 28,
            characterSpacing: 2,
          });

        // Score in HUGE font (48pt)
        doc
          .font('Helvetica-Bold')
          .fontSize(48)
          .fillColor(s.color)
          .text(String(s.value), cx + 14, cardTop + 32, {
            width: cardW - 28,
          });

        // "/ 100" small text next to score
        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor(MUTED_TEXT)
          .text('/ 100', cx + 14, cardTop + 85, {
            width: cardW - 28,
          });

        // Progress bar
        drawScoreBar(doc, cx + 14, cardTop + 110, cardW - 28, s.value, s.color);
      });

      // "out of 100" label at bottom
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(MUTED_TEXT)
        .text('All scores range from 0–100. Higher is not always better — context matters.', MARGIN, cardTop + cardH + 20, {
          width: pw,
          align: 'center',
        });

      // Subtle branding at bottom of cover
      doc
        .font('Helvetica')
        .fontSize(7)
        .fillColor('#9CA3AF')
        .text('aidefenseproject.com', MARGIN, doc.page.height - 50, {
          width: pw,
          align: 'center',
        });

      // ═══════════════════════════════════
      // PAGE 2: SCORE DEEP DIVE
      // ═══════════════════════════════════
      doc.addPage();
      let y = addHeader(doc);

      doc
        .font('Helvetica-Bold')
        .fontSize(20)
        .fillColor(DARK_TEXT)
        .text('Your Scores Explained', MARGIN, y);
      y += 32;

      // Subtitle
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor(MUTED_TEXT)
        .text(
          'Each score measures a different dimension of your AI readiness. Together, they paint a complete picture.',
          MARGIN,
          y,
          { width: pw },
        );
      y += 28;

      const scoreDetails = [
        {
          label: 'Exposure',
          score: results.exposure,
          interp: getExposureLabel(results.exposure),
          color: EXPOSURE_COLOR,
          bgColor: EXPOSURE_BG,
          icon: '⚡',
        },
        {
          label: 'Resilience',
          score: results.resilience,
          interp: getResilienceLabel(results.resilience),
          color: RESILIENCE_COLOR,
          bgColor: RESILIENCE_BG,
          icon: '🛡',
        },
        {
          label: 'Readiness',
          score: results.readiness,
          interp: getReadinessLabel(results.readiness),
          color: READINESS_COLOR,
          bgColor: READINESS_BG,
          icon: '🚀',
        },
      ];

      for (const s of scoreDetails) {
        y = addPageIfNeeded(doc, y, 150);

        // Tall card
        const cardHeight = 130;
        doc.roundedRect(MARGIN, y, pw, cardHeight, 8).fill(s.bgColor);

        // Colored left border
        doc.rect(MARGIN, y, 5, cardHeight).fill(s.color);

        // Score / 100 label
        doc
          .font('Helvetica-Bold')
          .fontSize(22)
          .fillColor(s.color)
          .text(`${s.score}`, MARGIN + 20, y + 14);

        doc
          .font('Helvetica')
          .fontSize(11)
          .fillColor(MUTED_TEXT)
          .text(`/ 100  ${s.label}`, MARGIN + 55, y + 20);

        // Interpretation label
        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .fillColor(s.color)
          .text(s.interp.label, MARGIN + 20, y + 48, { width: pw - 40 });

        // Progress bar
        drawScoreBar(doc, MARGIN + 20, y + 66, pw - 40, s.score, s.color);

        // Description
        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor(BODY_TEXT)
          .text(s.interp.desc, MARGIN + 20, y + 84, {
            width: pw - 40,
            lineGap: 3,
          });

        y += cardHeight + 18;
      }

      addFooter(doc);

      // ═══════════════════════════════════
      // PAGE 3: PROFILE + INSIGHTS
      // ═══════════════════════════════════
      doc.addPage();
      y = addHeader(doc);

      // Profile name in profile color
      doc
        .font('Helvetica-Bold')
        .fontSize(22)
        .fillColor(profileColor)
        .text(results.profile, MARGIN, y);
      y += 30;

      // Profile description card
      const descHeight = doc.heightOfString(results.profileDescription, {
        width: pw - 32,
        lineGap: 4,
      });
      const profileCardH = descHeight + 24;

      doc.roundedRect(MARGIN, y, pw, profileCardH, 8).fill(LIGHT_BG);
      doc.rect(MARGIN, y, 5, profileCardH).fill(profileColor);
      doc
        .font('Helvetica')
        .fontSize(10.5)
        .fillColor(BODY_TEXT)
        .text(results.profileDescription, MARGIN + 20, y + 12, {
          width: pw - 32,
          lineGap: 4,
        });
      y += profileCardH + 24;

      // Insights heading
      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .fillColor(DARK_TEXT)
        .text('Key Insights', MARGIN, y);
      y += 24;

      const insights = [
        {
          title: 'Surprising Insight',
          emoji: '💡',
          text: results.surprisingInsight,
          color: INSIGHT_SURPRISING,
        },
        {
          title: 'Uncomfortable Truth',
          emoji: '🔥',
          text: results.uncomfortableTruth,
          color: INSIGHT_UNCOMFORTABLE,
        },
        {
          title: 'Your Real Moat',
          emoji: '🏰',
          text: results.realMoat,
          color: INSIGHT_MOAT,
        },
        {
          title: 'Blind Spot',
          emoji: '👁',
          text: results.blindSpot,
          color: INSIGHT_BLINDSPOT,
        },
      ];

      for (const insight of insights) {
        // Estimate height
        const textH = doc.heightOfString(insight.text, {
          width: pw - 46,
          lineGap: 3,
        });
        const neededH = textH + 40;
        y = addPageIfNeeded(doc, y, neededH + 10);

        const cardH = textH + 36;

        // Card background
        doc.roundedRect(MARGIN, y, pw, cardH, 6).fill(WHITE);
        doc.rect(MARGIN, y, 5, cardH).fill(insight.color);
        doc
          .moveTo(MARGIN, y)
          .lineTo(MARGIN + pw, y)
          .strokeColor(BORDER)
          .lineWidth(0.5)
          .stroke();
        doc
          .moveTo(MARGIN, y + cardH)
          .lineTo(MARGIN + pw, y + cardH)
          .strokeColor(BORDER)
          .lineWidth(0.5)
          .stroke();

        // Title row: emoji + uppercase label
        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor(insight.color)
          .text(`${insight.emoji}  ${insight.title.toUpperCase()}`, MARGIN + 18, y + 10, {
            width: pw - 36,
            characterSpacing: 1.5,
          });

        // Insight text
        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor(BODY_TEXT)
          .text(insight.text, MARGIN + 18, y + 26, {
            width: pw - 46,
            lineGap: 3,
          });

        y += cardH + 12;
      }

      addFooter(doc);

      // ═══════════════════════════════════
      // PAGE 4: ACTION PLAN
      // ═══════════════════════════════════
      doc.addPage();
      y = addHeader(doc);

      doc
        .font('Helvetica-Bold')
        .fontSize(20)
        .fillColor(DARK_TEXT)
        .text('What to Do This Week', MARGIN, y);
      y += 32;

      // Next steps with numbered circle badges
      if (results.nextSteps && results.nextSteps.length > 0) {
        for (let i = 0; i < results.nextSteps.length; i++) {
          const step = results.nextSteps[i];
          const textH = doc.heightOfString(step, {
            width: pw - 52,
            lineGap: 3,
          });
          const neededH = textH + 20;
          y = addPageIfNeeded(doc, y, neededH + 8);

          // Circle badge with number
          const badgeRadius = 11;
          drawCircleBadge(doc, MARGIN, y + 2, badgeRadius, BRAND_ORANGE, String(i + 1));

          // Step text
          doc
            .font('Helvetica')
            .fontSize(10.5)
            .fillColor(BODY_TEXT)
            .text(step, MARGIN + 30, y + 5, {
              width: pw - 52,
              lineGap: 3,
            });

          y += textH + 20;
        }
      }

      y += 12;
      y = addPageIfNeeded(doc, y, 70);

      // Resources section
      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .fillColor(DARK_TEXT)
        .text('Recommended Resources', MARGIN, y);
      y += 24;

      if (results.resources && results.resources.length > 0) {
        for (const res of results.resources) {
          const descH = doc.heightOfString(res.description, {
            width: pw - 32,
            lineGap: 2,
          });
          const resCardH = descH + 36;
          y = addPageIfNeeded(doc, y, resCardH + 10);

          // Resource card
          doc.roundedRect(MARGIN, y, pw, resCardH, 6).fill(LIGHT_BG);
          doc.rect(MARGIN, y, pw, 3).fill(BRAND_ORANGE);

          // Type badge
          const typeColors: Record<string, string> = {
            guide: '#7C3AED',
            tool: '#0891B2',
            course: '#059669',
            service: '#D97706',
            affiliate: BRAND_ORANGE,
          };
          const typeColor = typeColors[res.type] || MUTED_TEXT;
          doc
            .font('Helvetica-Bold')
            .fontSize(7)
            .fillColor(typeColor)
            .text(res.type.toUpperCase(), MARGIN + 14, y + 10, {
              width: pw - 28,
              characterSpacing: 1.5,
            });

          doc
            .font('Helvetica-Bold')
            .fontSize(10)
            .fillColor(DARK_TEXT)
            .text(res.title, MARGIN + 14, y + 22, {
              width: pw - 28,
            });

          doc
            .font('Helvetica')
            .fontSize(9)
            .fillColor(MUTED_TEXT)
            .text(res.description, MARGIN + 14, y + 36, {
              width: pw - 32,
              lineGap: 2,
            });

          y += resCardH + 10;
        }
      }

      addFooter(doc);

      // ═══════════════════════════════════
      // PAGE 5: A NOTE FROM BENNY
      // ═══════════════════════════════════
      doc.addPage();

      // Full-width navy banner
      const noteBannerH = 120;
      doc.rect(0, 0, doc.page.width, noteBannerH).fill(DARK_NAVY);

      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#9CA3AF')
        .text('A PERSONAL NOTE', MARGIN, 35, {
          width: pw,
          align: 'center',
          characterSpacing: 3,
        });

      doc
        .font('Helvetica-Bold')
        .fontSize(26)
        .fillColor(WHITE)
        .text('From Benny', MARGIN, 55, {
          width: pw,
          align: 'center',
        });

      doc
        .font('Helvetica-Oblique')
        .fontSize(11)
        .fillColor('#D1D5DB')
        .text('Founder, AI Defense Project', MARGIN, 88, {
          width: pw,
          align: 'center',
        });

      y = noteBannerH + 30;

      const noteParagraphs = [
        "Hey \u2014 thanks for taking this seriously. Most people skim an assessment like this, see a score, and move on. You're still reading, which already puts you ahead.",
        "Here's the honest truth: this isn't a scientific diagnosis. It's a mirror. The questions are designed to surface patterns in how you actually work \u2014 not how you think you work. The frameworks behind it (OECD, McKinsey, Stanford) are real, but your results are directional, not definitive.",
        "Here's what I'd do with this report:",
      ];

      for (const para of noteParagraphs) {
        const textH = doc.heightOfString(para, { width: pw - 40, lineGap: 4 });
        y = addPageIfNeeded(doc, y, textH + 20);
        doc
          .font('Helvetica')
          .fontSize(11)
          .fillColor(BODY_TEXT)
          .text(para, MARGIN + 20, y, { width: pw - 40, lineGap: 4 });
        y += textH + 16;
      }

      // Bullet points
      const bullets = [
        "Pick the one insight that stings a little. That's the real one.",
        "Ignore the urge to fix everything at once. Pick one thing for this week.",
        "Come back in 30 days and retake it. See what shifted.",
      ];

      for (const bullet of bullets) {
        const textH = doc.heightOfString(bullet, { width: pw - 60, lineGap: 3 });
        y = addPageIfNeeded(doc, y, textH + 10);
        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .fillColor(BRAND_ORANGE)
          .text('\u2022', MARGIN + 24, y);
        doc
          .font('Helvetica')
          .fontSize(11)
          .fillColor(BODY_TEXT)
          .text(bullet, MARGIN + 40, y, { width: pw - 60, lineGap: 3 });
        y += textH + 10;
      }

      y += 8;
      const closing = "If you want to talk through your results \u2014 whether for your own career or your team \u2014 reach out. I read every message.";
      const closingH = doc.heightOfString(closing, { width: pw - 40, lineGap: 4 });
      y = addPageIfNeeded(doc, y, closingH + 30);
      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor(BODY_TEXT)
        .text(closing, MARGIN + 20, y, { width: pw - 40, lineGap: 4 });
      y += closingH + 16;

      // Signature
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .fillColor(DARK_TEXT)
        .text('\u2014 Benny Carreon', MARGIN + 20, y);
      y += 18;
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(MUTED_TEXT)
        .text('Founder, AI Defense Project', MARGIN + 20, y);

      addFooter(doc);

      // ═══════════════════════════════════
      // PAGE 6: SHARE + CTA
      // ═══════════════════════════════════
      doc.addPage();
      y = addHeader(doc);

      // Big heading
      doc
        .font('Helvetica-Bold')
        .fontSize(22)
        .fillColor(DARK_TEXT)
        .text('Know someone who should take this?', MARGIN, y, {
          width: pw,
        });
      y += 34;

      // Subtext
      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor(BODY_TEXT)
        .text(
          'Share your results or send them the link. It takes 10 minutes and could change how they think about their career.',
          MARGIN,
          y,
          { width: pw, lineGap: 4 },
        );
      y += 50;

      // QR Code centered
      const qrSize = 130;
      const qrX = MARGIN + (pw - qrSize) / 2;
      doc.image(qrBuffer, qrX, y, { width: qrSize });
      y += qrSize + 12;

      // Clickable URL text
      const urlText = 'personal.aidefenseproject.com';
      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor(BRAND_ORANGE)
        .text(urlText, MARGIN, y, {
          width: pw,
          align: 'center',
          underline: true,
        });

      // Make the URL text clickable
      const urlY = y;
      const urlTextWidth = doc.widthOfString(urlText);
      const urlX = MARGIN + (pw - urlTextWidth) / 2;
      doc.link(urlX, urlY, urlTextWidth, 16, 'https://personal.aidefenseproject.com');
      y += 30;

      // Shareable quote box
      y = addPageIfNeeded(doc, y, 100);
      const quoteCardH = 85;
      doc.roundedRect(MARGIN, y, pw, quoteCardH, 8).fill(LIGHT_BG);
      doc.rect(MARGIN, y, 5, quoteCardH).fill(BRAND_ORANGE);

      doc
        .font('Helvetica-Oblique')
        .fontSize(11)
        .fillColor(BODY_TEXT)
        .text(
          '"I just found out my AI readiness profile. Take the free assessment →"',
          MARGIN + 20,
          y + 14,
          { width: pw - 40, lineGap: 3 },
        );

      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(BRAND_ORANGE)
        .text('personal.aidefenseproject.com', MARGIN + 20, y + 56, {
          width: pw - 40,
        });
      y += quoteCardH + 24;

      // About / methodology section
      y = addPageIfNeeded(doc, y, 120);

      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor(DARK_TEXT)
        .text('About This Assessment', MARGIN, y, { width: pw });
      y += 20;

      doc
        .font('Helvetica')
        .fontSize(9.5)
        .fillColor(BODY_TEXT)
        .text(
          'This assessment uses behavioral analysis — not self-reporting — to evaluate where you stand with AI. It cross-references what you say you\'d do with what your answers reveal about your actual work patterns.',
          MARGIN,
          y,
          { width: pw, lineGap: 3 },
        );
      y += 48;

      doc
        .font('Helvetica')
        .fontSize(9.5)
        .fillColor(BODY_TEXT)
        .text(
          'The scoring methodology draws from the OECD Task-Based Approach to automation risk, McKinsey\'s Activity Model for work decomposition, Carol Dweck\'s Growth Mindset framework (Stanford), the Technology Acceptance Model by Davis, and Prosci\'s ADKAR change management model.',
          MARGIN,
          y,
          { width: pw, lineGap: 3 },
        );
      y += 55;

      // Disclaimer
      y = addPageIfNeeded(doc, y, 40);
      doc
        .moveTo(MARGIN, y)
        .lineTo(MARGIN + pw, y)
        .strokeColor(BORDER)
        .lineWidth(0.5)
        .stroke();
      y += 10;

      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor(MUTED_TEXT)
        .text(
          "This assessment is for informational purposes and personal reflection. It's not a guarantee of career outcomes, a scientific study, or a replacement for professional career advice. It's a practical tool to help you think about where you stand with AI \u2014 and what to do next.",
          MARGIN,
          y,
          { width: pw, lineGap: 2 },
        );

      addFooter(doc);
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
