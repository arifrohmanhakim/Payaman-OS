import { useState } from "react";
import { DEVELOPER_PROFILE } from "./portfolioData.js";

export default function PortfolioApp() {
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText("https://github.com/arifrohmanhakim");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[var(--os-bg)] text-[var(--os-fg)] font-mono text-xs select-none">
      {/* Top Profile Banner Header */}
      <div className="p-3.5 border-b-2 border-[var(--os-border)] bg-[var(--os-bg)] flex flex-col sm:flex-row items-center sm:items-start gap-3.5">
        {/* Monochrome Avatar Portrait */}
        <div className="relative shrink-0">
          <div className="w-18 h-18 border-2 border-[var(--os-border)] overflow-hidden shadow-[2px_2px_0px_var(--os-shadow)] bg-black">
            <img
              src={DEVELOPER_PROFILE.avatarUrl}
              alt={DEVELOPER_PROFILE.name}
              className="w-full h-full object-cover grayscale contrast-150 brightness-95"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-[var(--os-fg)] text-[var(--os-bg)] text-[9px] font-bold px-1 py-0.2 border border-[var(--os-border)]">
            DEV
          </div>
        </div>

        {/* Identity & Headline */}
        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h1 className="text-base font-black tracking-tight truncate">
              {DEVELOPER_PROFILE.name}
            </h1>
            <span className="text-[10px] px-1.5 py-0.5 border border-[var(--os-border)] font-semibold bg-[var(--os-fg)]/5 self-center sm:self-auto shrink-0">
              @{DEVELOPER_PROFILE.handle}
            </span>
          </div>

          <p className="text-xs font-bold opacity-90 mt-0.5">
            {DEVELOPER_PROFILE.role}
          </p>

          <p className="text-[11px] opacity-70 mt-0.5 flex items-center justify-center sm:justify-start gap-1">
            <span>📍 {DEVELOPER_PROFILE.location}</span>
            <span>•</span>
            <span>🌐 {DEVELOPER_PROFILE.website}</span>
          </p>

          {/* Action Links */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-2.5">
            <a
              href={DEVELOPER_PROFILE.github}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 bg-[var(--os-fg)] text-[var(--os-bg)] font-bold text-[11px] hover:opacity-90 active:scale-95 border border-[var(--os-border)] inline-flex items-center gap-1 shadow-[1px_1px_0px_var(--os-shadow)]"
            >
              <span>GitHub Profile</span>
              <span>↗</span>
            </a>

            <a
              href={DEVELOPER_PROFILE.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 bg-[var(--os-bg)] text-[var(--os-fg)] font-bold text-[11px] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] active:scale-95 border border-[var(--os-border)] inline-flex items-center gap-1 shadow-[1px_1px_0px_var(--os-shadow)]"
            >
              <span>LinkedIn</span>
              <span>↗</span>
            </a>

            <button
              type="button"
              onClick={handleCopyEmail}
              className="px-2.5 py-1 bg-[var(--os-bg)] text-[var(--os-fg)] font-bold text-[11px] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] active:scale-95 border border-[var(--os-border)] cursor-pointer shadow-[1px_1px_0px_var(--os-shadow)]"
            >
              {copiedLink ? "Copied URL!" : "Share Portfolio"}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Header Navigation */}
      <div className="flex border-b-2 border-[var(--os-border)] bg-[var(--os-bg)]">
        {[
          { id: "overview", label: "👤 Bio & Overview" },
          { id: "projects", label: "🚀 Projects (13)" },
          { id: "skills", label: "🛠 Tech Stack" },
          { id: "terminal", label: "⚡ CLI Commands" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 px-2 text-[11px] font-bold text-center border-r last:border-r-0 border-[var(--os-border)] cursor-pointer transition-none ${
              activeTab === tab.id
                ? "bg-[var(--os-fg)] text-[var(--os-bg)]"
                : "hover:bg-[var(--os-fg)]/10 text-[var(--os-fg)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-[var(--os-bg)]">
        {/* 1. Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-3.5">
            <div className="border border-[var(--os-border)] p-3 bg-[var(--os-fg)]/5 space-y-1.5">
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                About The Developer
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {DEVELOPER_PROFILE.bio}
              </p>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="border border-[var(--os-border)] p-2 text-center bg-[var(--os-bg)] shadow-[1px_1px_0px_var(--os-shadow)]">
                <div className="text-[10px] opacity-60">Public Repos</div>
                <div className="text-base font-black mt-0.5">
                  {DEVELOPER_PROFILE.stats.publicRepos}
                </div>
              </div>

              <div className="border border-[var(--os-border)] p-2 text-center bg-[var(--os-bg)] shadow-[1px_1px_0px_var(--os-shadow)]">
                <div className="text-[10px] opacity-60">Public Gists</div>
                <div className="text-base font-black mt-0.5">
                  {DEVELOPER_PROFILE.stats.gists}
                </div>
              </div>

              <div className="border border-[var(--os-border)] p-2 text-center bg-[var(--os-bg)] shadow-[1px_1px_0px_var(--os-shadow)]">
                <div className="text-[10px] opacity-60">Experience</div>
                <div className="text-base font-black mt-0.5">
                  {DEVELOPER_PROFILE.stats.experienceYears}
                </div>
              </div>

              <div className="border border-[var(--os-border)] p-2 text-center bg-[var(--os-bg)] shadow-[1px_1px_0px_var(--os-shadow)]">
                <div className="text-[10px] opacity-60">Location</div>
                <div className="text-xs font-bold mt-1">Yogyakarta</div>
              </div>
            </div>

            {/* Featured Highlights */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-70">
                Featured Highlights
              </div>
              <div className="space-y-2">
                {DEVELOPER_PROFILE.projects
                  .filter((p) => p.featured)
                  .map((project) => (
                    <div
                      key={project.id}
                      className="border border-[var(--os-border)] p-2.5 bg-[var(--os-bg)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-[1px_1px_0px_var(--os-shadow)]"
                    >
                      <div className="min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-xs truncate">
                            {project.title}
                          </span>
                          <span className="text-[10px] opacity-65">
                            {project.tagline}
                          </span>
                        </div>
                        <p className="text-[11px] opacity-80 mt-0.5 line-clamp-1">
                          {project.description}
                        </p>
                      </div>

                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 text-[10px] font-bold border border-[var(--os-border)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] self-start sm:self-center shrink-0"
                      >
                        GitHub ↗
                      </a>
                    </div>
                  ))}
              </div>
            </div>

            {/* Top Technical Competencies Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-70">
                  Key Competencies &amp; Strengths
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab("skills")}
                  className="text-[10px] font-bold opacity-75 hover:opacity-100 underline cursor-pointer"
                >
                  All Skills (16) →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    name: "Tailwind CSS & UI Architecture",
                    level: 95,
                    tag: "Mastery",
                  },
                  { name: "React 19 / Next.js", level: 92, tag: "Advanced" },
                  {
                    name: "SQLite & Virtual File System (VFS)",
                    level: 92,
                    tag: "Advanced",
                  },
                  {
                    name: "TypeScript / Modern JavaScript",
                    level: 90,
                    tag: "Advanced",
                  },
                ].map((s) => (
                  <div
                    key={s.name}
                    className="border border-[var(--os-border)] p-2 bg-[var(--os-bg)] space-y-1 shadow-[1px_1px_0px_var(--os-shadow)]"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold truncate text-[10.5px]">
                        {s.name}
                      </span>
                      <span className="font-mono font-bold text-[10px]">
                        {s.level}%
                      </span>
                    </div>
                    <div className="h-2 w-full border border-[var(--os-border)] bg-[var(--os-bg)] p-0.2">
                      <div
                        className="h-full bg-[var(--os-fg)]"
                        style={{ width: `${s.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. Projects Tab */}
        {activeTab === "projects" && (
          <div className="space-y-3">
            <div className="text-[11px] opacity-75">
              Open-source repositories and engineering projects by Arif Rohman
              Hakim:
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {DEVELOPER_PROFILE.projects.map((project) => (
                <div
                  key={project.id}
                  className="border-2 border-[var(--os-border)] p-2.5 bg-[var(--os-bg)] flex flex-col justify-between space-y-2 shadow-[2px_2px_0px_var(--os-shadow)]"
                >
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-black text-xs">
                        {project.title}
                      </span>
                      {project.featured && (
                        <span className="text-[9px] px-1 bg-[var(--os-fg)] text-[var(--os-bg)] font-bold uppercase">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-semibold opacity-70">
                      {project.tagline}
                    </div>
                    <p className="text-[11px] opacity-85 leading-snug">
                      {project.description}
                    </p>
                  </div>

                  <div className="pt-1.5 border-t border-[var(--os-border)]/30 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1">
                      {project.tech.map((t) => (
                        <span
                          key={t}
                          className="text-[9px] px-1 py-0.2 border border-[var(--os-border)]/40 opacity-75"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 text-[10px] font-bold border border-[var(--os-border)] hover:bg-[var(--os-fg)] hover:text-[var(--os-bg)] shrink-0"
                    >
                      Repo ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Skills Tab */}
        {activeTab === "skills" && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between text-[11px] opacity-75">
              <span>
                Core technical competencies and proficiency benchmarks:
              </span>
              <span className="text-[10px] font-bold">
                16 Skillsets Evaluated
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {DEVELOPER_PROFILE.skills.map((skillGroup) => (
                <div
                  key={skillGroup.category}
                  className="border-2 border-[var(--os-border)] p-3 bg-[var(--os-bg)] shadow-[2px_2px_0px_var(--os-shadow)] space-y-2.5"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-[var(--os-border)]/40">
                    <span className="text-[11px] font-black uppercase tracking-wider">
                      {skillGroup.category}
                    </span>
                    <span className="text-[9px] opacity-60">
                      {skillGroup.items.length} Techs
                    </span>
                  </div>

                  <div className="space-y-2">
                    {skillGroup.items.map((skill) => (
                      <div key={skill.name} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold truncate text-[11px]">
                            {skill.name}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[9px] px-1 py-0.2 border border-[var(--os-border)] font-semibold bg-[var(--os-fg)]/5">
                              {skill.tag}
                            </span>
                            <span className="font-mono font-bold w-7 text-right text-[10px]">
                              {skill.level}%
                            </span>
                          </div>
                        </div>

                        {/* Retro Segmented / Solid Progress Bar */}
                        <div className="h-2.5 w-full border border-[var(--os-border)] bg-[var(--os-bg)] p-0.5 overflow-hidden">
                          <div
                            className="h-full bg-[var(--os-fg)] transition-all duration-300"
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Terminal Guide Tab */}
        {activeTab === "terminal" && (
          <div className="space-y-3">
            <div className="text-[11px] opacity-75">
              You can explore developer details directly inside Payaman
              Terminal:
            </div>

            <div className="border-2 border-[var(--os-border)] bg-black text-green-400 p-3 font-mono text-xs space-y-2 shadow-[2px_2px_0px_var(--os-shadow)]">
              <div>
                <span className="text-white">arif@payaman:~$</span>{" "}
                <span className="text-yellow-300">whoami</span>
              </div>
              <div className="text-[11px] opacity-80 pl-2">
                Arif Rohman Hakim — Fullstack Software Engineer &amp; System
                Creator
              </div>

              <div>
                <span className="text-white">arif@payaman:~$</span>{" "}
                <span className="text-yellow-300">projects</span>
              </div>
              <div className="text-[11px] opacity-80 pl-2">
                Lists open-source repositories and live portfolio demos
              </div>

              <div>
                <span className="text-white">arif@payaman:~$</span>{" "}
                <span className="text-yellow-300">skills</span>
              </div>
              <div className="text-[11px] opacity-80 pl-2">
                Displays technical competencies and framework matrix
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Footer */}
      <footer className="px-3 py-1 border-t-2 border-[var(--os-border)] bg-[var(--os-bg)] flex justify-between items-center text-[10px] opacity-70">
        <span>Portfolio Module • Arif Rohman Hakim</span>
        <span>Yogyakarta, Indonesia</span>
      </footer>
    </div>
  );
}
