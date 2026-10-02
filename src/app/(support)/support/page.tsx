"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  Bot,
  CheckCircle2,
  Headphones,
  HelpCircle,
  MessageCircle,
  Package,
  Send,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";

type Sender = "bot" | "user";

interface ChatMessage {
  id: number;
  sender: Sender;
  text: string;
  time: string;
}

const quickQuestions = [
  {
    label: "Where is my order?",
    icon: Package,
    message: "Where is my order?",
  },
  {
    label: "Payment problem",
    icon: ShieldCheck,
    message: "I have a payment problem.",
  },
  {
    label: "Product problem",
    icon: ShoppingBag,
    message: "I have a problem with a product.",
  },
  {
    label: "Talk to support",
    icon: Headphones,
    message: "I want to talk to a support agent.",
  },
] as const;

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    sender: "bot",
    text:
      "Hi! I’m ALI STORE Support. I can help you with orders, payments, products, accounts, and general questions.",
    time: "Now",
  },
  {
    id: 2,
    sender: "bot",
    text:
      "Choose one of the options below or type your question and I’ll do my best to help.",
    time: "Now",
  },
];

function getBotReply(message: string): string {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("order") ||
    normalized.includes("shipment") ||
    normalized.includes("delivery")
  ) {
    return "I can help you check an order, shipment status, delivery details, or a delayed order. Please provide your order number, for example ORD-10482.";
  }

  if (
    normalized.includes("payment") ||
    normalized.includes("pay") ||
    normalized.includes("invoice")
  ) {
    return "I can help with payment failures, invoices, transaction status, or billing questions. Please tell me what happened with the payment.";
  }

  if (
    normalized.includes("product") ||
    normalized.includes("item")
  ) {
    return "I can help with product availability, specifications, MOQ, pricing, or a problem with an item you received.";
  }

  if (
    normalized.includes("account") ||
    normalized.includes("login") ||
    normalized.includes("password")
  ) {
    return "I can help with account and login questions. For security, never send me your password or payment card details.";
  }

  if (
    normalized.includes("human") ||
    normalized.includes("agent") ||
    normalized.includes("support")
  ) {
    return "Sure. I can forward your conversation to a support agent. Please briefly describe the issue so the team can assist you faster.";
  }

  if (
    normalized.includes("hello") ||
    normalized.includes("hi") ||
    normalized.includes("hey")
  ) {
    return "Hello! How can I help you today?";
  }

  return "I understand. Please give me a little more detail about the problem, such as the order number, product name, or what happened.";
}

