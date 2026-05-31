const PDFDocument = require('pdfkit');

const VTG_ORANGE = '#E8950A';
const VTG_ORANGE_LIGHT = '#F5A623';
const DARK_TEXT = '#1A1A2E';
const BODY_TEXT = '#374151';
const MUTED_TEXT = '#6B7280';
const LIGHT_BG = '#F8F9FA';
const BORDER = '#E5E7EB';
const HEADING = '#111827';

function addHeader(doc, yStart) {
  const baseY = yStart || 50;
  doc.font('Helvetica-Bold')
     .fillColor(VTG_ORANGE)
     .fontSize(11)
     .text('VELOCITY TECHNOLOGY GROUP', 50, baseY);
  doc.font('Helvetica')
     .fillColor(MUTED_TEXT)
     .fontSize(8)
     .text('AI Strategic Viability Assessment', 50, baseY + 14, { align: 'left' });
  doc.moveTo(50, baseY + 30)
     .lineTo(doc.page.width - 50, baseY + 30)
     .strokeColor(BORDER)
     .lineWidth(1)
     .stroke();
  return baseY + 38;
}

function addFooter(doc) {
  const footY = doc.page.height - 50;
  doc.moveTo(50, footY - 12)
     .lineTo(doc.page.width - 50, footY - 12)
     .strokeColor(BORDER)
     .lineWidth(0.5)
     .stroke();
  doc.fillColor(MUTED_TEXT)
     .fontSize(7)
     .text('velocitytechnology.group  |  (303) 325-5106 ext 101', 50, footY)
     .fillColor(VTG_ORANGE)
     .text('CONFIDENTIAL', doc.page.width - 120, footY);
}

function addNewPageIfNeeded(doc, curY, needed) {
  if (curY + needed > doc.page.height - 100) {
    addFooter(doc);
    doc.addPage();
    return addHeader(doc, 45);
  }
  return curY;
}

const QUADRANT_META = {
  'AI Vanguard': { color: '#0891B2', desc: 'High Readiness + High Defensibility. Deploy AI AND defend against disruption. Priority: accelerate and widen the competitive gap.' },
  'The Experimentalist': { color: '#7C3AED', desc: 'High Readiness + Low Defensibility. Strong AI execution built on commoditizable ground. Urgent need to build structural moats.' },
  'Untapped Fortress': { color: '#D97706', desc: 'Low Readiness + High Defensibility. Structural defenses provide a window to build AI capability. This window will close.' },
  'Sitting Duck': { color: '#DC2626', desc: 'Low Readiness + Low Defensibility. Board-level transformation cannot wait for the next planning cycle.' }
};

