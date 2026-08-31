import { useState, useEffect } from "react";

const DATES = [
  { id: "oct12", label: "10월 12일", day: "월요일" },
  { id: "oct13", label: "10월 13일", day: "화요일" },
];

const STORAGE_KEY = "agent-workshop-oct-survey:responses";

export default function WorkshopSurvey() {
  const [selected, setSelected] = useState([]);
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [tally, setTally] = useState({ oct12: 0, oct13: 0 });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("form");

  useEffect(() => {
    loadTally();
  }, []);

  async function loadTally() {
    try {
      const res = await window.storage.get(STORAGE_KEY, true);
      const list = res ? JSON.parse(res.value) : [];
      computeTally(list);
    } catch {
      computeTally([]);
    }
  }

  function computeTally(list) {
    const t = { oct12: 0, oct13: 0 };
    list.forEach((r) => {
      (r.dates || []).forEach((d) => {
        if (t[d] !== undefined) t[d] += 1;
      });
    });
    setTally(t);
    setTotal(list.length);
  }

  function toggleDate(id) {
    setError("");
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  }

  async function handleSubmit() {
    if (selected.length === 0) {
      setError("가능한 날짜를 하나 이상 선택해주세요.");
      return;
    }
    if (!name.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      let list = [];
      try {
        const res = await window.storage.get(STORAGE_KEY, true);
        list = res ? JSON.parse(res.value) : [];
      } catch {
        list = [];
      }
      list.push({
        dates: selected,
        name: name.trim(),
        org: org.trim(),
        submittedAt: new Date().toISOString(),
      });
      await window.storage.set(STORAGE_KEY, JSON.stringify(list), true);
      computeTally(list);
      setSubmitted(true);
    } catch {
      setError("제출 중 문제가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  const mono = "ui-monospace, SFMono-Regular, 'Roboto Mono', Menlo, monospace";
  const sans = "-apple-system, BlinkMacSystemFont, 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif";
  const accent = "#FFC94D";
  const accentText = "#5A3D00";
  const white = "#FFFFFF";
  const whiteMuted = "rgba(255,255,255,0.72)";

  const containerStyle = {
    fontFamily: sans,
    position: "relative",
    minHeight: "100%",
    padding: "44px 20px",
    boxSizing: "border-box",
    color: white,
    overflow: "hidden",
    background:
      "radial-gradient(circle at 32% 38%, rgba(120,150,255,0.55), transparent 45%), linear-gradient(135deg, #1653C7 0%, #1147B5 28%, #2B3FC2 58%, #6B4FD6 82%, #8A5CE0 100%)",
  };

  const dotGrid = {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "radial-gradient(rgba(255,150,90,0.45) 1px, transparent 1.4px)",
    backgroundSize: "26px 26px",
    pointerEvents: "none",
  };

  const cardStyle = {
    position: "relative",
    maxWidth: 560,
    margin: "0 auto",
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.28)",
    borderRadius: 8,
    padding: "34px 30px",
    boxSizing: "border-box",
    backdropFilter: "blur(6px)",
  };

  return (
    <div style={containerStyle}>
      <div style={dotGrid} />

      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, lineHeight: 1.35, color: white }}>
            함께 만드는 AI Agent workshop
          </h1>
          <button
            type="button"
            onClick={() => setView(view === "form" ? "results" : "form")}
            style={{
              flexShrink: 0,
              marginLeft: 12,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.35)",
              borderRadius: 5,
              color: whiteMuted,
              fontSize: 12,
              padding: "6px 10px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {view === "form" ? "결과 확인" : "설문으로"}
          </button>
        </div>
        <p style={{ fontSize: 14, color: whiteMuted, margin: "0 0 26px", lineHeight: 1.6 }}>
          {view === "form"
            ? "참여 가능한 날짜를 모두 선택해주세요. 중복 선택이 가능합니다."
            : "지금까지의 응답 현황입니다."}
        </p>

        {view === "results" ? (
          <div>
            {DATES.map((d) => {
              const count = tally[d.id] || 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={d.id} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                    <span style={{ fontFamily: mono, color: white }}>
                      {d.label} ({d.day})
                    </span>
                    <span style={{ color: whiteMuted }}>
                      {count}명 · {pct}%
                    </span>
                  </div>
                  <div style={{ height: 10, background: "rgba(255,255,255,0.18)", borderRadius: 3, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: accent,
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop: 8, fontSize: 12, color: whiteMuted, fontFamily: mono }}>
              총 {total}명 참여 · 중복 선택 포함
            </div>
          </div>
        ) : !submitted ? (
          <>
            <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
              {DATES.map((d) => {
                const active = selected.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDate(d.id)}
                    style={{
                      flex: "1 1 200px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      cursor: "pointer",
                      textAlign: "left",
                      padding: "16px 16px",
                      borderRadius: 6,
                      border: `1.5px solid ${active ? accent : "rgba(255,255,255,0.35)"}`,
                      background: active ? "rgba(255,138,61,0.18)" : "rgba(255,255,255,0.06)",
                      transition: "border-color 0.15s ease, background 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        flexShrink: 0,
                        borderRadius: 4,
                        border: `1.5px solid ${active ? accent : "rgba(255,255,255,0.5)"}`,
                        background: active ? accent : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {active && (
                        <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                          <path d="M1 4.5L4 7.5L10 1" stroke={accentText} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div style={{ fontFamily: mono, fontSize: 12, color: active ? accent : whiteMuted, marginBottom: 4 }}>
                        {d.day}
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: white }}>{d.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 12, color: whiteMuted, marginBottom: 6 }}>이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  placeholder="홍길동"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "9px 10px",
                    fontSize: 14,
                    border: "1px solid rgba(255,255,255,0.35)",
                    borderRadius: 4,
                    fontFamily: sans,
                    background: "rgba(255,255,255,0.08)",
                    color: white,
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 12, color: whiteMuted, marginBottom: 6 }}>
                  소속 (선택)
                </label>
                <input
                  type="text"
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  placeholder="부서명"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "9px 10px",
                    fontSize: 14,
                    border: "1px solid rgba(255,255,255,0.35)",
                    borderRadius: 4,
                    fontFamily: sans,
                    background: "rgba(255,255,255,0.08)",
                    color: white,
                  }}
                />
              </div>
            </div>

            {error && (
              <div style={{ fontSize: 13, color: "#FFD7CC", marginTop: 10 }}>{error}</div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                marginTop: 22,
                width: "100%",
                padding: "13px 0",
                fontSize: 15,
                fontWeight: 700,
                color: accentText,
                background: accent,
                border: "none",
                borderRadius: 5,
                cursor: loading ? "default" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "제출 중" : "제출하기"}
            </button>

            <div style={{ marginTop: 16, fontSize: 12, color: whiteMuted, fontFamily: mono }}>
              지금까지 {total}명 참여
            </div>
          </>
        ) : (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: accent, marginBottom: 6 }}>
              제출이 완료되었습니다.
            </div>
            <p style={{ fontSize: 14, color: whiteMuted, marginBottom: 4 }}>
              참여해주셔서 감사합니다.
            </p>
            <button
              type="button"
              onClick={() => setView("results")}
              style={{
                marginTop: 14,
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.35)",
                borderRadius: 5,
                color: white,
                fontSize: 13,
                padding: "9px 14px",
                cursor: "pointer",
              }}
            >
              결과 확인하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
