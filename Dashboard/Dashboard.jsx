import { useState, useMemo } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Treemap,
} from "recharts";

/* ─────────────────────────────────────────────
   RAW DATA  (1,000건 샘플 → 파싱 후 집계)
   실제 CSV 전체를 파싱하면 무거우므로 인라인 요약 통계로 사용
 ───────────────────────────────────────────── */

// 전체 1000건 기준 통계 (CSV 분석 결과)
const RAW_REVIEWS = [
  { 카테고리: "배달", 감성: "긍정", 정확도: 99.8 },
  { 카테고리: "맛", 감성: "긍정", 정확도: 99.8 },
  { 카테고리: "배달", 감성: "부정", 정확도: 98.6 },
  { 카테고리: "일반", 감성: "애매", 정확도: 99.3 },
  { 카테고리: "배달", 감성: "긍정", 정확도: 99.4 },
  { 카테고리: "일반", 감성: "애매", 정확도: 99.8 },
  { 카테고리: "일반", 감성: "애매", 정확도: 99.8 },
  { 카테고리: "배달", 감성: "부정", 정확도: 99.4 },
  { 카테고리: "배달", 감성: "부정", 정확도: 99.3 },
  { 카테고리: "일반", 감성: "애매", 정확도: 99.8 },
];

// 집계된 전체 통계 데이터 (1000건 기준)
const TOTAL = 1000;

const sentimentData = [
  { name: "긍정", value: 312, color: "#22c55e" },
  { name: "부정", value: 381, color: "#ef4444" },
  { name: "애매", value: 307, color: "#f59e0b" },
];

const categoryData = [
  { category: "배달", 긍정: 98, 부정: 143, 애매: 12 },
  { category: "맛", 긍정: 72, 부정: 61, 애매: 8 },
  { category: "가격/양", 긍정: 24, 부정: 38, 애매: 5 },
  { category: "일반", 긍정: 88, 부정: 91, 애매: 257 },
  { category: "복합", 긍정: 30, 부정: 48, 애매: 25 },
];

const menuData = [
  { name: "기타", size: 891, 긍정: 285, 부정: 348, 애매: 258 },
  { name: "패스트푸드", size: 42, 긍정: 14, 부정: 21, 애매: 7 },
  { name: "분식", size: 28, 긍정: 7, 부정: 16, 애매: 5 },
  { name: "카페 및 디저트", size: 22, 긍정: 4, 부정: 5, 애매: 13 },
  { name: "한식", size: 10, 긍정: 1, 부정: 6, 애매: 3 },
  { name: "기타메뉴", size: 7, 긍정: 1, 부정: 5, 애매: 1 },
];

const radarData = [
  { subject: "배달 긍정", A: 98, fullMark: 150 },
  { subject: "맛 긍정", A: 72, fullMark: 150 },
  { subject: "가격 긍정", A: 24, fullMark: 150 },
  { subject: "배달 부정", A: 143, fullMark: 150 },
  { subject: "맛 부정", A: 61, fullMark: 150 },
  { subject: "가격 부정", A: 38, fullMark: 150 },
];

const accuracyDist = [
  { range: "60~70%", count: 2 },
  { range: "70~80%", count: 1 },
  { range: "80~85%", count: 4 },
  { range: "85~90%", count: 8 },
  { range: "90~95%", count: 21 },
  { range: "95~98%", count: 48 },
  { range: "98~99%", count: 97 },
  { range: "99~100%", count: 819 },
];

const SAMPLE_REVIEWS = [
  { text: "배달어플 처음 써보는데 편하고 좋네요.", 카테고리: "배달", 감성: "긍정", 정확도: "99.8%" },
  { text: "음식이 다 돼도 30분동안 배달기사 픽업이 안 되는데 무슨 음식을 시켜먹으라는 건가요", 카테고리: "배달", 감성: "부정", 정확도: "99.3%" },
  { text: "지구 뿌시는 맛이에요. 식감이 정말 예술이네요. 평생 장사해 주세요.", 카테고리: "맛", 감성: "긍정", 정확도: "99.8%" },
  { text: "쿠팡이츠 사용하지마세요. 자기네들 실수를 고객의 손해로 마무리합니다.", 카테고리: "배달", 감성: "부정", 정확도: "99.4%" },
  { text: "1인분인데 양이 심각하게 작아요ㅠㅠ", 카테고리: "가격/양", 감성: "부정", 정확도: "99.5%" },
  { text: "내 끼니를 책임지는. 배민클럽이 유용해서 좋습니다", 카테고리: "일반", 감성: "애매", 정확도: "99.8%" },
  { text: "여긴 찐입니다. 이 가격에 이 퀄리티라니. 최고예요 진짜.", 카테고리: "가격/양", 감성: "긍정", 정확도: "99.8%" },
  { text: "30분 동안 네트워크 불안정만 뜨는거 보고 지움", 카테고리: "배달", 감성: "부정", 정확도: "99.4%" },
];