function formatTime() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SupportPage() {
  const [messages, setMessages] =
    useState<ChatMessage[]>(initialMessages);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showAgentNotice, setShowAgentNotice] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const nextMessageId = useRef(initialMessages.length + 1);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  const sendMessage = (
    message: string,
    botReply?: string,
  ) => {
    const trimmed = message.trim();

    if (!trimmed || isTyping) {
      return;
    }

    const userMessage: ChatMessage = {
      id: nextMessageId.current++,
      sender: "user",
      text: trimmed,
      time: formatTime(),
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");
    setIsTyping(true);

    window.setTimeout(() => {
      const botMessage: ChatMessage = {
        id: nextMessageId.current++,
        sender: "bot",
        text: botReply ?? getBotReply(trimmed),
        time: formatTime(),
      };

      setMessages((current) => [
        ...current,
        botMessage,
      ]);

      setIsTyping(false);
    }, 900);
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    sendMessage(input);
  };

  const handleQuickQuestion = (
    message: string
  ) => {
    sendMessage(message);
  };

  const handleHumanSupport = () => {
    setShowAgentNotice(true);

    sendMessage(
      "I want to talk to a support agent.",
      "Your request has been marked for human support. In the connected backend, this conversation can now be transferred to a support agent.",
    );
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC]">

      {/* Header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-black text-[#2563EB]">
                <Bot className="h-3.5 w-3.5" />
                AI Support
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl">
                How can we help?
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Chat with our support assistant about orders, payments,
                products, accounts, and technical issues.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-xl bg-emerald-50 px-3.5 py-2.5 text-xs font-bold text-emerald-700 sm:self-auto">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Support assistant online
            </div>

          </div>
        </div>
      </section>

      {/* Chat area */}
      <div className="mx-auto max-w-[1100px] px-4 py-7 sm:px-6 lg:px-8">

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">

          {/* Chat */}
          <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">

            {/* Chat header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">

              <div className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0F2747] text-white">
                  <Bot className="h-5 w-5" />

                  <span className="absolute -bottom-0.5 -end-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                </div>

                <div>
                  <p className="text-sm font-black text-slate-900">
                    Enterprise Support Assistant
                  </p>

                  <p className="mt-0.5 text-[11px] text-emerald-600">
                    Online · Ready to help
                  </p>
                </div>
              </div>

              <div className="hidden items-center gap-2 text-[11px] font-bold text-slate-400 sm:flex">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Secure support
              </div>

            </div>

            {/* Messages */}
            <div
              className="h-[560px] overflow-y-auto bg-slate-50/60 px-4 py-5 sm:px-6"
              aria-live="polite"
              aria-label="Support conversation"
            >

              <div className="mx-auto max-w-3xl space-y-4">

                {messages.map((message) => {
                  const isUser =
                    message.sender === "user";

                  return (
                    <div
                      key={message.id}
                      className={`flex items-end gap-3 ${
                        isUser
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >

                      {!isUser && (
                        <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0F2747] text-white sm:flex">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[75%] ${
                          isUser
                            ? "rounded-br-md bg-[#2563EB] text-white"
                            : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        <p className="text-sm leading-6">
                          {message.text}
                        </p>

                        <p
                          className={`mt-1 text-[10px] ${
                            isUser
                              ? "text-blue-100"
                              : "text-slate-400"
                          }`}
                        >
                          {message.time}
                        </p>
                      </div>

                      {isUser && (
                        <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] sm:flex">
                          <UserRound className="h-4 w-4" />
                        </div>
                      )}

                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-end gap-3">
                    <div className="hidden h-8 w-8 items-center justify-center rounded-xl bg-[#0F2747] text-white sm:flex">
                      <Bot className="h-4 w-4" />
                    </div>

                    <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                        <span
                          className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                          style={{
                            animationDelay: "120ms",
                          }}
                        />
                        <span
                          className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                          style={{
                            animationDelay: "240ms",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />

              </div>
            </div>

            {/* Quick questions */}
            <div className="border-t border-slate-100 bg-white px-4 py-4 sm:px-6">

              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                Quick questions
              </p>

              <div className="flex gap-2 overflow-x-auto pb-1">
                {quickQuestions.map((question) => {
                  const Icon = question.icon;

                  return (
                    <button
                      key={question.label}
                      type="button"
                      onClick={() =>
                        handleQuickQuestion(
                          question.message
                        )
                      }
                      disabled={isTyping}
                      className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#2563EB] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {question.label}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Input */}
            <div className="border-t border-slate-100 bg-white p-4 sm:p-5">

              <form
                onSubmit={handleSubmit}
                className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-[#2563EB] focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100"
              >
                <label
                  htmlFor="support-message"
                  className="sr-only"
                >
                  Type your support message
                </label>

                <textarea
                  id="support-message"
                  value={input}
                  onChange={(event) =>
                    setInput(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey
                    ) {
                      event.preventDefault();

                      if (input.trim()) {
                        sendMessage(input);
                      }
                    }
                  }}
                  placeholder="Type your question..."
                  rows={1}
                  disabled={isTyping}
                  className="max-h-32 min-h-[42px] flex-1 resize-none bg-transparent px-2 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400 disabled:opacity-50"
                />

                <button
                  type="submit"
                  disabled={
                    !input.trim() || isTyping
                  }
                  aria-label="Send message"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>

              </form>

              <p className="mt-2 text-[10px] leading-5 text-slate-400">
                Press Enter to send · Shift + Enter for a new line
              </p>

            </div>

          </section>

          {/* Sidebar */}
          <aside className="space-y-4">

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-[#2563EB]" />

                <h2 className="text-sm font-black text-slate-900">
                  What can I help with?
                </h2>
              </div>

              <div className="mt-4 space-y-2">

                {[
                  "Order tracking",
                  "Payment issues",
                  "Product questions",
                  "Delivery issues",
                  "Account help",
                  "Technical issues",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-600"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    {item}
                  </div>
                ))}

              </div>

            </section>

            <section className="rounded-2xl bg-[#0F2747] p-5 text-white">

              <div className="flex items-center gap-3">
                <Headphones className="h-5 w-5 text-blue-200" />

                <h2 className="text-sm font-black">
                  Need a human?
                </h2>
              </div>

              <p className="mt-3 text-xs leading-5 text-blue-100/70">
                If the assistant cannot resolve your issue, you can request
                help from a support agent.
              </p>

              <button
                type="button"
                onClick={handleHumanSupport}
                className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white text-xs font-black text-[#0F2747] transition hover:bg-slate-100"
              >
                <MessageCircle className="h-4 w-4" />
                Contact support agent
              </button>

            </section>

            {showAgentNotice && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

                  <div className="flex-1">
                    <p className="text-xs font-black text-emerald-900">
                      Agent request created
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-emerald-700">
                      Your conversation is ready to be transferred to human
                      support when the backend support service is connected.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowAgentNotice(false)
                    }
                    aria-label="Close agent notice"
                    className="text-emerald-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

          </aside>

        </div>
      </div>
    </main>
  );
}
