import { supabase } from '../lib/supabase'

export async function runAiMatching(
  jobId: string,
  category: string,
  description: string,
  urgency: string,
  zipCode: string,
): Promise<void> {
  try {
    if (!import.meta.env.VITE_ANTHROPIC_API_KEY) return

    // 1. Fetch candidates matching trade + zip
    const { data: byZip } = await supabase
      .from('contractors')
      .select('id, full_name, trade_types, rating_avg, rating_count, bio')
      .contains('trade_types', [category])
      .contains('service_zip_codes', [zipCode])

    let candidates = byZip ?? []

    // 2. If fewer than 3, expand to trade-only
    if (candidates.length < 3) {
      const { data: byTrade } = await supabase
        .from('contractors')
        .select('id, full_name, trade_types, rating_avg, rating_count, bio')
        .contains('trade_types', [category])

      const existingIds = new Set(candidates.map((c) => c.id))
      const extras = (byTrade ?? []).filter((c) => !existingIds.has(c.id))
      candidates = [...candidates, ...extras]
    }

    candidates = candidates.slice(0, 10)
    if (candidates.length === 0) return

    // 3. Call Claude Haiku for top 3
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [
          {
            role: 'user',
            content: `You are a contractor matching engine. Given a job and a list of contractors, select the top 3 best matches.

Job details:
- Category: ${category}
- Description: ${description}
- Urgency: ${urgency}
- Zip code: ${zipCode}

Contractors:
${candidates.map((c) => `- id: ${c.id}, name: ${c.full_name}, trades: ${(c.trade_types ?? []).join(', ')}, rating: ${c.rating_avg ?? 'N/A'} (${c.rating_count ?? 0} reviews), bio: ${c.bio ?? ''}`).join('\n')}

Respond ONLY with valid JSON in this exact format (no explanation, no markdown):
{"matches":[{"contractor_id":"uuid","reason":"brief 1-sentence reason"},{"contractor_id":"uuid","reason":"brief 1-sentence reason"},{"contractor_id":"uuid","reason":"brief 1-sentence reason"}]}`,
          },
        ],
      }),
    })

    if (!response.ok) return

    const result = await response.json()
    const rawText: string = result?.content?.[0]?.text ?? ''
    const cleaned = rawText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const parsed = JSON.parse(cleaned) as { matches: { contractor_id: string; reason: string }[] }
    const matches = parsed.matches ?? []
    if (matches.length === 0) return

    await supabase.from('ai_matches').insert(
      matches.map((m) => ({
        job_id: jobId,
        contractor_id: m.contractor_id,
        reason: m.reason,
      })),
    )
  } catch {
    // silent fail — non-blocking feature
  }
}