/* ─── 커스텀 툴팁 ─── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(255,255,255,0.98)", border: "1px solid rgba(99,102,241,0.2)",
      borderRadius: 10, padding: "10px 16px", fontSize: 13, color: "#0f172a",
       boxShadow: "0 8px 32px rgba(0,0,0,0.12)"
    }}>
      {label && <p style={{ fontWeight: 700, marginBottom: 6, color: "#4f46e5" }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || "#0f172a", margin: "2px 0" }}>
          {p.name}: <strong>{p.value}</strong>
          {p.name?.includes("정확도") ? "%" : "건"}
        </p>
      ))}
    </div>
  );
};

/* ─── KPI 카드 ─── */
const KPICard = ({ icon, label, value, sub, accent }) => (
  <div style={{
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    border: `1px solid ${accent}25`,
    borderRadius: 16, padding: "22px 24px",
    position: "relative", overflow: "hidden",
    boxShadow: `0 4px 20px ${accent}12, 0 1px 4px rgba(0,0,0,0.06)`,
  }}>
    <div style={{
      position: "absolute", top: -20, right: -20,
      width: 80, height: 80, borderRadius: "50%",
      background: `radial-gradient(circle, ${accent}25, transparent 70%)`,
    }} />
    <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
    <div style={{ fontSize: 32, fontWeight: 900, color: accent, fontFamily: "monospace", lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: 14, color: "#475569", marginTop: 6, fontWeight: 600 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{sub}</div>}
  </div>
);

/* ─── 섹션 타이틀 ─── */
const SectionTitle = ({ title, sub }) => (
  <div style={{ marginBottom: 20 }}>
    <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>{title}</h2>
    {sub && <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{sub}</p>}
  </div>
);

/* ─── 메인 앱 ─── */
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeSentiment, setActiveSentiment] = useState(null);
  const [reviewFilter, setReviewFilter] = useState("전체");

  const filteredReviews = useMemo(() =>
    reviewFilter === "전체" ? SAMPLE_REVIEWS : SAMPLE_REVIEWS.filter(r => r.감성 === reviewFilter),
    [reviewFilter]
  );

  const tabs = [
    { id: "overview", label: "📊 전체 개요" },
    { id: "category", label: "🏷️ 카테고리 분석" },
    { id: "accuracy", label: "🎯 정확도 분포" },
    { id: "reviews", label: "💬 리뷰 샘플" },
  ];

  const sentimentTotal = sentimentData.reduce((a, b) => a + b.value, 0);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #f0f4ff 100%)",
      fontFamily: "'Noto Sans KR', 'Segoe UI', sans-serif",
      color: "#0f172a",
      padding: "32px 24px",
      position: "relative",
    }}>
      {/* 배경 그리드 */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        backgroundImage: "linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)",
        backgroundSize: "48px 48px", pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.35)",
            borderRadius: 50, padding: "5px 18px", marginBottom: 16,
            fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#818cf8",
          }}>
            🚀 AI Sentiment Analysis
          </div>
          <h1 style={{
            fontSize: "clamp(26px,4vw,46px)", fontWeight: 900, margin: "0 0 10px",
            background: "linear-gradient(90deg, #4f46e5, #059669, #db2777)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.05))",
          }}>
            배달 앱 리뷰 감성 분석 대시보드
          </h1>
          <p style={{ color: "#64748b", fontSize: 15 }}>
            총 <strong style={{ color: "#818cf8" }}>1,000건</strong> · RoBERTa + LangGraph 기반 분석
          </p>
        </div>

        {/* ── KPI ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 32 }}>
          <KPICard icon="📦" label="전체 리뷰 수" value="1,000" sub="배달 앱 리뷰 총합" accent="#818cf8" />
          <KPICard icon="😊" label="긍정 리뷰" value={`${((312/1000)*100).toFixed(1)}%`} sub="312건" accent="#34d399" />
          <KPICard icon="😤" label="부정 리뷰" value={`${((381/1000)*100).toFixed(1)}%`} sub="381건" accent="#f87171" />
          <KPICard icon="😐" label="애매 리뷰" value={`${((307/1000)*100).toFixed(1)}%`} sub="307건" accent="#fbbf24" />
          <KPICard icon="🎯" label="평균 정확도" value="99.1%" sub="모델 신뢰도" accent="#38bdf8" />
        </div>

        {/* ── TABS ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: "9px 20px", borderRadius: 10, border: "1px solid",
              borderColor: activeTab === t.id ? "rgba(129,140,248,0.7)" : "rgba(99,102,241,0.2)",
              background: activeTab === t.id ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.8)",
              color: activeTab === t.id ? "#4f46e5" : "#64748b",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              transition: "all .2s", backdropFilter: "blur(6px)",
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB: 전체 개요 ── */}
        {activeTab === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

              {/* 파이 차트 */}
              <div style={{
                background: "#ffffff", border: "1px solid rgba(99,102,241,0.15)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                borderRadius: 18, padding: 28, 
              }}>
                <SectionTitle title="감성 분포" sub="전체 1,000건 기준" />
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%" cy="50%"
                      innerRadius={70} outerRadius={110}
                      paddingAngle={4}
                      dataKey="value"
                      onMouseEnter={(_, i) => setActiveSentiment(i)}
                      onMouseLeave={() => setActiveSentiment(null)}
                    >
                      {sentimentData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.color}
                          opacity={activeSentiment === null || activeSentiment === i ? 1 : 0.35}
                          stroke={activeSentiment === i ? "#fff" : "transparent"}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 8 }}>
                  {sentimentData.map((d, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color }} />
                      <span style={{ color: "#64748b" }}>{d.name}</span>
                      <strong style={{ color: d.color }}>{((d.value / sentimentTotal) * 100).toFixed(1)}%</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* 카테고리 바 차트 요약 */}
              <div style={{
                background: "#ffffff", border: "1px solid rgba(99,102,241,0.15)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                borderRadius: 18, padding: 28, 
              }}>
                <SectionTitle title="카테고리별 감성 분포" sub="복합 카테고리 포함" />
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={categoryData} margin={{ top: 5, right: 40, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                    <XAxis dataKey="category" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12, color: "#64748b" }} />
                    <Bar dataKey="긍정" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="부정" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="애매" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 레이더 + 트리맵 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{
                background: "#ffffff", border: "1px solid rgba(99,102,241,0.15)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                borderRadius: 18, padding: 28, 
              }}>
                <SectionTitle title="카테고리 감성 레이더" sub="긍/부정 패턴 시각화" />
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(148,163,184,0.25)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <PolarRadiusAxis tick={{ fill: "#475569", fontSize: 10 }} />
                    <Radar name="건수" dataKey="A" stroke="#818cf8" fill="#818cf8" fillOpacity={0.25} strokeWidth={2} />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div style={{
                background: "#ffffff", border: "1px solid rgba(99,102,241,0.15)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                borderRadius: 18, padding: 28, 
              }}>
                <SectionTitle title="메뉴 카테고리 트리맵" sub="리뷰 건수 비율" />
                <ResponsiveContainer width="100%" height={280}>
                  <Treemap
                    data={menuData}
                    dataKey="size"
                    aspectRatio={4 / 3}
                    stroke="rgba(255,255,255,0.9)"
                    content={({ x, y, width, height, name, size }) => {
                      const colors = ["#818cf8","#34d399","#f472b6","#fbbf24","#38bdf8","#a78bfa"];
                      const idx = menuData.findIndex(d => d.name === name);
                      return (
                        <g>
                          <rect x={x} y={y} width={width} height={height}
                            fill={colors[idx % colors.length]} rx={6} opacity={0.8} />
                          {width > 40 && height > 30 && (
                            <text x={x + width / 2} y={y + height / 2}
                              textAnchor="middle" dominantBaseline="middle"
                              fill="#fff" fontSize={width > 80 ? 13 : 10} fontWeight={700}>
                              {name}
                            </text>
                          )}
                          {width > 60 && height > 50 && (
                            <text x={x + width / 2} y={y + height / 2 + 16}
                              textAnchor="middle" dominantBaseline="middle"
                              fill="rgba(255,255,255,0.7)" fontSize={10}>
                              {size}건
                            </text>
                          )}
                        </g>
                      );
                    }}
                  >
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const raw = payload[0]?.payload;
                        const d = menuData.find(m => m.name === raw?.name) || raw;
                        if (!d) return null;
                        const colors = ["#818cf8","#34d399","#f472b6","#fbbf24","#38bdf8","#a78bfa"];
                        const idx = menuData.findIndex(m => m.name === d.name);
                        const accent = colors[idx % colors.length];
                        return (
                          <div style={{
                            background: "rgba(255,255,255,0.98)",
                            border: `1px solid ${accent}50`,
                            borderRadius: 12, padding: "12px 16px",
                            boxShadow: `0 8px 32px ${accent}30, 0 2px 8px rgba(0,0,0,0.1)`,
                            fontSize: 13, color: "#0f172a", minWidth: 160,
                          }}>
                            <div style={{ fontWeight: 800, color: accent, marginBottom: 8, fontSize: 14 }}>
                              {d.name}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                                <span style={{ color: "#64748b" }}>📦 전체</span>
                                <strong style={{ color: "#0f172a" }}>{d.size}건</strong>
                              </div>
                              <div style={{ height: 1, background: "rgba(0,0,0,0.06)", margin: "2px 0" }} />
                              <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                                <span style={{ color: "#64748b" }}>😊 긍정</span>
                                <strong style={{ color: "#22c55e" }}>{d.긍정}건</strong>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                                <span style={{ color: "#64748b" }}>😤 부정</span>
                                <strong style={{ color: "#ef4444" }}>{d.부정}건</strong>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                                <span style={{ color: "#64748b" }}>😐 애매</span>
                                <strong style={{ color: "#f59e0b" }}>{d.애매}건</strong>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                  </Treemap>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: 카테고리 분석 ── */}
        {activeTab === "category" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{
              background: "#ffffff", border: "1px solid rgba(99,102,241,0.15)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              borderRadius: 18, padding: 28, 
            }}>
              <SectionTitle title="카테고리별 부정 비율" sub="개선 필요 영역 파악" />
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 60, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="category" type="category" tick={{ fill: "#94a3b8", fontSize: 13 }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="부정" fill="#f87171" radius={[0, 6, 6, 0]}>
                    {categoryData.map((d, i) => (
                      <Cell key={i}
                        fill={d.부정 > 100 ? "#ef4444" : d.부정 > 50 ? "#f87171" : "#fca5a5"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{
              background: "#ffffff", border: "1px solid rgba(99,102,241,0.15)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              borderRadius: 18, padding: 28, 
            }}>
              <SectionTitle title="카테고리별 긍정 비율" sub="강점 영역 파악" />
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 60, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="category" type="category" tick={{ fill: "#94a3b8", fontSize: 13 }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="긍정" radius={[0, 6, 6, 0]}>
                    {categoryData.map((d, i) => (
                      <Cell key={i}
                        fill={d.긍정 > 80 ? "#22c55e" : d.긍정 > 40 ? "#4ade80" : "#86efac"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 카테고리 인사이트 카드 */}
            <div style={{
              gridColumn: "1 / -1",
              background: "#ffffff", border: "1px solid rgba(99,102,241,0.15)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              borderRadius: 18, padding: 28, 
            }}>
              <SectionTitle title="카테고리 핵심 인사이트" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
                {[
                  { icon: "🚚", title: "배달", text: "가장 많은 리뷰(253건). 부정 비율 56.5%로 핵심 개선 과제", accent: "#f87171" },
                  { icon: "🍽️", title: "맛", text: "141건 중 긍정 51%, 부정 43%. 비교적 균형잡힌 분포", accent: "#fbbf24" },
                  { icon: "💰", title: "가격/양", text: "67건 중 부정 비율 56.7%. 가성비 불만이 지배적", accent: "#f97316" },
                  { icon: "📋", title: "일반(앱/서비스)", text: "436건 중 애매 59%. 감성 판단 어려운 기능 관련 리뷰 다수", accent: "#818cf8" },
                ].map((c, i) => (
                  <div key={i} style={{
                    background: `${c.accent}10`, border: `1px solid ${c.accent}30`,
                    borderRadius: 12, padding: "16px 18px",
                  }}>
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{c.icon}</div>
                    <div style={{ fontWeight: 800, color: c.accent, marginBottom: 6 }}>{c.title}</div>
                    <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>{c.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: 정확도 분포 ── */}
        {activeTab === "accuracy" && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
            <div style={{
              background: "#ffffff", border: "1px solid rgba(99,102,241,0.15)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              borderRadius: 18, padding: 28, 
            }}>
              <SectionTitle title="모델 정확도 분포" sub="RoBERTa + LangGraph 기반 신뢰도" />
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={accuracyDist} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis dataKey="range" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="리뷰 수" radius={[6, 6, 0, 0]}>
                    {accuracyDist.map((d, i) => (
                      <Cell key={i}
                        fill={i >= 6 ? "#818cf8" : i >= 4 ? "#38bdf8" : "#f87171"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "99~100% 구간", val: "819건", pct: "81.9%", color: "#818cf8" },
                { label: "98~99% 구간", val: "97건", pct: "9.7%", color: "#38bdf8" },
                { label: "95~98% 구간", val: "48건", pct: "4.8%", color: "#34d399" },
                { label: "90~95% 구간", val: "21건", pct: "2.1%", color: "#fbbf24" },
                { label: "90% 미만", val: "15건", pct: "1.5%", color: "#f87171" },
              ].map((r, i) => (
                <div key={i} style={{
                  background: "#ffffff", border: `1px solid ${r.color}25`,
                  borderRadius: 12, padding: "14px 18px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: 13, color: "#475569" }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{r.val}</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: r.color, fontFamily: "monospace" }}>{r.pct}</div>
                </div>
              ))}

              <div style={{
                background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.25)",
                borderRadius: 12, padding: "16px 18px", marginTop: 4,
              }}>
                <div style={{ fontSize: 12, color: "#34d399", fontWeight: 700, marginBottom: 6 }}>✅ 모델 신뢰도 요약</div>
                <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.7 }}>
                  전체의 <strong style={{ color: "#34d399" }}>91.6%</strong>가 98% 이상 정확도를 기록. 
                  Fail-safe 보정 로직으로 극단적 오분류 방지.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: 리뷰 샘플 ── */}
        {activeTab === "reviews" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              {["전체", "긍정", "부정", "애매"].map(f => (
                <button key={f} onClick={() => setReviewFilter(f)} style={{
                  padding: "7px 18px", borderRadius: 8, border: "1px solid",
                  borderColor: reviewFilter === f ? (f === "긍정" ? "#22c55e" : f === "부정" ? "#ef4444" : f === "애매" ? "#f59e0b" : "#818cf8") : "rgba(99,102,241,0.2)",
                  background: reviewFilter === f ? (f === "긍정" ? "rgba(34,197,94,0.15)" : f === "부정" ? "rgba(239,68,68,0.15)" : f === "애매" ? "rgba(245,158,11,0.15)" : "rgba(99,102,241,0.15)") : "transparent",
                  color: reviewFilter === f ? "#1e1b4b" : "#64748b",
                  fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all .2s",
                }}>
                  {f}
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 14 }}>
              {filteredReviews.map((r, i) => {
                const sentColor = r.감성 === "긍정" ? "#22c55e" : r.감성 === "부정" ? "#ef4444" : "#f59e0b";
                const catColors = { "배달": "#38bdf8", "맛": "#f472b6", "가격/양": "#fbbf24", "일반": "#94a3b8" };
                return (
                  <div key={i} style={{
                    background: "#ffffff", border: `1px solid ${sentColor}20`,
                    borderRadius: 14, padding: "18px 20px",
                     transition: "transform .2s, box-shadow .2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 32px ${sentColor}20`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span style={{
                          background: `${sentColor}20`, color: sentColor, border: `1px solid ${sentColor}40`,
                          borderRadius: 6, padding: "2px 10px", fontSize: 11, fontWeight: 700,
                        }}>{r.감성}</span>
                        <span style={{
                          background: `${catColors[r.카테고리] || "#64748b"}15`, color: catColors[r.카테고리] || "#64748b",
                          border: `1px solid ${catColors[r.카테고리] || "#64748b"}30`,
                          borderRadius: 6, padding: "2px 10px", fontSize: 11, fontWeight: 600,
                        }}>{r.카테고리}</span>
                      </div>
                      <span style={{ fontSize: 12, color: "#38bdf8", fontFamily: "monospace", fontWeight: 700 }}>
                        {r.정확도}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.7, margin: 0 }}>{r.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{
          marginTop: 48, textAlign: "center",
          fontSize: 12, color: "#94a3b8",
          borderTop: "1px solid rgba(99,102,241,0.15)", paddingTop: 24,
        }}>
          RoBERTa Fine-tuned + LangGraph Agent · 도메인 특화 키워드 사전 · Fail-safe 보정 로직 적용
        </div>

      </div>
    </div>
  );
}
