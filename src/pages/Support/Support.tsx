import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, SendHorizonal } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { mockConversations, type SupportConversation } from './supportData'

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : ''
  return (first + last).toUpperCase()
}

export default function Support() {
  const [search, setSearch] = useState('')
  const [conversations, setConversations] =
    useState<SupportConversation[]>(mockConversations)
  const [activeId, setActiveId] = useState(mockConversations[0]?.id ?? '')
  const [draft, setDraft] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return conversations
    return conversations.filter(
      (c) =>
        c.guestName.toLowerCase().includes(q) ||
        c.propertyName.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
    )
  }, [conversations, search])

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeId) ?? conversations[0] ?? null
  }, [conversations, activeId])

  const sendMessage = () => {
    const text = draft.trim()
    if (!text || !activeConversation) return

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeConversation.id) return c
        const newMsg = {
          id: `m-${Date.now()}`,
          sender: 'owner' as const,
          text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        return {
          ...c,
          messages: [...c.messages, newMsg],
          lastMessage: text,
          lastSeenLabel: 'Just now',
        }
      })
    )

    setDraft('')
  }

  const selectConversation = (id: string) => {
    setActiveId(id)
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 bg-white p-8 rounded-2xl"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#2d2d2d] md:text-3xl">
          Message
        </h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          Communicate with your guests
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr]">
          {/* Left: conversations */}
          <div className="border-b lg:border-b-0 lg:border-r border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search here"
                  className="pl-9 bg-slate-50"
                />
              </div>
            </div>

            <div className="max-h-[520px] overflow-auto">
              {filtered.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground text-center">
                  No conversations found.
                </div>
              ) : (
                filtered.map((c) => {
                  const isActive = c.id === activeId
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectConversation(c.id)}
                      className={cn(
                        'w-full text-left p-4 border-b border-slate-200 hover:bg-slate-50 transition-colors',
                        isActive && 'bg-[#F2F9EB]'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={c.guestAvatarUrl} />
                          <AvatarFallback>{getInitials(c.guestName)}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-slate-900 truncate">
                              {c.guestName}
                            </p>
                            <p className="text-[11px] text-muted-foreground whitespace-nowrap">
                              {c.lastSeenLabel}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {c.propertyName}
                          </p>
                          <p className="mt-1 text-xs text-slate-600 truncate">
                            {c.lastMessage}
                          </p>
                        </div>

                        {c.unreadCount > 0 && (
                          <div className="h-5 w-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center">
                            {c.unreadCount}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Right: chat */}
          <div className="flex flex-col min-h-[640px]">
            <div className="p-4 border-b border-slate-200 flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={activeConversation?.guestAvatarUrl} />
                <AvatarFallback>
                  {activeConversation ? getInitials(activeConversation.guestName) : '—'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-slate-900">
                  {activeConversation?.guestName ?? '—'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeConversation?.propertyName ?? ''}
                </p>
              </div>
            </div>

            <div className="flex-1 p-6 space-y-4 overflow-auto bg-white">
              {activeConversation?.messages.map((m) => {
                const isOwner = m.sender === 'owner'
                return (
                  <div
                    key={m.id}
                    className={cn('flex', isOwner ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[520px] rounded-lg px-4 py-3 text-sm',
                        isOwner
                          ? 'bg-[#9CCB6B] text-white'
                          : 'bg-slate-100 text-slate-900'
                      )}
                    >
                      <p className="leading-relaxed">{m.text}</p>
                      <p
                        className={cn(
                          'mt-2 text-[11px]',
                          isOwner ? 'text-white/80' : 'text-slate-500'
                        )}
                      >
                        {m.time}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="p-4 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type your Message"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  className="bg-slate-50"
                />
                <Button
                  onClick={sendMessage}
                  className="bg-[#6BBF2D] hover:bg-[#5AA521] text-white px-6"
                  disabled={!draft.trim()}
                >
                  <SendHorizonal className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