async function generateAssessmentPDF(data) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 50, bottom: 20, left: 50, right: 50 },
        info: {
          Title: 'AI Strategic Viability Assessment - ' + (data.company || 'Organization'),
          Author: 'Velocity Technology Group'
        }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const { company, industry, revenue, employeeSize, name: leadName, scores } = data;
      const qm = QUADRANT_META[scores.quadrant] || QUADRANT_META['Sitting Duck'];

      // === PAGE 1: Scorecard ===
      let y = addHeader(doc, 45);

      doc.fillColor(HEADING)
         .font('Helvetica-Bold')
         .fontSize(26)
         .text(company || 'Your Organization', 50, y + 5)
         .font('Helvetica')
         .fontSize(12)
         .fillColor(MUTED_TEXT)
         .text((industry || 'N/A') + '  |  ' + (employeeSize || 'N/A') + ' employees  |  ' + (revenue || 'N/A'), 50, y + 36);

      doc.moveTo(50, y + 60).lineTo(doc.page.width - 50, y + 60).strokeColor(BORDER).lineWidth(0.5).stroke();

      // V_AI score box
      const scoreBoxY = y + 75;
      doc.rect(50, scoreBoxY, 220, 90).fill(LIGHT_BG);
      doc.fillColor(MUTED_TEXT).fontSize(9).text('V_AI COMPOSITE SCORE', 65, scoreBoxY + 10);
      doc.fillColor(HEADING).font('Helvetica-Bold').fontSize(52)
         .text(String(scores.v_ai), 65, scoreBoxY + 24)
         .font('Helvetica').fontSize(16).fillColor(MUTED_TEXT).text('/100', 65 + String(scores.v_ai).length * 28, scoreBoxY + 56);

      // Quadrant box
      doc.rect(290, scoreBoxY, 260, 90).fill(LIGHT_BG);
      doc.fillColor(qm.color).font('Helvetica-Bold').fontSize(16)
         .text(scores.quadrant, 305, scoreBoxY + 10)
         .font('Helvetica').fillColor(BODY_TEXT).fontSize(9)
         .text(qm.desc, 305, scoreBoxY + 30, { width: 230, lineSpacing: 3 });

      // Dimension bars - now 6 dimensions
      const dimY = scoreBoxY + 105;
      doc.fillColor(HEADING).font('Helvetica-Bold').fontSize(11).text('DIMENSION SCORES', 50, dimY).font('Helvetica');

      const dims = [
        { label: 'Operational Readiness', score: scores.readiness, color: '#0891B2' },
        { label: 'Data Moats', score: scores.dataMoat, color: '#D97706' },
        { label: 'Strategic Defensibility', score: scores.defensibility, color: '#7C3AED' },
        { label: 'Industry Displacement', score: scores.displacement, color: '#EA580C' },
        { label: 'Proof of Execution', score: scores.execution, color: '#34D399' },
      ];

      dims.forEach((dim, i) => {
        const dy = dimY + 25 + i * 28;
        doc.fillColor(BODY_TEXT).fontSize(10).text(dim.label, 50, dy);
        doc.rect(250, dy + 2, 200, 10).fill('#E5E7EB');
        const scoreVal = typeof dim.score === 'number' ? dim.score : 0;
        doc.rect(250, dy + 2, Math.max(scoreVal * 2, 4), 10).fill(dim.color);
        doc.fillColor(dim.color).font('Helvetica-Bold').fontSize(10)
           .text(String(Math.round(scoreVal)), 460, dy).font('Helvetica');
      });

      // Barrier display
      const barrierY = dimY + 25 + dims.length * 28 + 10;
      doc.fillColor(HEADING).font('Helvetica-Bold').fontSize(10).text('PRIMARY AI BARRIER', 50, barrierY).font('Helvetica');
      doc.fillColor(BODY_TEXT).fontSize(10).text(scores.barrier || 'Not specified', 200, barrierY);

      addFooter(doc);

      // === PAGE 2: AI Maturity Matrix ===
      doc.addPage();
      y = addHeader(doc, 45);
      doc.fillColor(HEADING).font('Helvetica-Bold').fontSize(18).text('AI Maturity Matrix', 50, y).font('Helvetica');

      const matrixY = y + 25;
      const boxW = 240, boxH = 120;
      const qX = 50;

      // Top-right: Vanguard
      doc.rect(qX + boxW, matrixY, boxW, boxH).fill('#E0F2FE');
      doc.fillColor('#0891B2').font('Helvetica-Bold').fontSize(11).text('VANGUARD', qX + boxW + 15, matrixY + 15);
      doc.font('Helvetica').fillColor(BODY_TEXT).fontSize(9)
         .text('High Readiness', qX + boxW + 15, matrixY + 32)
         .text('High Defensibility', qX + boxW + 15, matrixY + 44);
      doc.fontSize(8).fillColor(MUTED_TEXT).text('Deploy AI AND defend', qX + boxW + 15, matrixY + 65, { width: boxW - 30 });

      // Top-left: Experimentalist
      doc.rect(qX, matrixY, boxW, boxH).fill('#EDE9FE');
      doc.fillColor('#7C3AED').font('Helvetica-Bold').fontSize(11).text('EXPERIMENTALIST', qX + 15, matrixY + 15);
      doc.font('Helvetica').fillColor(BODY_TEXT).fontSize(9).text('High Readiness', qX + 15, matrixY + 32).text('Low Defensibility', qX + 15, matrixY + 44);
      doc.fontSize(8).fillColor(MUTED_TEXT).text('Build structural moats', qX + 15, matrixY + 65, { width: boxW - 30 });

      // Bottom-left: Sitting Duck
      doc.rect(qX, matrixY + boxH, boxW, boxH).fill('#FEE2E2');
      doc.fillColor('#DC2626').font('Helvetica-Bold').fontSize(11).text('SITTING DUCK', qX + 15, matrixY + boxH + 15);
      doc.font('Helvetica').fillColor(BODY_TEXT).fontSize(9).text('Low Readiness', qX + 15, matrixY + boxH + 32).text('Low Defensibility', qX + 15, matrixY + boxH + 44);
      doc.fontSize(8).fillColor(MUTED_TEXT).text('Board-level transformation', qX + 15, matrixY + boxH + 65, { width: boxW - 30 });

      // Bottom-right: Fortress
      doc.rect(qX + boxW, matrixY + boxH, boxW, boxH).fill('#FEF3C7');
      doc.fillColor('#D97706').font('Helvetica-Bold').fontSize(11).text('UNTAPPED FORTRESS', qX + boxW + 15, matrixY + boxH + 15);
      doc.font('Helvetica').fillColor(BODY_TEXT).fontSize(9).text('Low Readiness', qX + boxW + 15, matrixY + boxH + 32).text('High Defensibility', qX + boxW + 15, matrixY + boxH + 44);
      doc.fontSize(8).fillColor(MUTED_TEXT).text('Window to build AI', qX + boxW + 15, matrixY + boxH + 65, { width: boxW - 30 });

      // Plot position
      const sReadiness = scores.readiness || 50;
      const sDefense = scores.defensibility || 50;
      const plotX = qX + 20 + (sReadiness / 100) * (boxW * 2 - 40);
      const plotY = matrixY + boxH + 20 + ((100 - sDefense) / 100) * (boxH - 40);
      doc.fillColor(VTG_ORANGE).fontSize(18).text('\u2605', plotX - 7, plotY - 7);
      doc.fillColor(HEADING).fontSize(10).text('YOU', plotX - 12, plotY + 10);

      // Axis labels
      doc.fillColor(MUTED_TEXT).fontSize(8).text('LOW READINESS', qX, matrixY - 10);
      doc.text('HIGH READINESS', qX + boxW * 2 - 55, matrixY - 10);

      // Your Position
      const posY = matrixY + boxH * 2 + 40;
      doc.fillColor(HEADING).font('Helvetica-Bold').fontSize(12).text('Your Position: ', 50, posY);
      doc.fillColor(qm.color).text(scores.quadrant, 145, posY);
      doc.fillColor(BODY_TEXT).font('Helvetica').fontSize(10)
         .text('Readiness: ' + Math.round(sReadiness) + ' | Defensibility: ' + Math.round(sDefense), 50, posY + 18);

      addFooter(doc);

      // === PAGE 3: Strategic Radar ===
      doc.addPage();
      y = addHeader(doc, 45);
      doc.fillColor(HEADING).font('Helvetica-Bold').fontSize(18).text('Strategic Radar', 50, y).font('Helvetica');

      const radarY = y + 30;
      const radarData = [
        { axis: 'Readiness', value: scores.readiness || 0 },
        { axis: 'Data Moat', value: scores.dataMoat || 0 },
        { axis: 'Defense', value: scores.defensibility || 0 },
        { axis: 'Displacement', value: scores.displacement || 0 },
        { axis: 'Execution', value: scores.execution || 0 }
      ];

      const centerX = 300, centerY = radarY + 100, maxR = 90;

      for (let r = 20; r <= 100; r += 20) {
        doc.circle(centerX, centerY, (r / 100) * maxR).strokeColor('#E5E7EB').lineWidth(0.5).stroke();
      }

      const n = radarData.length;
      radarData.forEach((d, i) => {
        const angle = (i * 2 * Math.PI / n) - Math.PI / 2;
        const x = centerX + Math.cos(angle) * maxR;
        const yP = centerY + Math.sin(angle) * maxR;
        doc.moveTo(centerX, centerY).lineTo(x, yP).strokeColor('#E5E7EB').lineWidth(0.5).stroke();
        const lx = centerX + Math.cos(angle) * (maxR + 15);
        const ly = centerY + Math.sin(angle) * (maxR + 15);
        doc.fillColor(BODY_TEXT).fontSize(9).text(d.axis, lx - 25, ly - 5);
      });

      let firstPoint = null;
      radarData.forEach((d, i) => {
        const angle = (i * 2 * Math.PI / n) - Math.PI / 2;
        const radius = ((d.value || 0) / 100) * maxR;
        const x = centerX + Math.cos(angle) * radius;
        const yP = centerY + Math.sin(angle) * radius;
        if (i === 0) { firstPoint = { x, y: yP }; doc.moveTo(x, yP); }
        else { doc.lineTo(x, yP); }
      });
      if (firstPoint) doc.lineTo(firstPoint.x, firstPoint.y);
      doc.fillColor(VTG_ORANGE).fillOpacity(0.15).fill().strokeColor(VTG_ORANGE).lineWidth(2).stroke().fillOpacity(1);

      // Score list
      const radarScoresY = centerY - 60;
      doc.fillColor(HEADING).font('Helvetica-Bold').fontSize(11).text('Dimension Scores:', 480, radarScoresY).font('Helvetica');
      radarData.forEach((d) => {
        const scoreY = radarScoresY + 18 + radarData.indexOf(d) * 20;
        const val = Math.round(d.value || 0);
        doc.fillColor(val >= 65 ? '#22C55E' : val >= 35 ? '#FBBF24' : '#DC2626').fontSize(12).text('\u2022', 480, scoreY);
        doc.fillColor(BODY_TEXT).fontSize(10).text(d.axis + ': ' + val + '/100', 495, scoreY);
      });

      addFooter(doc);

      // === PAGE 4: Gap Analysis ===
      doc.addPage();
      y = addHeader(doc, 45);
      doc.fillColor(HEADING).font('Helvetica-Bold').fontSize(18).text('Gap Analysis', 50, y).font('Helvetica');
      doc.fillColor(MUTED_TEXT).fontSize(9).text('Strategic pillar assessment', 50, y + 20);

      const pillars = [
        { key: 'Operational Readiness', score: scores.readiness || 0 },
        { key: 'Data Moats', score: scores.dataMoat || 0 },
        { key: 'Strategic Defensibility', score: scores.defensibility || 0 },
        { key: 'Industry Displacement', score: scores.displacement || 0 },
        { key: 'Proof of Execution', score: scores.execution || 0 }
      ];

      let curY = y + 50;
      pillars.forEach((p, i) => {
        const color = p.score >= 65 ? '#22C55E' : p.score >= 35 ? '#FBBF24' : '#DC2626';
        const status = p.score >= 65 ? 'Strength' : p.score >= 35 ? 'Gap' : 'Critical';
        doc.rect(50, curY, 500, 40).fill(i % 2 === 0 ? LIGHT_BG : '#FFFFFF');
        doc.circle(70, curY + 20, 8).fill(color);
        doc.fillColor(HEADING).font('Helvetica-Bold').fontSize(11).text(p.key, 90, curY + 8);
        doc.fillColor(BODY_TEXT).font('Helvetica-Bold').fontSize(14).text(String(Math.round(p.score)), 90, curY + 22);
        doc.font('Helvetica').fillColor(MUTED_TEXT).fontSize(9).text('/100', 115, curY + 26);
        doc.fillColor(color).fontSize(9).text(status, 470, curY + 14);
        curY += 48;
      });

      // Legend
      curY += 10;
      doc.fillColor(HEADING).font('Helvetica-Bold').fontSize(10).text('Legend:', 50, curY).font('Helvetica');
      Object.entries({ '\u25CF Strength (65+)': '#22C55E', '\u25CF Gap (35-64)': '#FBBF24', '\u25CF Critical (<35)': '#DC2626' }).forEach(([label, color], idx) => {
        doc.fillColor(color).fontSize(9).text(label, 50 + idx * 170, curY + 16);
      });

      addFooter(doc);

      // === PAGE 5: V_AI Context ===
      doc.addPage();
      y = addHeader(doc, 45);
      doc.fillColor(HEADING).font('Helvetica-Bold').fontSize(18).text('About Your V_AI Score', 50, y).font('Helvetica');

      curY = y + 30;
      doc.fillColor(HEADING).font('Helvetica-Bold').fontSize(11).text('What This Measures', 50, curY).font('Helvetica');
      curY += 18;
      doc.fillColor(BODY_TEXT).fontSize(10).text(
        'The V_AI score is your organization\'s composite measure of strategic AI fitness \u2014 not just whether you use AI, but whether your structural position enables you to compete and survive as AI transforms your industry.',
        50, curY, { width: 500, lineSpacing: 4 });
      curY += 60;

      doc.fillColor(HEADING).font('Helvetica-Bold').fontSize(11).text('Formula', 50, curY).font('Helvetica');
      curY += 18;
      doc.fillColor(VTG_ORANGE).fontSize(11).text('V_AI = (Data Moat \u00D7 40%) + (Readiness \u00D7 30%) + (Defensibility \u00D7 30%)', 50, curY);
      curY += 30;

      doc.fillColor(HEADING).font('Helvetica-Bold').fontSize(11).text('Score Benchmarks', 50, curY).font('Helvetica');
      curY += 20;
      [{ range: '80-100', label: 'AI Vanguard', desc: 'Positioned to widen advantage' },
       { range: '60-79', label: 'Capable', desc: 'Solid foundation with identifiable gaps' },
       { range: '40-59', label: 'Vulnerable', desc: 'Structural weaknesses requiring urgent action' },
       { range: '0-39', label: 'Critical', desc: 'Existential exposure without transformation' }
      ].forEach((b) => {
        doc.rect(50, curY, 500, 30).fill(LIGHT_BG);
        doc.fillColor(VTG_ORANGE).font('Helvetica-Bold').fontSize(10).text(b.range, 60, curY + 8);
        doc.fillColor(HEADING).fontSize(10).text(b.label, 110, curY + 8);
        doc.fillColor(BODY_TEXT).fontSize(9).text(b.desc, 110, curY + 20, { width: 400 });
        curY += 36;
      });

      addFooter(doc);

      // === PAGE 6-7: Dimension Deep Dives ===
      doc.addPage();
      y = addHeader(doc, 45);
      doc.fillColor(HEADING).font('Helvetica-Bold').fontSize(18).text('Dimension Analysis', 50, y).font('Helvetica');

      const dimensionDetails = [
        { key: 'readiness', title: 'Layer I: Operational Readiness', subtitle: 'Can your organization execute AI initiatives today?', color: '#0891B2', score: scores.readiness,
          body: 'Measures your capacity to deploy, operate, and scale AI systems. Covers data infrastructure elasticity, workflow automation depth, leadership AI literacy, talent distribution, and executive accountability.',
          action: 'Low readiness is addressable in 12-24 months with capital commitment. Infrastructure can be built \u2014 moats cannot.' },
        { key: 'dataMoat', title: 'Layer II: Data Moats', subtitle: 'Do you hold data competitors cannot replicate?', color: '#D97706', score: scores.dataMoat,
          body: 'Weighted at 40% of V_AI because proprietary data is the single most durable competitive advantage in an AI-first world. Generic models do generic things. What separates defensible businesses is data that makes their AI smarter with every interaction.',
          action: 'If Data Moat is your lowest score, this is your most critical strategic gap. Data strategy becomes survival strategy.' },
        { key: 'defensibility', title: 'Layer III: Strategic Defensibility', subtitle: 'Can a startup eliminate your niche?', color: '#7C3AED', score: scores.defensibility,
          body: 'Measures structural resistance to AI-native disruption. Three tests: Commoditization Vulnerability (value at near-zero AI cost), Workflow Integration Depth (replacement pain), and the Thin Wrapper Test (if OpenAI ships your feature, do you exist?).',
          action: 'A low defensibility score is a strategic emergency. Identify your non-AI-replicable moat and double down.' },
        { key: 'displacement', title: 'Layer IV: Industry Displacement', subtitle: 'Is your industry being restructured?', color: '#EA580C', score: scores.displacement,
          body: 'Your position within broader sector restructuring. Partly about forces outside your control \u2014 value chain position and capital efficiency relative to AI-native competitors.',
          action: 'Cannot be solved internally. Requires strategic repositioning.' },
        { key: 'execution', title: 'Layer V: Proof of Execution', subtitle: 'What have you actually shipped?', color: '#34D399', score: scores.execution,
          body: 'Behavioral evidence separating talkers from doers. Measures what AI tools are in production (not piloted) and recency of AI-powered feature deployments.',
          action: 'The gap between "we\'re exploring AI" and "we ship AI weekly" is where competitive advantage lives.' }
      ];

      curY = y + 25;
      dimensionDetails.forEach((dim) => {
        curY = addNewPageIfNeeded(doc, curY, 120);
        doc.fillColor(dim.color).font('Helvetica-Bold').fontSize(12).text(dim.title, 50, curY).font('Helvetica');
        curY += 16;
        doc.fillColor(MUTED_TEXT).fontSize(9).text(dim.subtitle, 50, curY, { width: 500 });
        curY += 18;
        const scoreLabel = dim.score !== undefined ? Math.round(dim.score) + '/100' : 'N/A';
        doc.fillColor(dim.color).fontSize(11).text('Score: ' + scoreLabel, 50, curY);
        curY += 16;
        doc.fillColor(BODY_TEXT).fontSize(9).text(dim.body, 50, curY, { width: 500, lineSpacing: 3 });
        curY += 60;
        doc.fillColor(HEADING).font('Helvetica-Bold').fontSize(10).text('Strategic Action', 50, curY).font('Helvetica');
        curY += 14;
        doc.fillColor(BODY_TEXT).fontSize(9).text(dim.action, 50, curY, { width: 500, lineSpacing: 3 });
        curY += 40;
      });

      addFooter(doc);

      // === PAGE 8: Board-Ready Strategic Analysis ===
      doc.addPage();
      y = addHeader(doc, 45);
      doc.fillColor(HEADING).font('Helvetica-Bold').fontSize(20).text('Board-Ready Strategic Analysis', 50, y).font('Helvetica');

      curY = y + 35;

      // Headline
      const vaiRound = Math.round(scores.v_ai);
      doc.rect(50, curY, doc.page.width - 100, 40).fill('#FFFBEB');
      doc.fillColor(HEADING).font('Helvetica-Bold').fontSize(13)
         .text(company + ' scores ' + vaiRound + '/100 on the V_AI Index, placing it in the "' + scores.quadrant + '" quadrant.', 60, curY + 8, { width: doc.page.width - 120 })
         .font('Helvetica');
      curY += 56;

      // Dimension analysis
      doc.fillColor(HEADING).font('Helvetica-Bold').fontSize(10).text('DIMENSION ANALYSIS', 50, curY).font('Helvetica');
      curY += 20;

      const allDims = [
        { name: 'Operational Readiness', val: scores.readiness, color: '#0891B2' },
        { name: 'Data Moats', val: scores.dataMoat, color: '#D97706' },
        { name: 'Strategic Defensibility', val: scores.defensibility, color: '#7C3AED' },
        { name: 'Industry Displacement', val: scores.displacement, color: '#EA580C' },
        { name: 'Proof of Execution', val: scores.execution, color: '#34D399' },
      ];

      allDims.forEach((dim) => {
        curY = addNewPageIfNeeded(doc, curY, 50);
        const val = Math.round(dim.val || 0);
        let desc;
        if (val >= 65) desc = 'Strength \u2014 competitive advantage to protect and leverage.';
        else if (val >= 35) desc = 'Gap \u2014 targeted investment can yield significant returns within 6-12 months.';
        else desc = 'Critical \u2014 vulnerability requiring immediate strategic attention.';
        doc.fillColor(dim.color).font('Helvetica-Bold').fontSize(10).text(dim.name + ': ' + val + '/100', 50, curY).font('Helvetica');
        curY += 14;
        doc.fillColor(BODY_TEXT).fontSize(9).text(desc, 50, curY, { width: 500, lineSpacing: 3 });
        curY += 30;
      });

      // Next Steps
      curY = addNewPageIfNeeded(doc, curY, 100);
      doc.moveTo(50, curY + 5).lineTo(200, curY + 5).strokeColor(VTG_ORANGE).lineWidth(2).stroke();
      curY += 20;
      doc.fillColor(HEADING).font('Helvetica-Bold').fontSize(11).text('RECOMMENDED NEXT STEPS', 50, curY).font('Helvetica');
      curY += 20;

      const weakest = allDims.reduce((a, b) => (a.val || 0) < (b.val || 0) ? a : b);
      const nextSteps = [
        'Schedule a 30-minute strategy consultation with Velocity Technology Group',
        'Share these results with your leadership team to align on AI investment priorities',
        'Focus initial efforts on ' + weakest.name + ' \u2014 your lowest-scoring dimension',
        'Contact: velocitytechnology.group or (303) 325-5106 ext 101'
      ];
      nextSteps.forEach((step) => {
        curY = addNewPageIfNeeded(doc, curY, 25);
        doc.fillColor(BODY_TEXT).fontSize(10).text('\u2022 ' + step, 50, curY, { width: 500 });
        curY += 20;
      });

      addFooter(doc);
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateAssessmentPDF };
