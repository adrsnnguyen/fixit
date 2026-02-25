import { useEffect, useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { formatPrice } from '../../../utils/pricing'
import { CATEGORY_LABELS } from './categories'
import type { JobDraft } from './PostJobPage'

interface Props {
  draft: JobDraft
  onChange: (partial: Partial<JobDraft>) => void
  onNext: () => void
  onBack: () => void
}

function buildPrompt(draft: JobDraft): string {
  return `You are a home services pricing expert. A homeowner needs help with the following job:

Category: ${CATEGORY_LABELS[draft.category] ?? draft.category}
Description: ${draft.description}
Location (zip): ${draft.zip_code}
Urgency: ${draft.urgency}

Estimate a fair price range for this job. Consider typical labor and materials costs in the US.

Respond with ONLY valid JSON in exactly this format, no other text:
{"min_cents": 15000, "max_cents": 35000, "basis": "Typical cost includes labor and basic materials."}`
}

export function Step4Estimate({ draft, onChange, onNext, onBack }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [estimated, setEstimated] = useState(false)

  const fetchEstimate = async () => {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string
    if (!apiKey) {
      setError('API key not configured')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 256,
          messages: [{ role: 'user', content: buildPrompt(draft) }],
        }),
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`API error ${response.status}: ${text}`)
      }

      const data = await response.json()
      const text: string = data.content[0].text

      // Extract JSON from response
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('Could not parse estimate response')

      const parsed = JSON.parse(match[0]) as {
        min_cents: number
        max_cents: number
        basis: string
      }

      onChange({
        ai_price_min_cents: parsed.min_cents,
        ai_price_max_cents: parsed.max_cents,
        ai_price_basis: parsed.basis,
      })
      setEstimated(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Estimation failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEstimate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex-1 flex flex-col px-6 pb-8 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">AI Price Estimate</h2>
        <p className="text-sm text-muted">Based on your job details, here's a fair price range.</p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {loading && (
          <div className="flex flex-col items-center gap-3 text-muted">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm">Analyzing your job…</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={fetchEstimate}
              className="flex items-center gap-2 px-4 py-2.5 border border-border text-foreground text-sm font-medium rounded-xl hover:border-foreground transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {estimated && !loading && !error && (
          <div className="w-full bg-surface border border-border rounded-2xl p-5 text-center space-y-3">
            <p className="text-xs font-medium text-muted uppercase tracking-wide">Estimated range</p>
            <p className="text-3xl font-bold text-foreground">
              {formatPrice(draft.ai_price_min_cents / 100)}
              <span className="text-muted font-normal mx-2">–</span>
              {formatPrice(draft.ai_price_max_cents / 100)}
            </p>
            {draft.ai_price_basis && (
              <p className="text-sm text-muted leading-relaxed">{draft.ai_price_basis}</p>
            )}
            <p className="text-xs text-muted">Contractors may quote above or below this range.</p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 border border-border text-foreground font-semibold rounded-xl hover:border-foreground active:scale-[0.98] transition-all text-sm"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={loading || !!error}
          className="flex-1 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all text-sm disabled:opacity-60"
        >
          Looks good
        </button>
      </div>
    </div>
  )
}
