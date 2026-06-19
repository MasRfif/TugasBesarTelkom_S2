import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

export default function StyledSelect({
  value,
  options = [],
  onChange,
  label = "Pilihan",
  className = "",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const ref = useRef(null);
  const menuRef = useRef(null);

  const normalized = useMemo(() => {
    const list = options.length ? options : [{ value: value || "", label: value || label }];

    return list.map((opt) => {
      if (typeof opt === "object" && opt !== null) {
        return { value: opt.value, label: opt.label ?? opt.value };
      }
      return { value: opt, label: opt };
    });
  }, [options, value, label]);

  const selected = normalized.find((opt) => String(opt.value) === String(value));
  const selectedLabel = selected?.label || value || label;
  const isAdminSelect = className.includes("admin-select-card");

  function updateMenuPosition() {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const gap = 8;
    const margin = 12;
    const minWidth = 190;
    const width = Math.max(rect.width, minWidth);
    const safeLeft = Math.min(
      Math.max(rect.left, margin),
      window.innerWidth - width - margin,
    );
    const spaceBelow = window.innerHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;

    const nextStyle = {
      position: "fixed",
      left: `${safeLeft}px`,
      width: `${width}px`,
      zIndex: 99999,
    };

    if (spaceBelow < 190 && spaceAbove > spaceBelow) {
      nextStyle.bottom = `${window.innerHeight - rect.top + gap}px`;
      nextStyle.maxHeight = `${Math.min(260, Math.max(140, spaceAbove - gap))}px`;
      nextStyle.transformOrigin = "bottom left";
    } else {
      nextStyle.top = `${rect.bottom + gap}px`;
      nextStyle.maxHeight = `${Math.min(260, Math.max(140, spaceBelow - gap))}px`;
      nextStyle.transformOrigin = "top left";
    }

    setMenuStyle(nextStyle);
  }

  useEffect(() => {
    if (!open) return;

    updateMenuPosition();

    function onClick(e) {
      const target = e.target;
      const clickedTrigger = ref.current?.contains(target);
      const clickedMenu = menuRef.current?.contains(target);
      if (!clickedTrigger && !clickedMenu) setOpen(false);
    }

    function onReposition() {
      updateMenuPosition();
    }

    document.addEventListener("mousedown", onClick);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);

    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  const menu = open && !disabled && (
    <div
      ref={menuRef}
      className={`select-card-menu select-card-menu-portal ${
        isAdminSelect ? "admin-select-card-menu" : ""
      }`}
      style={menuStyle}
    >
      {normalized.map((opt) => (
        <button
          type="button"
          key={String(opt.value)}
          className={`select-card-option ${
            String(opt.value) === String(value) ? "selected" : ""
          }`}
          onClick={() => {
            onChange?.(opt.value, opt);
            setOpen(false);
          }}
        >
          <span>{opt.label}</span>
          {String(opt.value) === String(value) && <Check size={14} />}
        </button>
      ))}
    </div>
  );

  return (
    <div className={`select-card ${className}`} ref={ref}>
      <button
        type="button"
        className={`select-card-button ${open ? "active" : ""}`}
        onClick={() => {
          if (disabled) return;
          setOpen((current) => !current);
        }}
        disabled={disabled}
      >
        <span className="select-card-label">{selectedLabel}</span>
        <ChevronDown
          size={16}
          className={open ? "select-chevron open" : "select-chevron"}
        />
      </button>

      {typeof document !== "undefined" ? createPortal(menu, document.body) : menu}
    </div>
  );
}
