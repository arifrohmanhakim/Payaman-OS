import { useRef, useEffect, useState, useCallback } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { useOS } from "../../hooks/useOS.js";
import { getPrompt, executeShellCommand } from "./terminalShell.js";
import { storageService } from "../../services/storageService.js";

const STORAGE_KEY_TERMINAL_PROFILE = "terminal_active_profile";

const TERMINAL_PROFILES = {
  basic: {
    name: "Basic",
    background: "#ffffff",
    foreground: "#000000",
    cursor: "#000000",
    cursorAccent: "#ffffff",
    selectionBackground: "#b5d5ff",
    selectionForeground: "#000000",
    black: "#000000",
    red: "#c91b00",
    green: "#00c200",
    yellow: "#c7c400",
    blue: "#0225c7",
    magenta: "#c930c7",
    cyan: "#00c5c7",
    white: "#c7c7c7",
    brightBlack: "#676767",
    brightRed: "#ff6d67",
    brightGreen: "#5ff967",
    brightYellow: "#fefb67",
    brightBlue: "#6871ff",
    brightMagenta: "#ff76ff",
    brightCyan: "#5ffdff",
    brightWhite: "#feffff",
  },
  pro: {
    name: "Pro",
    background: "#1e1e1e",
    foreground: "#f2f2f2",
    cursor: "#4d4d4c",
    cursorAccent: "#f2f2f2",
    selectionBackground: "#414453",
    selectionForeground: "#f2f2f2",
    black: "#000000",
    red: "#ff6057",
    green: "#2cde5a",
    yellow: "#f3f99d",
    blue: "#579df4",
    magenta: "#ff6ab3",
    cyan: "#4fb4d8",
    white: "#d0d0d0",
    brightBlack: "#8e8e8e",
    brightRed: "#ff6057",
    brightGreen: "#2cde5a",
    brightYellow: "#f3f99d",
    brightBlue: "#579df4",
    brightMagenta: "#ff6ab3",
    brightCyan: "#4fb4d8",
    brightWhite: "#ffffff",
  },
  grass: {
    name: "Grass",
    background: "#13773d",
    foreground: "#d9fadf",
    cursor: "#73fa91",
    cursorAccent: "#13773d",
    selectionBackground: "#73fa91",
    selectionForeground: "#13773d",
    black: "#0a3820",
    red: "#ff6b6b",
    green: "#c1ffc1",
    yellow: "#fcf5ae",
    blue: "#89cff0",
    magenta: "#ffa0f0",
    cyan: "#76eec6",
    white: "#d9fadf",
    brightBlack: "#537a5a",
    brightRed: "#ff8787",
    brightGreen: "#d4ffd4",
    brightYellow: "#fffacd",
    brightBlue: "#a9dfff",
    brightMagenta: "#ffb8f0",
    brightCyan: "#a0f0d6",
    brightWhite: "#ffffff",
  },
  homebrew: {
    name: "Homebrew",
    background: "#000000",
    foreground: "#00ff00",
    cursor: "#00ff00",
    cursorAccent: "#000000",
    selectionBackground: "#00ff00",
    selectionForeground: "#000000",
    black: "#000000",
    red: "#ff0000",
    green: "#00ff00",
    yellow: "#ffff00",
    blue: "#0000ff",
    magenta: "#ff00ff",
    cyan: "#00ffff",
    white: "#c7c7c7",
    brightBlack: "#666666",
    brightRed: "#ff3333",
    brightGreen: "#33ff33",
    brightYellow: "#ffff33",
    brightBlue: "#3333ff",
    brightMagenta: "#ff33ff",
    brightCyan: "#33ffff",
    brightWhite: "#ffffff",
  },
  ocean: {
    name: "Ocean",
    background: "#224fbc",
    foreground: "#ffffff",
    cursor: "#7cc4fa",
    cursorAccent: "#224fbc",
    selectionBackground: "#41689a",
    selectionForeground: "#ffffff",
    black: "#14305a",
    red: "#ff6b6b",
    green: "#69ff94",
    yellow: "#ffffa5",
    blue: "#93ddfd",
    magenta: "#d783ff",
    cyan: "#89efef",
    white: "#c7d1db",
    brightBlack: "#557799",
    brightRed: "#ff8787",
    brightGreen: "#89ffab",
    brightYellow: "#ffffbb",
    brightBlue: "#b3edff",
    brightMagenta: "#e8a3ff",
    brightCyan: "#a9ffff",
    brightWhite: "#ffffff",
  },
};

