"use client";

import { useEffect, useRef, useState } from "react";

interface Option {
  value: string;
  label: string;
  color?: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  style?: React.CSSProperties;
  className?: string;
  placeholder?: string;
}

export default function Select({
  value,
  onChange,
  options,
  style,
  className,
  placeholder = "Sélectionner...",
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        display: "inline-block",
        ...style,
      }}
      className={className}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "5px 10px",
          background: "var(--surface2)",
          border: "1px solid var(--border)",
          borderRadius: 6,
          color: selectedOption?.color || "var(--text)",
          fontSize: 12,
          fontWeight: style?.fontWeight || 400,
          cursor: "pointer",
          transition: "all 0.15s ease",
          outline: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--muted)";
          e.currentTarget.style.background = "var(--surface)";
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.background = "var(--surface2)";
          }
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            flexShrink: 0,
            opacity: 0.6,
          }}
        >
          <path
            d="M1 1L5 5L9 1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <ul
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 1000,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 4,
            margin: 0,
            listStyle: "none",
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)",
            maxHeight: 300,
            overflowY: "auto",
            animation: "select-fade-in 0.15s ease-out",
          }}
        >
          <style>{`
            @keyframes select-fade-in {
              from { opacity: 0; transform: translateY(-4px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              style={{
                padding: "6px 8px",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 12,
                color: option.color || "var(--text)",
                background:
                  value === option.value
                    ? "rgba(255, 255, 255, 0.05)"
                    : "transparent",
                transition: "all 0.1s ease",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              }}
              onMouseLeave={(e) => {
                if (value !== option.value) {
                  e.currentTarget.style.background = "transparent";
                } else {
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.05)";
                }
              }}
            >
              {option.label}
            </li>
          ))}
          {options.length === 0 && (
            <li
              style={{
                padding: "8px",
                textAlign: "center",
                color: "var(--muted)",
                fontSize: 11,
              }}
            >
              Aucun résultat
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
