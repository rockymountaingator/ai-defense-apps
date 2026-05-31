const PptxGenJS = require('pptxgenjs');

const VTG_ORANGE = 'E8950A';
const DARK_BG = '0A0A0B';
const CARD_BG = '111114';
const MUTED = '9098A8';
const WHITE = 'FFFFFF';

const QUADRANT_META = {
  'AI Vanguard': { label: 'AI Vanguard', color: '00E5FF', desc: 'High Readiness + High Defensibility. Deploy AI AND defend against disruption.' },
  'The Experimentalist': { label: 'The Experimentalist', color: 'A78BFA', desc: 'High Readiness + Low Defensibility. Strong execution on commoditizable ground.' },
  'Untapped Fortress': { label: 'Untapped Fortress', color: 'FBBF24', desc: 'Low Readiness + High Defensibility. Window to build AI capability.' },
  'Sitting Duck': { label: 'Sitting Duck', color: 'FF4444', desc: 'Low Readiness + Low Defensibility. Transformation cannot wait.' }
};

function addBrandedHeader(slide, pptx) {
  slide.addText('VELOCITY TECHNOLOGY GROUP', {
    x: 0.4, y: 0.25, w: 3, h: 0.3,
    fontSize: 9, color: VTG_ORANGE, fontFace: 'Helvetica', bold: true
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 0.4, y: 0.7, w: 12.5, h: 0,
    line: { color: '1C1C22', width: 1 }
  });
}

