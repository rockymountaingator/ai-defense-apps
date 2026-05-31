import { NextRequest, NextResponse } from 'next/server';
import { pool, isConfigured } from '@/lib/supabase';
import { addContactToVbout } from '@/lib/vbout';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pathwayTitle, results, affiliate_code, promo_code, email } = body;

    if (isConfigured() && email) {
      const query = `
        INSERT INTO personal_assessments
          (email, pathway_title, jvs_score, ars_score, results, affiliate_code, promo_code)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `;
      const values = [
        email || null,
        pathwayTitle || null,
        results?.exposure ?? null,
        results?.resilience ?? null,
        JSON.stringify(results || null),
        affiliate_code || null,
        promo_code || null,
      ];

      const result = await pool!.query(query, values);

      if (result.rowCount === 0) {
        console.error('PostgreSQL insert: no rows inserted');
        return NextResponse.json(
          { success: false, message: 'Failed to save results' },
          { status: 500 },
        );
      }

      // Push to vBout CRM (fire-and-forget, don't block response)
      const vboutFields = {
        exposure: results?.exposure ?? null,
        resilience: results?.resilience ?? null,
        readiness: results?.readiness ?? null,
        profile: pathwayTitle || null,
      };

      // Log the vBout push
      console.log('[Personal] Pushing to vBout:', { email, profile: pathwayTitle, scores: vboutFields });

      addContactToVbout(email, vboutFields).catch((err: Error) => {
        console.error('[Vbout-Personal] Fire-and-forget error:', err.message);
      });

      return NextResponse.json({
        success: true,
        message: 'Results saved successfully',
      });
    }

    // Fallback when database is not configured or no email
    console.log('Assessment save (no DB/email):', {
      pathwayTitle,
      affiliate_code: affiliate_code || null,
      promo_code: promo_code || null,
      hasEmail: !!email,
    });

    return NextResponse.json({
      success: true,
      message: 'Results saved locally (no database/email configured)',
    });
  } catch (error) {
    console.error('Error saving assessment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save results' },
      { status: 500 },
    );
  }
}