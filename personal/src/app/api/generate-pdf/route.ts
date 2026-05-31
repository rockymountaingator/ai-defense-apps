import { NextRequest, NextResponse } from 'next/server';
import { AssessmentResults } from '@/lib/types';
import { generatePersonalPDF } from '@/lib/pdf-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const results: AssessmentResults = body.results;

    if (!results || !results.profile) {
      return NextResponse.json(
        { success: false, message: 'Invalid assessment results' },
        { status: 400 },
      );
    }

    const pdfBuffer = await generatePersonalPDF(results);

    const filename = `ai-defense-${results.profile.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.length),
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate PDF' },
      { status: 500 },
    );
  }
}
