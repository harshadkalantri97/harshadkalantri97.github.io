import { useEffect, useState } from "react";
import { PROFILE } from "../data/profile";
import { useApp } from "../context";
import { Brand } from "./Nav";
import Icon from "./Icon";

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-line py-[34px]">
      <div className="wrap flex flex-wrap items-center justify-between gap-x-6 gap-y-3.5">
        <Brand />
        <span className="text-[13px] text-faint">(c) {new Date().getFullYear()} {PROFILE.name}</span>
      </div>
    </footer>
  );
}

// on phones the pinned nav logo already returns to the top, so this only shows on wider screens
export function ToTop() {
  const { reduced } = useApp();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(scrollY > 700);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })}
      className={`no-print fixed right-5 bottom-5 z-[90] grid size-11 place-items-center rounded-[13px] border border-line bg-elev/90 text-fg shadow-(--shadow) backdrop-blur-md transition duration-300 hover:border-a1 hover:text-a1 max-[600px]:hidden ${
        show ? "" : "pointer-events-none translate-y-3 opacity-0"
      }`}
      data-cursor="^"
    >
      <Icon name="up" />
    </button>
  );
}
