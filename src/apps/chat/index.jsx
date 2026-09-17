import { useRef, useEffect } from 'react'
import { useChat } from './useChat.js'
import AppIconGraphic from '../../components/common/AppIconGraphic.jsx'

const STARTER_PROMPTS = [
  'Ceritakan lelucon yang lucu dan cerdas!',
  'Rekomendasikan 3 buku yang mengubah cara pandang hidup.',
  'Bagaimana tips produktif dan fokus saat ngoding?',
  'Ceritakan kisah awal mula komputer personal 1980-an.',
]

export default function PayamanChatApp() {
  const {
    messages,
    inputText,
    isLoading,
    error,
    isCopied,
    messagesEndRef,
    setInputText,
    sendMessage,
    clearChat,
    copyMessage,
  } = useChat()

  const textareaRef = useRef(null)

  useEffect(() => {
    const handleMenuAction = (e) => {
      const { action } = e.detail || {}
      if (action === 'chat:new' || action === 'chat:clear') {
        clearChat()
      } else if (action === 'chat:focus_input') {
        textareaRef.current?.focus()
      }
    }

    window.addEventListener('payaman-menu-action', handleMenuAction)
    return () => window.removeEventListener('payaman-menu-action', handleMenuAction)
  }, [clearChat])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="w-full h-full flex flex-col bg-[var(--os-bg)] text-[var(--os-fg)] font-mono text-xs select-none overflow-hidden">
      {/* Top Header Toolbar */}
      <div className="p-2 border-b-2 border-[var(--os-border)] flex items-center justify-between gap-2 shrink-0 bg-[var(--os-bg)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 border border-[var(--os-border)] rounded-full flex items-center justify-center bg-[var(--os-fg)]/10">
            <AppIconGraphic iconType="chat" className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold flex items-center gap-1.5 text-xs">
              <span>Payaman AI</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="text-[10px] opacity-60">Virtual Companion • Ready to chat</div>
          </div>
        </div>

        <button
          type="button"
          onClick={clearChat}
          title="Start fresh conversation"
          className="px-2.5 py-1 border border-[var(--os-border)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] text-xs font-semibold"
        >
          + New Chat
        </button>
      </div>

      {/* Main Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 select-text">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user'

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
            >
              <div className="flex items-center gap-1 text-[10px] opacity-50 mb-1 px-1">
                <span>{isUser ? 'You' : 'Payaman AI'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`p-3 max-w-[85%] md:max-w-[75%] border-2 rounded-lg text-xs leading-relaxed whitespace-pre-wrap break-words relative group ${
                  isUser
                    ? 'border-[var(--os-border)] bg-[var(--os-fg)] text-[var(--os-bg)] shadow-[2px_2px_0px_var(--os-shadow)]'
                    : 'border-[var(--os-border)] bg-[var(--os-bg)] text-[var(--os-fg)] shadow-[2px_2px_0px_var(--os-shadow)]'
                }`}
              >
                {msg.text}

                {!isUser && (
                  <button
                    type="button"
                    onClick={() => copyMessage(msg.text)}
                    title="Copy response"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 px-1.5 py-0.5 bg-[var(--os-bg)] text-[var(--os-fg)] border border-[var(--os-border)] font-bold text-[9px] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] transition-opacity cursor-pointer"
                  >
                    Copy
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {/* Typing Loading Indicator */}
        {isLoading && (
          <div className="flex flex-col items-start max-w-full">
            <div className="text-[10px] opacity-50 mb-1 px-1">Payaman AI is thinking...</div>
            <div className="p-3 border-2 border-[var(--os-border)] bg-[var(--os-bg)] text-[var(--os-fg)] rounded-lg shadow-[2px_2px_0px_var(--os-shadow)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--os-fg)] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-[var(--os-fg)] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-[var(--os-fg)] animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div className="p-2 border-2 border-[var(--os-border)] bg-[var(--os-fg)]/10 text-xs text-center">
            <span className="font-bold">Notice:</span> {error}
          </div>
        )}

        {/* Starter Prompts when conversation is fresh */}
        {messages.length <= 1 && !isLoading && (
          <div className="pt-3 pb-1 border-t border-[var(--os-border)]/20">
            <div className="text-[10px] opacity-60 uppercase tracking-wider mb-2 font-bold">
              Suggested Topics:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="px-2.5 py-1 border border-[var(--os-border)]/50 hover:border-[var(--os-border)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] text-[11px] rounded transition-colors text-left cursor-pointer"
                >
                  › {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Copy Toast feedback */}
      {isCopied && (
        <div className="bg-[var(--os-fg)] text-[var(--os-bg)] text-[10px] py-0.5 px-2 text-center font-bold">
          ✓ Copied to clipboard
        </div>
      )}

      {/* Bottom Message Input Area */}
      <div className="p-2 border-t-2 border-[var(--os-border)] bg-[var(--os-bg)] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage()
          }}
          className="flex items-end gap-2"
        >
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
            className="flex-1 bg-[var(--os-bg)] border border-[var(--os-border)] p-2 text-xs font-mono text-[var(--os-fg)] resize-none focus:outline-none focus:ring-1 focus:ring-[var(--os-border)] placeholder:opacity-40"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-3 border-2 border-[var(--os-border)] bg-[var(--os-fg)] text-[var(--os-bg)] font-bold text-xs hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all cursor-pointer h-full"
          >
            {isLoading ? '...' : 'Send ↵'}
          </button>
        </form>
      </div>
    </div>
  )
}
