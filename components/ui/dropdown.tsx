"use client";

import * as React from "react";

/* --------------------------- Types --------------------------- */
type Align = "start" | "end";

type DropdownProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: Align;
  className?: string;
  children: React.ReactNode;
};

type DropdownCompound = React.FC<DropdownProps> & {
  Trigger: React.FC<
    React.ButtonHTMLAttributes<HTMLButtonElement> & Partial<RootCtx>
  >;
  Content: React.FC<React.HTMLAttributes<HTMLDivElement> & Partial<RootCtx>>;
  Item: React.FC<
    React.LiHTMLAttributes<HTMLLIElement> &
      Partial<RootCtx> & {
        inset?: boolean;
        closeOnSelect?: boolean;
        onSelect?: () => void;
      }
  >;
  Separator: React.FC<React.HTMLAttributes<HTMLLIElement>>;
  Label: React.FC<React.LiHTMLAttributes<HTMLLIElement>>;
};

type RootCtx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  align: Align;
  triggerRef: React.RefObject<HTMLButtonElement>;
  menuRef: React.RefObject<HTMLUListElement>;
  menuId: string;
  onTriggerKeyDown: (e: React.KeyboardEvent) => void;
  onMenuKeyDown: (e: React.KeyboardEvent) => void;
  isNormal?: boolean;
};

