"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  className?: string;
  ariaLabel?: string;
}

export function Tabs({
  items,
  defaultTab,
  className = "",
  ariaLabel = "Content tabs",
}: TabsProps) {
  const baseId = useId();
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [activeTab, setActiveTab] = useState(
    defaultTab ?? items[0]?.id ?? "",
  );

  const activeContent =
    items.find((item) => item.id === activeTab)?.content ?? null;

  const focusTab = (index: number) => {
    const item = items[index];
    if (!item) return;
    setActiveTab(item.id);
    tabRefs.current[item.id]?.focus();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        focusTab((index + 1) % items.length);
        break;

      case "ArrowLeft":
        event.preventDefault();
        focusTab((index - 1 + items.length) % items.length);
        break;

      case "Home":
        event.preventDefault();
        focusTab(0);
        break;

      case "End":
        event.preventDefault();
        focusTab(items.length - 1);
        break;

      default:
        break;
    }
  };

  return (
    <div className={className}>
      <div
        className="flex overflow-x-auto border-b border-neutral-200"
        role="tablist"
        aria-label={ariaLabel}
      >
        {items.map((item, index) => {
          const active = item.id === activeTab;
          const tabId = `${baseId}-tab-${item.id}`;
          const panelId = `${baseId}-panel-${item.id}`;

          return (
            <button
              key={item.id}
              ref={(node) => {
                tabRefs.current[item.id] = node;
              }}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={panelId}
              tabIndex={active ? 0 : -1}
              onClick={() => setActiveTab(item.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`shrink-0 border-b-2 px-5 py-3.5 text-body font-medium outline-none transition-colors duration-200 ease-brand ${
                active
                  ? "border-brand text-brand"
                  : "border-transparent text-neutral-500 hover:text-neutral-800"
              } focus-visible:ring-4 focus-visible:ring-primary-100`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {items.map((item) => {
        const active = item.id === activeTab;
        const tabId = `${baseId}-tab-${item.id}`;
        const panelId = `${baseId}-panel-${item.id}`;

        if (!active) return null;

        return (
          <div
            key={item.id}
            id={panelId}
            role="tabpanel"
            aria-labelledby={tabId}
            tabIndex={0}
            className="pt-6"
          >
            {activeContent}
          </div>
        );
      })}
    </div>
  );
}