function buildXtermTheme(profile) {
  return {
    background: profile.background,
    foreground: profile.foreground,
    cursor: profile.cursor,
    cursorAccent: profile.cursorAccent,
    selectionBackground: profile.selectionBackground,
    selectionForeground: profile.selectionForeground,
    black: profile.black,
    red: profile.red,
    green: profile.green,
    yellow: profile.yellow,
    blue: profile.blue,
    magenta: profile.magenta,
    cyan: profile.cyan,
    white: profile.white,
    brightBlack: profile.brightBlack,
    brightRed: profile.brightRed,
    brightGreen: profile.brightGreen,
    brightYellow: profile.brightYellow,
    brightBlue: profile.brightBlue,
    brightMagenta: profile.brightMagenta,
    brightCyan: profile.brightCyan,
    brightWhite: profile.brightWhite,
  };
}

function getSavedProfileId() {
  return storageService.getItem(STORAGE_KEY_TERMINAL_PROFILE, "basic");
}

function saveProfileId(profileId) {
  storageService.setItem(STORAGE_KEY_TERMINAL_PROFILE, profileId);
}

export { TERMINAL_PROFILES };

export default function TerminalApp({ onClose }) {
  const osContext = useOS();
  const containerRef = useRef(null);
  const termInstanceRef = useRef(null);
  const fitAddonRef = useRef(null);

  const [activeProfileId, setActiveProfileId] = useState(getSavedProfileId);

  const osContextRef = useRef(osContext);
  useEffect(() => {
    osContextRef.current = osContext;
  }, [osContext]);

  const changeProfile = useCallback((profileId) => {
    const profile = TERMINAL_PROFILES[profileId];
    if (!profile) return false;

    setActiveProfileId(profileId);
    saveProfileId(profileId);

    if (termInstanceRef.current) {
      termInstanceRef.current.options.theme = buildXtermTheme(profile);
    }
    return true;
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const profile = TERMINAL_PROFILES[activeProfileId] || TERMINAL_PROFILES.basic;

    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: "block",
      fontSize: 13,
      lineHeight: 1.25,
      fontFamily:
        "'Menlo', 'Monaco', 'Cascadia Code', 'SF Mono', 'Consolas', 'DejaVu Sans Mono', 'Courier New', monospace",
      theme: buildXtermTheme(profile),
      convertEol: true,
      allowTransparency: false,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    fitAddon.fit();

    termInstanceRef.current = term;
    fitAddonRef.current = fitAddon;

    let lineBuffer = "";
    const commandHistory = [];
    let historyIndex = -1;

    const promptText = () => `${getPrompt()} `;

    term.writeln("Payaman OS Terminal (Powered by xterm.js)");
    term.writeln("Type 'help' for a list of available commands.");
    term.writeln("");
    term.write(promptText());

    const handleData = async (data) => {
      if (data === "\r") {
        term.write("\r\n");
        const cmdToRun = lineBuffer.trim();

        if (cmdToRun) {
          commandHistory.push(cmdToRun);
          historyIndex = -1;

          // Handle profile command internal
          if (cmdToRun.startsWith("profile")) {
            const profileArgs = cmdToRun.split(/\s+/).slice(1);
            if (profileArgs.length === 0) {
              const profileIds = Object.keys(TERMINAL_PROFILES);
              term.writeln(`Active profile: ${activeProfileId}`);
              term.writeln("Available profiles: " + profileIds.join(", "));
              term.writeln("Usage: profile <name>");
            } else {
              const targetId = profileArgs[0].toLowerCase();
              if (TERMINAL_PROFILES[targetId]) {
                changeProfile(targetId);
                term.writeln(`Terminal profile changed to: ${TERMINAL_PROFILES[targetId].name}`);
              } else {
                term.writeln(
                  `Profile '${profileArgs[0]}' not found. Available: ${Object.keys(TERMINAL_PROFILES).join(", ")}`
                );
              }
            }
          } else {
            const outputs = await executeShellCommand(cmdToRun, {
              osContext: osContextRef.current,
              onClose,
            });

            if (outputs === "__CLEAR__") {
              term.clear();
            } else if (Array.isArray(outputs)) {
              outputs.forEach((line) => {
                term.writeln(line);
              });
            }
          }
        }

        lineBuffer = "";
        term.write(promptText());
        return;
      }

      if (data === "\u007F" || data === "\b") {
        if (lineBuffer.length > 0) {
          lineBuffer = lineBuffer.slice(0, -1);
          term.write("\b \b");
        }
        return;
      }

      if (data === "\u001b[A") {
        if (commandHistory.length === 0) return;
        const nextIndex =
          historyIndex === -1
            ? commandHistory.length - 1
            : Math.max(0, historyIndex - 1);
        historyIndex = nextIndex;
        const prevCmd = commandHistory[nextIndex] || "";

        term.write("\b \b".repeat(lineBuffer.length));
        lineBuffer = prevCmd;
        term.write(prevCmd);
        return;
      }

      if (data === "\u001b[B") {
        if (historyIndex === -1) return;
        const nextIndex = historyIndex + 1;

        term.write("\b \b".repeat(lineBuffer.length));
        if (nextIndex >= commandHistory.length) {
          historyIndex = -1;
          lineBuffer = "";
        } else {
          historyIndex = nextIndex;
          const nextCmd = commandHistory[nextIndex] || "";
          lineBuffer = nextCmd;
          term.write(nextCmd);
        }
        return;
      }

      if (data === "\u0003") {
        term.writeln("^C");
        lineBuffer = "";
        historyIndex = -1;
        term.write(promptText());
        return;
      }

      if (data === "\u000c") {
        term.clear();
        term.write(promptText() + lineBuffer);
        return;
      }

      if (data.startsWith("\u001b")) {
        return;
      }

      lineBuffer += data;
      term.write(data);
    };

    const dataDisposable = term.onData(handleData);

    const resizeObserver = new ResizeObserver(() => {
      try {
        fitAddon.fit();
      } catch {}
    });
    resizeObserver.observe(containerRef.current);

    const focusTimer = setTimeout(() => {
      term.focus();
    }, 50);

    return () => {
      clearTimeout(focusTimer);
      dataDisposable.dispose();
      resizeObserver.disconnect();
      term.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);

  useEffect(() => {
    const handleMenuAction = (e) => {
      const { action } = e.detail || {};
      if (!action?.startsWith("terminal:profile_")) return;
      const profileId = action.replace("terminal:profile_", "");
      changeProfile(profileId);
    };
    window.addEventListener("payaman-menu-action", handleMenuAction);
    return () => window.removeEventListener("payaman-menu-action", handleMenuAction);
  }, [changeProfile]);

  const currentProfile = TERMINAL_PROFILES[activeProfileId] || TERMINAL_PROFILES.basic;

  return (
    <div
      onClick={() => termInstanceRef.current?.focus()}
      className="w-full h-full overflow-hidden cursor-text select-text -m-3 relative"
      style={{
        backgroundColor: currentProfile.background,
        padding: "8px",
        fontFamily:
          "'Menlo', 'Monaco', 'Cascadia Code', 'SF Mono', 'Consolas', 'DejaVu Sans Mono', 'Courier New', monospace",
      }}
    >
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