/* --------------------------- Utils --------------------------- */
function cx(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T>,
  handler: (e: MouseEvent | TouchEvent) => void
) {
  React.useEffect(() => {
    const listener = (e: any) => {
      const el = ref.current;
      if (!el || el.contains(e.target)) return;
      handler(e);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener, { passive: true });
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

/* Smooth slide (height) animation with auto-measure */
function SlideDown({
  show,
  children,
  className,
  duration = 200,
}: {
  show: boolean;
  children: React.ReactNode;
  className?: string;
  duration?: number; // ms
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [style, setStyle] = React.useState<React.CSSProperties>({
    height: 0,
    overflow: "hidden",
  });

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (show) {
      const contentHeight = el.scrollHeight;
      // 0 -> content height -> auto
      setStyle({ height: 0, overflow: "hidden" });
      requestAnimationFrame(() => {
        setStyle({
          height: contentHeight,
          overflow: "hidden",
          transition: `height ${duration}ms ease`,
        });
      });
      const id = window.setTimeout(() => {
        setStyle({ height: "auto", overflow: "visible" });
      }, duration);
      return () => window.clearTimeout(id);
    } else {
      // current -> 0
      const currentHeight =
        el.getBoundingClientRect().height || el.scrollHeight || 0;
      setStyle({ height: currentHeight, overflow: "hidden" });
      requestAnimationFrame(() => {
        setStyle({
          height: 0,
          overflow: "hidden",
          transition: `height ${duration}ms ease`,
        });
      });
    }
  }, [show, duration]);

  return (
    <div
      ref={ref}
      className={cx("will-change-[height,opacity] w-full", className)}
      style={style}
      aria-hidden={!show}
      data-state={show ? "open" : "closed"}
    >
      <div
        className={cx(
          show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1",
          "transition-all duration-150"
        )}
      >
        {children}
      </div>
    </div>
  );
}

/* ------------------------ Dropdown Root ---------------------- */
const DropdownBase: React.FC<DropdownProps> = ({
  open: controlledOpen,
  onOpenChange,
  align = "start",
  className,
  children,
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = (v: boolean) => {
    if (!isControlled) setUncontrolledOpen(v);
    onOpenChange?.(v);
  };

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const menuRef = React.useRef<HTMLUListElement | null>(null);
  const [menuId] = React.useState(
    () => `dropdown-${Math.random().toString(36).slice(2, 9)}`
  );

  useClickOutside(rootRef as any, () => setOpen(false));

  // close on Esc
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // keyboard navigation helpers
  const focusItem = (index: number) => {
    const items =
      menuRef.current?.querySelectorAll<HTMLElement>("[role='menuitem']");
    if (!items || items.length === 0) return;
    const clamped = (index + items.length) % items.length;
    items[clamped].focus();
  };

  const onTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (["ArrowDown", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => focusItem(0));
    }
  };

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    const items =
      menuRef.current?.querySelectorAll<HTMLElement>("[role='menuitem']");
    if (!items || items.length === 0) return;

    const currentIndex = Array.from(items).findIndex(
      (el) => el === document.activeElement
    );

    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusItem(currentIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusItem(currentIndex - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusItem(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusItem(items.length - 1);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  };

  const ctx: RootCtx = {
    open,
    setOpen,
    align,
    triggerRef,
    menuRef,
    menuId,
    onTriggerKeyDown,
    onMenuKeyDown,
  };

  // Inject ctx into direct children (e.g., Trigger, Content)
  const enhancedChildren = React.Children.map(children, (child) =>
    React.isValidElement(child) ? React.cloneElement(child, ctx) : child
  );

  return (
    <div ref={rootRef} className={cx("relative inline-block", className)}>
      {enhancedChildren}
    </div>
  );
};
DropdownBase.displayName = "Dropdown";

/* --------------------------- Trigger ------------------------- */
const Trigger: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & Partial<RootCtx>
> = ({ children, className, ...rest }) => {
  const { open, setOpen, triggerRef, menuId, onTriggerKeyDown } =
    rest as RootCtx;

  return (
    <button
      ref={triggerRef}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={menuId}
      onClick={(e) => {
        e.stopPropagation();
        setOpen(!open);
      }}
      onKeyDown={onTriggerKeyDown}
      className={cx(rest?.isNormal ? "" : "input-container", className)}
      type="button"
    >
      {children}
      {rest.isNormal ? null : (
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className={cx("h-4 w-4 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.085l3.71-3.854a.75.75 0 111.08 1.04l-4.24 4.4a.75.75 0 01-1.08 0l-4.24-4.4a.75.75 0 01.02-1.06z" />
        </svg>
      )}
    </button>
  );
};
Trigger.displayName = "Dropdown.Trigger";

/* --------------------------- Content ------------------------- */
const Content: React.FC<
  React.HTMLAttributes<HTMLDivElement> & Partial<RootCtx>
> = ({ className, children, ...rest }) => {
  const { open, align, menuRef, menuId, onMenuKeyDown } = rest as RootCtx;

  // Inject root ctx into menu items (so Item can call setOpen/return focus)
  const injectedChildren = React.Children.map(children, (child) =>
    React.isValidElement(child)
      ? React.cloneElement(child, rest as RootCtx)
      : child
  );

  return (
    <SlideDown show={!!open} className="absolute z-50 w-56" duration={200}>
      <ul
        role="menu"
        id={menuId}
        tabIndex={-1}
        ref={menuRef}
        onKeyDown={onMenuKeyDown}
        className={cx(
          "mt-2 origin-top rounded-md border border-black/10 bg-white backdrop-blur p-1 shadow-xl ring-1 ring-black/5 max-h-[300px] z-50 overflow-y-auto",
          align === "end" ? "right-0" : "left-0",
          className
        )}
      >
        {/* <ul className="max-h-[320px] overflow-auto outline-none"> */}
        {injectedChildren}
        {/* </ul> */}
      </ul>
    </SlideDown>
  );
};
Content.displayName = "Dropdown.Content";

/* ----------------------------- Item -------------------------- */
const Item: React.FC<
  React.LiHTMLAttributes<HTMLLIElement> &
    Partial<RootCtx> & {
      inset?: boolean;
      closeOnSelect?: boolean;
      onSelect?: () => void;
    }
> = ({
  className,
  children,
  inset,
  onClick,
  onKeyDown,
  closeOnSelect = true,
  onSelect,
  ...rest
}) => {
  const { setOpen, triggerRef } = rest as RootCtx;

  const select = (
    e: React.MouseEvent<HTMLLIElement> | React.KeyboardEvent<HTMLLIElement>
  ) => {
    onClick?.(e as any);
    onSelect?.();
    if (!closeOnSelect) return;
    if (!(e as any).defaultPrevented) {
      setOpen(false);
      triggerRef?.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLLIElement>) => {
    onKeyDown?.(e);
    if (e.key === "Enter" || e.key === " ") {
      e.stopPropagation();
      e.preventDefault();
      select(e);
    }
  };

  return (
    <li
      role="menuitem"
      tabIndex={-1}
      onClick={select}
      onKeyDown={handleKeyDown}
      className={cx(
        "flex cursor-pointer select-none items-center rounded-[6px] px-2 py-2 text-sm text-gray-900 outline-none hover:bg-gray-100 focus:bg-gray-100",
        inset && "pl-8",
        className
      )}
    >
      {children}
    </li>
  );
};
Item.displayName = "Dropdown.Item";

/* ----------------------- Separator & Label ------------------- */
const Separator: React.FC<React.HTMLAttributes<HTMLLIElement>> = ({
  className,
  ...rest
}) => (
  <li
    role="separator"
    aria-hidden="true"
    className={cx("my-1 h-px bg-gray-200", className)}
    {...rest}
  />
);
Separator.displayName = "Dropdown.Separator";

const Label: React.FC<React.LiHTMLAttributes<HTMLLIElement>> = ({
  className,
  ...rest
}) => (
  <li
    role="presentation"
    className={cx("px-2 py-2 text-xs font-medium text-gray-500", className)}
    {...rest}
  />
);
Label.displayName = "Dropdown.Label";

/* -------------------------- Export --------------------------- */
const Dropdown = Object.assign(DropdownBase, {
  Trigger,
  Content,
  Item,
  Separator,
  Label,
}) as DropdownCompound;

export default Dropdown;
