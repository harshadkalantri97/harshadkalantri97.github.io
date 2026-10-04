import { lazy, Suspense, useEffect, useState } from "react";
import { AppProvider, useApp } from "./context";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Experience from "./components/Experience";
import Skills from "./components/Skills";
import Impact from "./components/Impact";
import Playground from "./components/Playground";
import Projects from "./components/Projects";
import Credentials from "./components/Credentials";
import Contact from "./components/Contact";
import Footer, { ToTop } from "./components/Footer";
import CommandPalette from "./components/CommandPalette";
import TechCursor from "./components/TechCursor";

const loadTerminal = () => import("./components/Terminal");
const Terminal = lazy(loadTerminal);

// the terminal is its own chunk: mounted on first open, then kept so its history survives
function TerminalHost() {
  const { termOpen } = useApp();
  const [mounted, setMounted] = useState(false);
  if (termOpen && !mounted) setMounted(true);
  useEffect(() => {
    const id = setTimeout(loadTerminal, 3000); // warm the chunk so the first open is instant
    return () => clearTimeout(id);
  }, []);
  return mounted ? <Suspense fallback={null}><Terminal /></Suspense> : null;
}

export default function App() {
  return (
    <AppProvider>
      <a
        href="#main"
        className="fixed top-2.5 -left-[999px] z-[200] rounded-[10px] bg-a1 px-4 py-2.5 font-semibold text-[#001018] focus:left-4"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <Experience />
        <Skills />
        <Impact />
        <Playground />
        <Projects />
        <Credentials />
        <Contact />
      </main>
      <Footer />
      <ToTop />
      <CommandPalette />
      <TerminalHost />
      <TechCursor />
    </AppProvider>
  );
}
