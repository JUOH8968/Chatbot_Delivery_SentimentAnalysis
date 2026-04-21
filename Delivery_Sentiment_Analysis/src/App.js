import React, { useState } from 'react';
import axios from 'axios';
import deliveryIcon from './delievery_icon.png';
import userIconFinal from './user.png';
import userIconHeader from './user-icon.png';
import bossIcon from './boss_icon_v2.png';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import './LandingPage.css';

function App() {
  const [view, setView] = useState('intro'); // 'intro' | 'landing' | 'chat'
  const [userType, setUserType] = useState(null); // 'consumer' | 'owner'
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '안녕하세요! 리뷰 내용을 분석하여 항목별 지표와 상세 이유를 알려드립니다.' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/analyze', {
        content: input,
        user_type: userType
      });
      const data = response.data;
      const botMessage = {
        role: 'assistant',
        content: `분석이 완료되었습니다.`,
        analysis: data
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = { role: 'assistant', content: '서버 연결에 실패했습니다. 백엔드(Port 8000) 상태를 확인해주세요.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const handleReset = (targetView) => {
    setMessages([{ role: 'assistant', content: '안녕하세요! 리뷰 내용을 분석하여 항목별 지표와 상세 이유를 알려드립니다.' }]);
    setUserType(null);
    setInput('');
    setView(targetView);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('답글이 클립보드에 복사되었습니다!');
  };

  const getConfidenceInfo = (score) => {
    if (score >= 90) return { label: '매우 높음', color: '#166534', sub: '(90% 이상 신뢰)' };
    if (score >= 70) return { label: '높음', color: '#1e40af', sub: '(70% 이상 신뢰)' };
    return { label: '보통', color: '#854d0e', sub: '(70% 미만)' };
  };

  // --- Styles ---
  const darkBg = '#121212';
  const cardBg = '#1e1e1e';
  const accentColor = '#3b82f6';
  const textColor = '#ffffff';
  const subTextColor = '#a0a0a0';

  // --- Intro View ---
  if (view === 'intro') {
    return (
      <div className="lp-root">
        {/* NAV */}
        <nav className="lp-nav">
          <div className="nav-logo">
            <div className="nav-logo-icon" style={{ backgroundColor: '#f4623a', borderRadius: '8px', padding: '6px' }}>
              <svg viewBox="0 0 18 18" fill="none" style={{ width: '18px', height: '18px' }}>
                <rect x="2" y="2" width="9" height="7" rx="2" stroke="white" strokeWidth="1.4" />
                <path d="M4 9 L3 12 L7 10.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="13" cy="12" r="3.5" stroke="white" strokeWidth="1.4" />
                <line x1="15.5" y1="14.5" x2="17" y2="16" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
            <span className="nav-logo-text">리뷰 <span style={{ color: '#f4623a' }}>AI</span></span>
          </div>
          <button className="nav-cta" onClick={() => setView('landing')}>무료로 시작하기</button>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot"></span>
            AI-Powered Review Analysis
          </div>
          <h1 className="hero-title">
            배달 리뷰,<br />
            <em>맛있게</em> 분석합니다
          </h1>
          <p className="hero-sub">리뷰 한 줄이 말하는 진짜 의미를 AI가 읽어드립니다. 긍정인지 부정인지, 어디가 문제인지 한눈에 파악하세요.</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => setView('landing')}>지금 무료로 시작하기 →</button>
            <button className="btn-secondary" onClick={() => {
              const el = document.querySelector('.preview-section');
              el && el.scrollIntoView({ behavior: 'smooth' });
            }}>미리보기 보기</button>
          </div>

          <div className="hero-illustration">
            <div className="food-strip">
              <div className="food-item float-1">
                <svg width="72" height="80" viewBox="0 0 72 80" fill="none">
                  <ellipse cx="36" cy="72" rx="22" ry="5" fill="#f0e6d6" opacity="0.6" />
                  <ellipse cx="36" cy="66" rx="28" ry="8" fill="#f5efe6" />
                  <ellipse cx="36" cy="64" rx="28" ry="8" fill="#fff" stroke="#ede5da" strokeWidth="1" />
                  <path d="M28 58 Q24 45 26 32 Q28 22 34 20 Q42 18 44 28 Q46 38 42 50 Q38 60 36 62Z" fill="#e8943a" />
                  <path d="M30 54 Q26 42 28 30 Q30 22 34 20 Q38 19 40 26 Q42 35 40 47 Q37 57 35 60Z" fill="#f4a84a" />
                  <rect x="34" y="58" width="5" height="14" rx="2.5" fill="#f0dcc8" />
                  <circle cx="36.5" cy="57" r="4" fill="#f0dcc8" />
                  <circle cx="36.5" cy="72" r="3.5" fill="#f0dcc8" />
                  <path d="M32 35 Q34 33 36 35" stroke="#c97a20" strokeWidth="1" strokeLinecap="round" fill="none" />
                  <path d="M35 42 Q37 40 39 42" stroke="#c97a20" strokeWidth="1" strokeLinecap="round" fill="none" />
                </svg>
                <span className="food-label">치킨</span>
              </div>
              <div className="food-item float-2">
                <svg width="80" height="88" viewBox="0 0 80 88" fill="none">
                  <ellipse cx="40" cy="80" rx="24" ry="5" fill="#f0e6d6" opacity="0.5" />
                  <path d="M10 68 Q40 10 70 68Z" fill="#e8a04a" />
                  <path d="M10 68 Q40 16 70 68 Q60 72 40 74 Q20 72 10 68Z" fill="#d4833a" />
                  <path d="M16 62 Q40 20 64 62Z" fill="#f5c842" />
                  <circle cx="30" cy="50" r="5" fill="#e05030" opacity="0.7" />
                  <circle cx="50" cy="44" r="4" fill="#e05030" opacity="0.7" />
                  <circle cx="40" cy="58" r="3.5" fill="#e05030" opacity="0.7" />
                  <ellipse cx="34" cy="47" rx="3" ry="2" fill="#8b2020" transform="rotate(-20 34 47)" />
                  <ellipse cx="48" cy="52" rx="3" ry="2" fill="#8b2020" transform="rotate(15 48 52)" />
                  <circle cx="40" cy="42" r="2.5" fill="#2d7a4f" />
                  <circle cx="44" cy="56" r="2" fill="#2d7a4f" />
                </svg>
                <span className="food-label">피자</span>
              </div>
              <div className="food-item float-3">
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                  <ellipse cx="50" cy="90" rx="32" ry="7" fill="#f0e6d6" opacity="0.5" />
                  <path d="M18 50 Q18 85 50 88 Q82 85 82 50Z" fill="#fff" stroke="#ede5da" strokeWidth="1.5" />
                  <ellipse cx="50" cy="50" rx="32" ry="9" fill="#f7f0e8" stroke="#ede5da" strokeWidth="1.5" />
                  <ellipse cx="50" cy="50" rx="28" ry="7" fill="#f4a030" opacity="0.35" />
                  <path d="M28 52 Q35 48 42 52 Q49 56 56 52 Q63 48 72 52" stroke="#f0c060" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <path d="M26 56 Q33 52 40 56 Q47 60 54 56 Q61 52 70 56" stroke="#e8b040" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <path d="M30 60 Q38 56 46 60 Q54 64 62 60 Q68 56 74 60" stroke="#f0c060" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <ellipse cx="64" cy="47" rx="9" ry="7" fill="#fff9e8" stroke="#f0d080" strokeWidth="1" />
                  <ellipse cx="64" cy="47" rx="5" ry="4" fill="#f5a820" />
                  <path d="M35 44 Q37 41 39 44" stroke="#2d7a4f" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <path d="M40 43 Q42 40 44 43" stroke="#2d7a4f" strokeWidth="2" strokeLinecap="round" fill="none" />
                  <path d="M42 36 Q40 30 42 24" stroke="#e8943a" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.35" />
                  <path d="M50 34 Q48 27 50 20" stroke="#e8943a" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.35" />
                  <path d="M58 36 Q56 30 58 24" stroke="#e8943a" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.35" />
                </svg>
                <span className="food-label">라면</span>
              </div>
              {/* 버거 */}
              <div className="food-item float-4">
                <svg width="80" height="88" viewBox="0 0 80 88" fill="none">
                  <ellipse cx="40" cy="80" rx="24" ry="5" fill="#f0e6d6" opacity="0.5" />
                  <ellipse cx="40" cy="72" rx="28" ry="8" fill="#e8943a" />
                  <ellipse cx="40" cy="70" rx="28" ry="8" fill="#f5a84a" />
                  <path d="M14 62 Q20 58 26 62 Q32 66 38 62 Q44 58 50 62 Q56 66 62 62 Q66 60 66 62 Q66 65 60 67 Q40 70 20 67 Q14 65 14 62Z" fill="#4a9a30" />
                  <path d="M16 57 Q18 54 22 55 Q28 56 34 54 Q40 52 46 54 Q52 56 58 55 Q62 54 64 57 Q64 61 40 62 Q16 61 16 57Z" fill="#e05030" />
                  <path d="M13 52 L18 48 L62 48 L67 52 L67 55 Q40 57 13 55Z" fill="#f5c030" />
                  <ellipse cx="40" cy="48" rx="27" ry="7" fill="#6b3020" />
                  <ellipse cx="40" cy="46" rx="27" ry="7" fill="#7a3828" />
                  <path d="M14 40 Q14 20 40 18 Q66 20 66 40 Q66 44 40 46 Q14 44 14 40Z" fill="#e8943a" />
                  <path d="M16 40 Q16 22 40 20 Q64 22 64 40 Q64 43 40 45 Q16 43 16 40Z" fill="#f5a84a" />
                  <ellipse cx="30" cy="30" rx="3" ry="1.5" fill="#f0c060" transform="rotate(-15 30 30)" />
                  <ellipse cx="42" cy="25" rx="3" ry="1.5" fill="#f0c060" transform="rotate(10 42 25)" />
                  <ellipse cx="52" cy="31" rx="3" ry="1.5" fill="#f0c060" transform="rotate(-5 52 31)" />
                </svg>
                <span className="food-label">버거</span>
              </div>
              {/* 떡볶이 */}
              <div className="food-item float-5">
                <svg width="72" height="80" viewBox="0 0 72 80" fill="none">
                  <ellipse cx="36" cy="72" rx="22" ry="5" fill="#f0e6d6" opacity="0.5" />
                  <path d="M10 48 Q10 72 36 74 Q62 72 62 48Z" fill="#fff" stroke="#ede5da" strokeWidth="1.5" />
                  <ellipse cx="36" cy="48" rx="26" ry="7" fill="#f7f0e8" stroke="#ede5da" strokeWidth="1.5" />
                  <ellipse cx="36" cy="48" rx="22" ry="5.5" fill="#e83820" opacity="0.25" />
                  <rect x="20" y="44" width="14" height="8" rx="4" fill="#fff9f0" stroke="#f0d0c0" strokeWidth="1" />
                  <rect x="26" y="42" width="14" height="8" rx="4" fill="#fff9f0" stroke="#f0d0c0" strokeWidth="1" />
                  <rect x="38" y="44" width="12" height="8" rx="4" fill="#fff9f0" stroke="#f0d0c0" strokeWidth="1" />
                  <path d="M22 47 Q27 45 32 47" stroke="#e83820" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" />
                  <path d="M28 45 Q33 43 38 45" stroke="#e83820" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" />
                  <path d="M42 41 Q50 39 54 43 Q56 47 52 50 Q48 52 44 50 Q40 47 42 41Z" fill="#f5e0b0" stroke="#e8c880" strokeWidth="1" />
                </svg>
                <span className="food-label">떡볶이</span>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <div className="stats-strip">
          <div className="stat-item">
            <span className="stat-num">96.2%</span>
            <div className="stat-label">분석 정확도</div>
          </div>
          <div className="stat-item">
            <span className="stat-num">맛, 배달, 가격(양) </span>
            <div className="stat-label">카테고리별 3중 정밀 분석</div>
          </div>
          <div className="stat-item">
            <span className="stat-num">하이브리드 추론 엔진,<br />대조 접속사 완벽 인식</span>
            <div className="stat-label">복합 문장 판독 및 다수결 판정</div>
          </div>
        </div>

        <div className="divider"></div>

        {/* HOW IT WORKS */}
        <div className="section">
          <span className="section-tag">작동 방식</span>
          <h2 className="section-title">3단계로 끝나는 리뷰 분석</h2>
          <div className="steps">
            <div className="step-row">
              <div className="step-left">
                <div className="step-icon-wrap">
                  <svg viewBox="0 0 22 22" fill="none">
                    <rect x="3" y="3" width="10" height="9" rx="2.5" stroke="#f4623a" strokeWidth="1.5" />
                    <path d="M5 16 L4 19 L8 17" stroke="#f4623a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="5" y1="6.5" x2="11" y2="6.5" stroke="#f4623a" strokeWidth="1.3" strokeLinecap="round" />
                    <line x1="5" y1="9" x2="9" y2="9" stroke="#f4623a" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="step-connector"></div>
              </div>
              <div className="step-body">
                <div className="step-num-label">STEP 01</div>
                <div className="step-title">리뷰 텍스트 입력</div>
                <div className="step-desc">배달 앱에서 받은 리뷰를 그대로 붙여넣기만 하세요. 맞춤법이나 형식 걱정 없이 자연어 그대로 입력하면 됩니다.</div>
              </div>
            </div>

            <div className="step-row">
              <div className="step-left">
                <div className="step-icon-wrap">
                  <svg viewBox="0 0 22 22" fill="none">
                    <circle cx="11" cy="11" r="7" stroke="#f4623a" strokeWidth="1.5" />
                    <circle cx="8" cy="10" r="1.2" fill="#f4623a" />
                    <circle cx="11" cy="10" r="1.2" fill="#f4623a" />
                    <circle cx="14" cy="10" r="1.2" fill="#f4623a" />
                    <path d="M7 13.5 Q11 16 15 13.5" stroke="#f4623a" strokeWidth="1.3" strokeLinecap="round" fill="none" />
                  </svg>
                </div>
                <div className="step-connector"></div>
              </div>
              <div className="step-body">
                <div className="step-num-label">STEP 02</div>
                <div className="step-title">AI 자동 분석</div>
                <div className="step-desc">맛, 배달, 서비스, 가격 등 항목별로 감성을 분류하고 AI 확신도 점수를 산출합니다.</div>
              </div>
            </div>

            <div className="step-row">
              <div className="step-left">
                <div className="step-icon-wrap">
                  <svg viewBox="0 0 22 22" fill="none">
                    <path d="M4 17 L4 10 L8 10 L8 17" stroke="#f4623a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 17 L9 7 L13 7 L13 17" stroke="#f4623a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 17 L14 11 L18 11 L18 17" stroke="#f4623a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="3" y1="17" x2="19" y2="17" stroke="#f4623a" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
              <div className="step-body">
                <div className="step-num-label">STEP 03</div>
                <div className="step-title">인사이트 & 답글 제안</div>
                <div className="step-desc">개선 포인트와 맞춤형 답글 초안까지 한 번에 제공합니다. 복사 버튼 한 번으로 즉시 사용 가능합니다.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="divider"></div>

        {/* WHO SHOULD USE IT (Image 2) */}
        <div className="section">
          <span className="section-tag">대상</span>
          <h2 className="section-title">누가 쓰면 좋을까요</h2>

          <div className="user-grid">
            <div className="user-card consumer">
              <span className="user-card-pill">일반 사용자</span>
              <h3 className="user-card-title">믿을 수 있는<br />리뷰 판별</h3>
              <ul className="benefit-list">
                <li><span className="benefit-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17L4 12" /></svg></span> 가게 리뷰의 신뢰도 점수 확인</li>
                <li><span className="benefit-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17L4 12" /></svg></span> 긍정·부정 리뷰 한눈에 필터링</li>
                <li><span className="benefit-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17L4 12" /></svg></span> 허위 리뷰 패턴 탐지</li>
                <li><span className="benefit-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17L4 12" /></svg></span> 항목별 평점 분해 보기</li>
              </ul>
            </div>

            <div className="user-card biz">
              <span className="user-card-pill">가게 사장님</span>
              <h3 className="user-card-title">리뷰에서<br />인사이트 추출</h3>
              <ul className="benefit-list">
                <li><span className="benefit-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17L4 12" /></svg></span> 항목별 개선 포인트 제안</li>
                <li><span className="benefit-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17L4 12" /></svg></span> 맞춤형 답글 초안 자동 생성</li>
                <li><span className="benefit-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17L4 12" /></svg></span> 카테고리별 감성 트렌드 확인</li>
                <li><span className="benefit-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17L4 12" /></svg></span> 경쟁 가게 리뷰 비교 분석</li>
              </ul>
            </div>
          </div>

          {/* PREVIEW (Image 4) */}
          <div className="preview-section">
            <div style={{ marginBottom: '40px' }}>
              <span className="section-tag">미리보기</span>
              <h2 className="section-title" style={{ marginTop: '10px' }}>이런 분석 결과를 받아볼 수 있어요</h2>
            </div>

            <div className="consumer" style={{ marginBottom: '-8px' }}>
              <span className="user-card-pill" style={{ fontSize: '12px' }}>일반 사용자</span>
            </div>

            <div className="preview-analysis-wrap">
              <div className="preview-chat-bubble">포장도 깔끔하고 위생적인 것 같아 믿고 먹습니다.</div>

              <div className="preview-result-card">
                <div className="preview-status-bar">
                  <div className="preview-confidence">AI 확신도 <span style={{ fontWeight: 700, color: '#1e293b' }}>99.8% → 매우 높음</span></div>
                  <div className="preview-verdict">긍정 판정</div>
                </div>

                <div style={{ width: '100%', height: '220px', display: 'flex', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                      { category: '맛', value: 100, fullMark: 100 },
                      { category: '배달', value: 100, fullMark: 100 },
                      { category: '가격/양', value: 0, fullMark: 100 }
                    ]}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar
                        name="Sentiment"
                        dataKey="value"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.5}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '12px', fontSize: '14px', lineHeight: '1.6', color: '#334155' }}>
                  ✨ <b>분석 의견:</b> 맛, 배달에서 만족도가 높고 종합적으로 긍정 분석되었습니다.
                </div>
              </div>
            </div>

            <div className="biz" style={{ marginTop: '60px', marginBottom: '-8px' }}>
              <span className="user-card-pill" style={{ fontSize: '12px' }}>가게 사장님</span>
            </div>

            <div className="preview-analysis-wrap">
              {/* User Input Bubble (Right) */}
              <div className="preview-chat-bubble">포장도 깔끔하고 위생적인 것 같아 믿고 먹습니다.</div>

              {/* AI Response Bubble (Left) */}
              <div className="preview-chat-bubble" style={{
                background: '#fff', color: '#475569', border: '1px solid #e2e8f0',
                float: 'left', borderRadius: '20px 20px 20px 4px', margin: '10px 0 24px'
              }}>
                분석이 완료되었습니다.
              </div>

              <div className="preview-result-card">
                <div className="preview-status-bar">
                  <div className="preview-confidence">AI 확신도 <span style={{ fontWeight: 700, color: '#1e293b' }}>99.8% → 매우 높음</span></div>
                  <div className="preview-verdict">긍정 판정</div>
                </div>

                <div style={{ width: '100%', height: '220px', display: 'flex', justifyContent: 'center' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                      { category: '맛', value: 100, fullMark: 100 },
                      { category: '배달', value: 100, fullMark: 100 },
                      { category: '가격/양', value: 0, fullMark: 100 }
                    ]}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="OwnerView" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '12px', fontSize: '14px', lineHeight: '1.6', color: '#334155' }}>
                  ✨ <b>분석 의견:</b> 고객님께서 전반적인 서비스에 매우 만족하고 계십니다. 긍정적인 브랜드 이미지를 유지하기 위해 현재의 품질을 지속해 주세요.
                </div>

                <div className="owner-reply-box">
                  <div className="reply-header">📝 추천 답글 초안</div>
                  <div className="reply-content">
                    정성 가득한 리뷰에 힘이 납니다! 만족스러운 식사가 되셨다니 정말 기쁘네요. 언제나 믿고 주문하실 수 있는 가게가 되겠습니다.
                  </div>
                  <button className="copy-btn">복사하기</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="divider"></div>

        {/* MAJOR FEATURES (Image 2) */}
        <section className="feature-section">
          <span className="section-tag">주요 기능</span>
          <h2 className="section-title">이런 기능들이 포함되어 있어요</h2>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <h3>항목별 세분화 분석</h3>
              <p>맛, 배달, 서비스, 가격 각 항목을 독립적으로 분석해 어디서 문제가 생겼는지 정확히 파악합니다.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
                </svg>
              </div>
              <h3>AI 확신도 점수 제공</h3>
              <p>분석 결과에 대한 AI의 확신도를 퍼센트로 보여줘 판단 근거를 투명하게 전달합니다.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <path d="M12 7v6" /><path d="M9 10h6" />
                </svg>
              </div>
              <h3>답글 자동 생성</h3>
              <p>긍/부정에 맞는 답글 초안을 즉시 생성해 사장님의 응대 시간을 획기적으로 줄여줍니다.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3>허위 리뷰 탐지</h3>
              <p>비정상적인 패턴을 감지해 가게 선택 전 소비자들을 보호하고 신뢰도 높은 정보를 제공합니다.</p>
            </div>
          </div>
        </section>

        <div className="divider"></div>

        {/* CTA */}
        <div className="cta-section">
          <div className="cta-tag">지금 바로 시작하세요</div>
          <h2 className="cta-title">리뷰를 <em>자산으로</em><br />만드세요</h2>
          <p className="cta-sub">무료로 분석을 시작해 보세요. 가입 없이도 바로 사용 가능합니다.</p>
          <button className="cta-btn" onClick={() => setView('landing')}>무료로 시작하기 →</button>
        </div>
      </div>
    );
  }

  // --- Role Selection View ---
  // --- Role Selection View ---
  if (view === 'landing') {
    return (
      <div style={{ backgroundColor: '#fdf8f2', color: '#1a1208', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'Noto Sans KR, sans-serif' }}>
        <header style={{ position: 'absolute', top: '30px', left: '30px' }}>
          <button
            onClick={() => setView('intro')}
            style={{
              background: 'none', border: 'none', color: '#f4623a', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0',
              lineHeight: '1.1', padding: '10px'
            }}
          >
            <span style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>←</span>
            <span style={{ fontSize: '0.7rem', fontWeight: '900', letterSpacing: '0.05em' }}>BACK</span>
          </button>
        </header>
        <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>분석 대상 <span style={{ color: '#f4623a' }}>선택</span></h1>
        <p style={{ color: '#4a3f30', marginBottom: '40px' }}>서비스를 이용하실 유형을 선택해 주세요</p>

        <div style={{ display: 'flex', gap: '20px', maxWidth: '900px', width: '100%', marginBottom: '40px' }}>
          <div
            onClick={() => setUserType('consumer')}
            style={{
              flex: 1, backgroundColor: '#fff', padding: '40px 20px', borderRadius: '24px', textAlign: 'center', cursor: 'pointer',
              border: userType === 'consumer' ? `2.5px solid #f4623a` : '1.5px solid #ede5da',
              boxShadow: userType === 'consumer' ? '0 10px 25px rgba(244, 98, 58, 0.15)' : '0 4px 12px rgba(0,0,0,0.03)',
              transition: 'all 0.3s ease', transform: userType === 'consumer' ? 'scale(1.02)' : 'scale(1)'
            }}
          >
            <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <img src={userIconFinal} alt="User" style={{ height: '100%', objectFit: 'contain' }} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', color: '#1a1208' }}>일반 사용자</h2>
            <p style={{ color: '#9a8c7a', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '24px' }}>
              배달 음식을 주문하는 고객으로,<br />가게 리뷰의 신뢰도를 확인하고 싶어요
            </p>
            <span style={{ backgroundColor: '#fff2ee', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', color: '#f4623a', fontWeight: 'bold' }}>소비자</span>
          </div>

          <div
            onClick={() => setUserType('owner')}
            style={{
              flex: 1, backgroundColor: '#fff', padding: '40px 20px', borderRadius: '24px', textAlign: 'center', cursor: 'pointer',
              border: userType === 'owner' ? `2.5px solid #f4623a` : '1.5px solid #ede5da',
              boxShadow: userType === 'owner' ? '0 10px 25px rgba(244, 98, 58, 0.15)' : '0 4px 12px rgba(0,0,0,0.03)',
              transition: 'all 0.3s ease', transform: userType === 'owner' ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <img src={bossIcon} alt="Owner" style={{ height: '100%', objectFit: 'contain' }} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', color: '#1a1208' }}>가게 사장님</h2>
            <p style={{ color: '#9a8c7a', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '24px' }}>
              내 가게 리뷰를 카테고리별로 분석하고<br />개선 인사이트를 받고 싶어요
            </p>
            <span style={{ backgroundColor: '#fff2ee', padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem', color: '#f4623a', fontWeight: 'bold' }}>B2B</span>
          </div>
        </div>

        <button
          onClick={() => userType && setView('chat')}
          disabled={!userType}
          style={{
            width: '100%', maxWidth: '400px', padding: '18px', borderRadius: '14px', border: 'none',
            backgroundColor: userType ? '#f4623a' : '#ede5da',
            color: '#fff',
            fontSize: '1.1rem', fontWeight: 'bold', cursor: userType ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            boxShadow: userType ? '0 6px 15px rgba(244, 98, 58, 0.3)' : 'none'
          }}
        >
          {userType ? '선택 후 시작하기' : '유형을 먼저 선택해 주세요'}
        </button>
      </div>
    );
  }

  // --- Chat View ---
  return (
    <div style={{ backgroundColor: '#fdf8f2', minHeight: '100vh', padding: '20px', fontFamily: 'Noto Sans KR, sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', position: 'relative' }}>
          <button
            onClick={() => handleReset('landing')}
            style={{
              background: 'none', border: 'none', color: '#f4623a', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0',
              lineHeight: '1.1'
            }}
          >
            <span style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>←</span>
            <span style={{ fontSize: '0.7rem', fontWeight: '900', letterSpacing: '0.05em' }}>BACK</span>
          </button>

          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', color: '#1a1208', fontSize: '1.5rem', fontWeight: '800' }}>
            <img
              src={userType === 'consumer' ? userIconHeader : bossIcon}
              alt="Logo"
              style={{ width: '40px', height: '40px', marginRight: '14px', borderRadius: '8px' }}
            />
            AI 리뷰 판별기 ({userType === 'consumer' ? '일반 사용자' : '가게 사장님'})
          </h2>
          <div style={{ width: '50px' }}></div>
        </header>

        <div style={{
          border: '1px solid #e2e8f0', borderRadius: '20px', minHeight: '600px',
          maxHeight: '80vh', overflowY: 'auto', padding: '25px', backgroundColor: '#ffffff',
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ marginBottom: '25px', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
              <div style={{
                display: 'inline-block', padding: '12px 18px', borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                backgroundColor: msg.role === 'user' ? accentColor : '#f1f5f9',
                color: msg.role === 'user' ? 'white' : '#1e293b',
                maxWidth: '85%', boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
              }}>
                {msg.content}
              </div>

              {msg.analysis && (
                <div style={{
                  marginTop: '12px', padding: '24px', border: '1px solid #edf2f7',
                  borderRadius: '20px', backgroundColor: '#fcfcfc', textAlign: 'left',
                }}>
                  {/* 1. 위생 긴급 알림 배너 */}
                  {msg.analysis.has_hygiene && msg.analysis.hygiene_score === 1 && (
                    <div style={{
                      backgroundColor: '#fff1f2', border: '1px solid #fda4af', borderRadius: '12px',
                      padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px'
                    }}>
                      <span style={{ fontSize: '1.2rem' }}>🚨</span>
                      <span style={{ color: '#9f1239', fontWeight: 'bold', fontSize: '0.95rem' }}>위생 이슈 감지 - 즉시 확인 필요</span>
                    </div>
                  )}

                  {/* 2. 신뢰도 요약 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>AI 확신도</span>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <strong style={{ fontSize: '1.3rem', color: '#1e293b' }}>{msg.analysis.score}%</strong>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: getConfidenceInfo(msg.analysis.score).color }}>
                          → {getConfidenceInfo(msg.analysis.score).label}
                        </span>
                      </div>
                    </div>
                    <span style={{
                      padding: '6px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold',
                      backgroundColor: msg.analysis.final_label === '긍정' ? '#dcfce7' : msg.analysis.final_label === '애매' ? '#fef3c7' : msg.analysis.final_label === '정보 없음' ? '#e0f2fe' : '#fee2e2',
                      color: msg.analysis.final_label === '긍정' ? '#166534' : msg.analysis.final_label === '애매' ? '#92400e' : msg.analysis.final_label === '정보 없음' ? '#0369a1' : '#991b1b'
                    }}>
                      {msg.analysis.final_label} 판정
                    </span>
                  </div>

                  {/* 3. 분석 시각화 차트 (Radar) - 통합 데이터 기반 렌더링 (안정성 극대화) */}
                  {(() => {
                    const isNoInfo = msg.analysis.final_label === '정보 없음';
                    const categories = [
                      { label: '맛', key: 'taste' },
                      { label: '배달', key: 'delivery' },
                      { label: '가격/양', key: 'etc' }
                    ];

                    // 통합 데이터셋 생성 (Recharts 표준 방식)
                    const vizData = categories.map(c => {
                      const hasKeyword = msg.analysis[`has_${c.key}`];
                      const score = msg.analysis[`${c.key}_score`];

                      let posValue = 0;
                      let negValue = 0;
                      let neuValue = 0;

                      if (hasKeyword) {
                        if (score === 3) {
                          neuValue = 60; // 중립은 60% 영역 차지
                        } else {
                          const val = score <= 1 ? Math.max(score * 20, 40) : (score * 20 || 0);
                          if (score <= 1) negValue = val;
                          else posValue = val;
                        }
                      }

                      return {
                        subject: c.label,
                        posValue,
                        negValue,
                        neuValue,
                        fullMark: 100
                      };
                    });

                    const hasAnyData = vizData.some(d => d.posValue > 0 || d.negValue > 0 || d.neuValue > 0);

                    return (
                      <div style={{ height: '240px', width: '100%', marginBottom: '20px', backgroundColor: '#f8fafc', borderRadius: '16px', padding: '10px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          {/* 전체 데이터를 부모에게 명시적으로 전달하여 스케일 계산 보장 */}
                          <RadarChart
                            cx="50%"
                            cy="50%"
                            outerRadius="80%"
                            data={vizData}
                          >
                            {/* 그리드 가시성 강화 (#cbd5e1) */}
                            <PolarGrid stroke="#cbd5e1" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12, fontWeight: 'bold' }} />
                            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />

                            {/* 중립 영역 - 회색 (우선 렌더링하여 배경 느낌) */}
                            {!isNoInfo && hasAnyData && (
                              <Radar
                                name="중립"
                                dataKey="neuValue"
                                stroke="#94a3b8"
                                fill="#94a3b8"
                                fillOpacity={0.4}
                                strokeWidth={2}
                              />
                            )}

                            {/* 긍정 영역 - 파란색 */}
                            {!isNoInfo && hasAnyData && (
                              <Radar
                                name="긍정"
                                dataKey="posValue"
                                stroke="#2563eb"
                                fill="#2563eb"
                                fillOpacity={0.6}
                                strokeWidth={3}
                              />
                            )}

                            {/* 부정 영역 - 빨간색 */}
                            {!isNoInfo && hasAnyData && (
                              <Radar
                                name="부정"
                                dataKey="negValue"
                                stroke="#dc2626"
                                fill="#dc2626"
                                fillOpacity={0.6}
                                strokeWidth={3}
                              />
                            )}

                            {/* 정보 없음 상태이거나 모든 항목이 0일 때 (기본 피라미드 틀만 노출) */}
                            {(isNoInfo || !hasAnyData) && (
                              <Radar
                                dataKey="posValue"
                                stroke="#94a3b8"
                                fill="none"
                                strokeWidth={1}
                              />
                            )}
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    );
                  })()}

                  {/* 4. 분석 의견 */}
                  <div style={{ marginBottom: '24px' }}>
                    <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.6', color: '#334155' }}>
                      ✨ <strong>분석 의견:</strong> {msg.analysis.reasoning}
                    </p>
                  </div>

                  {/* 5. 카테고리별 세부 조언 */}
                  {msg.analysis.final_label !== '긍정' && msg.analysis.category_advice && msg.analysis.category_advice.length > 0 && (
                    <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '0.9rem', color: '#475569' }}>🔍 항목별 개선 제안</div>
                      {msg.analysis.category_advice.map((adv, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '8px', fontSize: '0.9rem' }}>
                          <span style={{ color: accentColor, fontWeight: 'bold', minWidth: '35px' }}>{adv.category}</span>
                          <span style={{ color: '#64748b' }}>→ "{adv.text}"</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 6. 추천 답글 */}
                  {userType === 'owner' && msg.analysis.suggested_reply && (
                    <div style={{
                      padding: '20px', backgroundColor: '#f1f5f9', borderRadius: '16px', border: '1px dashed #cbd5e1'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '1.1rem' }}>📝</span>
                        <strong style={{ fontSize: '0.9rem', color: '#334155' }}>추천 답글 초안</strong>
                      </div>
                      <div style={{
                        backgroundColor: '#fff', padding: '16px', borderRadius: '10px', fontSize: '0.95rem',
                        lineHeight: '1.6', color: '#475569', marginBottom: '12px', border: '1px solid #e2e8f0'
                      }}>
                        {msg.analysis.suggested_reply}
                      </div>
                      <button
                        onClick={() => copyToClipboard(msg.analysis.suggested_reply)}
                        style={{
                          width: '100%', padding: '10px', borderRadius: '8px', border: 'none',
                          backgroundColor: '#334155', color: 'white', fontSize: '0.9rem', cursor: 'pointer',
                          fontWeight: 'bold', transition: 'opacity 0.2s'
                        }}
                      >
                        복사하기
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {loading && <div style={{ textAlign: 'left', color: '#94a3b8', marginTop: '10px', fontStyle: 'italic' }}>AI가 분석 중입니다...</div>}
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
          <input
            style={{
              flex: 1, padding: '16px', borderRadius: '12px',
              border: '1px solid #e2e8f0', outline: 'none', fontSize: '1rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="주문하신 리뷰 내용을 입력하여 신뢰도를 측정해보세요"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            style={{
              padding: '0 30px', borderRadius: '12px', border: 'none',
              backgroundColor: accentColor, color: 'white', cursor: loading ? 'default' : 'pointer',
              fontWeight: 'bold', fontSize: '1rem'
            }}
          >
            {loading ? '...' : '분석하기'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