async function generateBoardBriefPPTX(data) {
  const pptx = new PptxGenJS();
  const { company, industry, revenue, employeeSize, name: leadName, scores } = data;
  const qm = QUADRANT_META[scores.quadrant] || QUADRANT_META['Sitting Duck'];

  pptx.author = 'Velocity Technology Group';
  pptx.title = 'AI Strategic Viability Assessment - ' + (company || 'Organization');
  pptx.company = 'Velocity Technology Group';
  pptx.defineLayout({ name: 'CUSTOM', width: 13.333, height: 7.5 });
  pptx.layout = 'CUSTOM';

  // === SLIDE 1: Title ===
  let slide = pptx.addSlide();
  slide.background = { color: DARK_BG };
  addBrandedHeader(slide, pptx);

  slide.addText('AI Strategic Viability Assessment', {
    x: 0.5, y: 1.5, w: 12, h: 1,
    fontSize: 44, color: WHITE, fontFace: 'Helvetica', bold: true
  });
  slide.addText(company || 'Your Organization', {
    x: 0.5, y: 2.8, w: 12, h: 0.6,
    fontSize: 28, color: MUTED, fontFace: 'Helvetica'
  });
  slide.addText((industry || 'Industry') + '  |  ' + (employeeSize || 'N/A') + ' employees  |  ' + (revenue || 'N/A'), {
    x: 0.5, y: 3.4, w: 12, h: 0.4,
    fontSize: 14, color: MUTED, fontFace: 'Helvetica'
  });
  slide.addText(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), {
    x: 0.5, y: 6.8, w: 4, h: 0.3,
    fontSize: 12, color: MUTED, fontFace: 'Helvetica'
  });
  slide.addText('CONFIDENTIAL', {
    x: 10, y: 6.8, w: 2.5, h: 0.3,
    fontSize: 12, color: VTG_ORANGE, fontFace: 'Helvetica', align: 'right'
  });

  // === SLIDE 2: V_AI Score ===
  slide = pptx.addSlide();
  slide.background = { color: DARK_BG };
  addBrandedHeader(slide, pptx);

  slide.addText('V_AI Composite Score', {
    x: 0.5, y: 1.2, w: 12, h: 0.5,
    fontSize: 14, color: VTG_ORANGE, fontFace: 'Helvetica'
  });
  slide.addText(String(Math.round(scores.v_ai)), {
    x: 0.5, y: 1.8, w: 3, h: 1.5,
    fontSize: 96, color: WHITE, fontFace: 'Helvetica', bold: true
  });
  slide.addText('/100', {
    x: 3.2, y: 2.8, w: 1, h: 0.5,
    fontSize: 24, color: MUTED, fontFace: 'Helvetica'
  });
  slide.addText(qm.label, {
    x: 0.5, y: 3.8, w: 6, h: 0.5,
    fontSize: 24, color: qm.color, fontFace: 'Helvetica', bold: true
  });
  slide.addText(qm.desc, {
    x: 0.5, y: 4.4, w: 8, h: 0.8,
    fontSize: 14, color: MUTED, fontFace: 'Helvetica'
  });

  // 6 dimension bars
  const dims = [
    { label: 'Operational Readiness', score: scores.readiness, color: '00E5FF' },
    { label: 'Data Moats', score: scores.dataMoat, color: 'FBBF24' },
    { label: 'Strategic Defensibility', score: scores.defensibility, color: 'A78BFA' },
    { label: 'Industry Displacement', score: scores.displacement, color: 'FB923C' },
    { label: 'Proof of Execution', score: scores.execution, color: '34D399' }
  ];

  dims.forEach((dim, i) => {
    const y = 5.5 + i * 0.38;
    slide.addText(dim.label, {
      x: 0.5, y, w: 3.5, h: 0.3,
      fontSize: 10, color: WHITE, fontFace: 'Helvetica'
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 4.2, y: y + 0.03, w: 4, h: 0.22,
      fill: { color: '1C1C22' }
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 4.2, y: y + 0.03, w: ((dim.score || 0) / 100) * 4, h: 0.22,
      fill: { color: dim.color }
    });
    slide.addText(String(Math.round(dim.score || 0)), {
      x: 8.5, y, w: 0.5, h: 0.3,
      fontSize: 10, color: dim.color, fontFace: 'Helvetica'
    });
  });

  // === SLIDE 3: Strategic Analysis ===
  slide = pptx.addSlide();
  slide.background = { color: DARK_BG };
  addBrandedHeader(slide, pptx);

  slide.addText('Board-Ready Strategic Analysis', {
    x: 0.5, y: 1.0, w: 12, h: 0.6,
    fontSize: 32, color: WHITE, fontFace: 'Helvetica', bold: true
  });

  slide.addText('"' + (company || 'Your organization') + ' is positioned as a ' + qm.label + ' with a V_AI score of ' + Math.round(scores.v_ai) + '/100."', {
    x: 0.5, y: 1.8, w: 12, h: 0.5,
    fontSize: 16, color: VTG_ORANGE, fontFace: 'Helvetica', italic: true
  });

  const weakest = dims.reduce((a, b) => (a.score || 0) < (b.score || 0) ? a : b);
  const strongest = dims.reduce((a, b) => (a.score || 0) > (b.score || 0) ? a : b);

  slide.addText('KEY FINDING', {
    x: 0.5, y: 2.5, w: 12, h: 0.3,
    fontSize: 12, color: VTG_ORANGE, fontFace: 'Helvetica', bold: true
  });
  slide.addText(weakest.label + ' (' + Math.round(weakest.score || 0) + '/100) is the weakest dimension requiring immediate attention. ' + strongest.label + ' (' + Math.round(strongest.score || 0) + '/100) is your strongest foundation to build on.', {
    x: 0.5, y: 2.9, w: 12, h: 1.2,
    fontSize: 12, color: WHITE, fontFace: 'Helvetica'
  });
  slide.addText('AI BARRIER', {
    x: 0.5, y: 4.2, w: 12, h: 0.3,
    fontSize: 12, color: VTG_ORANGE, fontFace: 'Helvetica', bold: true
  });
  slide.addText(scores.barrier || 'Not specified', {
    x: 0.5, y: 4.6, w: 12, h: 0.4,
    fontSize: 14, color: WHITE, fontFace: 'Helvetica'
  });
  slide.addText('RECOMMENDATION', {
    x: 0.5, y: 5.2, w: 12, h: 0.3,
    fontSize: 12, color: VTG_ORANGE, fontFace: 'Helvetica', bold: true
  });
  slide.addText('Schedule a strategy consultation with Velocity Technology Group to develop a detailed AI transformation roadmap.', {
    x: 0.5, y: 5.6, w: 12, h: 0.6,
    fontSize: 12, color: WHITE, fontFace: 'Helvetica'
  });

  // === SLIDE 4: Priorities ===
  slide = pptx.addSlide();
  slide.background = { color: DARK_BG };
  addBrandedHeader(slide, pptx);

  slide.addText('Strategic Priorities', {
    x: 0.5, y: 1.0, w: 12, h: 0.6,
    fontSize: 32, color: WHITE, fontFace: 'Helvetica', bold: true
  });

  const priorities = [
    { title: 'Address ' + weakest.label + ' Gap', timeframe: '0-90 days', detail: 'Your lowest-scoring dimension represents the highest-ROI improvement opportunity.' },
    { title: 'Build Data Moat Strategy', timeframe: '90-180 days', detail: 'Proprietary data is 40% of your V_AI score. Invest in feedback loops and unique data collection.' },
    { title: 'Accelerate AI Deployment', timeframe: '180-365 days', detail: 'Move from pilot to production. Proof of Execution separates contenders from pretenders.' },
    { title: 'Quarterly V_AI Reassessment', timeframe: 'Ongoing', detail: 'Track your score over time. V_AI should be a board-level KPI.' }
  ];

  priorities.forEach((p, i) => {
    const y = 1.8 + i * 1.3;
    slide.addText(p.title, {
      x: 0.5, y, w: 12, h: 0.35,
      fontSize: 16, color: WHITE, fontFace: 'Helvetica', bold: true
    });
    slide.addText(p.timeframe, {
      x: 0.5, y: y + 0.35, w: 12, h: 0.25,
      fontSize: 11, color: VTG_ORANGE, fontFace: 'Helvetica'
    });
    slide.addText(p.detail, {
      x: 0.5, y: y + 0.6, w: 12, h: 0.6,
      fontSize: 12, color: MUTED, fontFace: 'Helvetica'
    });
  });

  // === SLIDE 5: Next Steps ===
  slide = pptx.addSlide();
  slide.background = { color: DARK_BG };
  addBrandedHeader(slide, pptx);

  slide.addText('Next Steps', {
    x: 0.5, y: 1.5, w: 12, h: 0.6,
    fontSize: 32, color: WHITE, fontFace: 'Helvetica', bold: true
  });

  ['Schedule a 30-minute strategy session with VTG', 'Review AI readiness gaps with leadership team', 'Identify quick-win automation opportunities', 'Develop 90-day AI transformation roadmap'].forEach((step, i) => {
    slide.addText((i + 1) + '. ' + step, {
      x: 0.5, y: 2.5 + i * 0.5, w: 12, h: 0.45,
      fontSize: 16, color: WHITE, fontFace: 'Helvetica'
    });
  });

  slide.addShape(pptx.ShapeType.line, {
    x: 0.5, y: 5.2, w: 3, h: 0,
    line: { color: VTG_ORANGE, width: 2 }
  });

  slide.addText('Benny Carreon', {
    x: 0.5, y: 5.5, w: 6, h: 0.35,
    fontSize: 14, color: WHITE, fontFace: 'Helvetica', bold: true
  });
  slide.addText('Managing Partner, Velocity Technology Group', {
    x: 0.5, y: 5.85, w: 6, h: 0.3,
    fontSize: 12, color: MUTED, fontFace: 'Helvetica'
  });
  slide.addText('velocitytechnology.group', {
    x: 0.5, y: 6.2, w: 6, h: 0.3,
    fontSize: 12, color: VTG_ORANGE, fontFace: 'Helvetica'
  });
  slide.addText('(303) 325-5106 ext 101', {
    x: 0.5, y: 6.5, w: 6, h: 0.3,
    fontSize: 12, color: MUTED, fontFace: 'Helvetica'
  });

  return pptx.write({ outputType: 'nodebuffer' });
}

module.exports = { generateBoardBriefPPTX };
