import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { Message } from '../../types/database'

export default function ChatPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [partnerName, setPartnerName] = useState('')
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)

  const initChat = useCallback(async () => {
    if (!jobId || !user) return
    setLoading(true)

    const [jobResult, quoteResult] = await Promise.all([
      supabase.from('jobs').select('homeowner_id').eq('id', jobId).single(),
      supabase
        .from('quotes')
        .select('contractor_id')
        .eq('job_id', jobId)
        .eq('status', 'accepted')
        .maybeSingle(),
    ])

    const isHomeowner = user.id === jobResult.data?.homeowner_id

    if (isHomeowner && quoteResult.data?.contractor_id) {
      const { data: contractorData } = await supabase
        .from('contractors')
        .select('full_name')
        .eq('id', quoteResult.data.contractor_id)
        .maybeSingle()
      setPartnerName(contractorData?.full_name ?? 'Contractor')
    } else if (!isHomeowner && jobResult.data?.homeowner_id) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', jobResult.data.homeowner_id)
        .maybeSingle()
      setPartnerName(profileData?.full_name ?? 'Homeowner')
    }

    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true })

    setMessages(msgs ?? [])
    setLoading(false)
  }, [jobId, user])

  useEffect(() => {
    initChat()
  }, [initChat])

  useEffect(() => {
    if (!jobId) return

    const channel = supabase
      .channel(`messages_job_${jobId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `job_id=eq.${jobId}`,
        },
        (payload) => {
          const msg = payload.new as Message
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [jobId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!jobId || !user || !inputText.trim() || sending) return

    const content = inputText.trim()
    setInputText('')
    setSending(true)

    const { error } = await supabase.from('messages').insert({
      job_id: jobId,
      sender_id: user.id,
      content,
    })

    if (error) {
      setInputText(content) // restore on error
      toast.error('Failed to send message')
    }

    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (ts: string) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Fixed header */}
      <div className="bg-surface border-b border-border px-4 pt-4 pb-3 flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-1 rounded-xl text-muted hover:text-foreground hover:bg-background transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground leading-tight">Chat</p>
          {partnerName && (
            <p className="text-xs text-muted">{partnerName}</p>
          )}
        </div>
      </div>

      {/* Scrollable messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
      >
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted py-8">
            No messages yet. Send the first one!
          </p>
        )}
        {messages.map((msg) => {
          const isSender = msg.sender_id === user?.id
          return (
            <div
              key={msg.id}
              className={['flex flex-col', isSender ? 'items-end' : 'items-start'].join(' ')}
            >
              <div
                className={[
                  'px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words',
                  isSender
                    ? 'ml-auto bg-primary text-white rounded-2xl rounded-br-sm max-w-[75%]'
                    : 'mr-auto bg-surface border border-border text-foreground rounded-2xl rounded-bl-sm max-w-[75%]',
                ].join(' ')}
              >
                {msg.content}
              </div>
              <p
                className={[
                  'text-xs text-muted mt-1 px-1',
                  isSender ? 'text-right' : 'text-left',
                ].join(' ')}
              >
                {formatTime(msg.created_at)}
              </p>
            </div>
          )
        })}
      </div>

      {/* Fixed bottom input */}
      <div className="bg-surface border-t border-border px-4 py-3 shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            rows={1}
            className="flex-1 px-4 py-2.5 rounded-2xl border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none text-sm"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || sending}
            className="p-2.5 bg-primary text-white rounded-2xl hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
