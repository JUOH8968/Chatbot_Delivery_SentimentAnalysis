import os
import random
from typing import TypedDict, Annotated, List, Dict, Any
from dotenv import load_dotenv
from transformers import BertTokenizer, AutoModelForSequenceClassification, pipeline
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from langgraph.graph import StateGraph, END

# 환경 변수 로드
load_dotenv()

# OpenMP 충돌 방지
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. 모델 및 토크나이저 로드 (RoBERTa)
MODEL_PATH = "ju03/Chatbot_Emotion-classification"
tokenizer = BertTokenizer.from_pretrained(MODEL_PATH, use_fast=False)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
classifier = pipeline("text-classification", model=model, tokenizer=tokenizer)


# --- LangGraph 정의 ---

class GraphState(TypedDict):
    content: str
    user_type: str  # 'consumer' | 'owner'
    label: str
    score: float
    analysis: Dict[str, Any]
    reasoning: str
    category_advice: List[Dict[str, str]] # [{category: "맛", text: "..."}, ...]
    suggested_reply: str

def roberta_analysis_node(state: GraphState):
    """RoBERTa 모델을 통한 1차 감성 분석 및 휴리스틱 로직"""
    review_text = state["content"]
    result = classifier(review_text)[0]
    label = result['label']
    score = result['score']
    
    # 키워드 세트 정의
    taste_keywords = ['맛', '간', '신선', '식어', '냄새', '음식', '머리카락', '벌레', '이물질', '위생', '한 끼', '때우기']
    delivery_keywords = ['배달', '도착', '시간', '포장', '라이더', '배송']
    
    # 가격/가성비/양 키워드
    price_keywords = ['가격', '가성비', '대비', '비싸', '비싼', '비싸요', '비쌈', '값', '양', '양도', '양두', '돈']

    # 무관심/평범 키워드 (긍정으로 처리하기 애매한 표현들)
    indifferent_keywords = ['특별한 건 없', '특출', '평범', '그저 그', '먹을 만은', '그냥저냥', '무난', '보통', '때우기', '그저']

    # 범용 부정 키워드
    common_bad_keywords = ['별로', '아쉽', '부족', '불만', '실망', '안 좋', '지적', '오해', '다시는', '다신', '안 시킬']
    
    # 중립/대조 키워드
    neutral_keywords = ['애매', '보통', '그저', '그냥', '평범', '나쁘지 않', '조금', '있지만', '있는데', '있었지만', '있었으나', '는데', '지만', '으나']

    has_taste = any(kw in review_text for kw in taste_keywords)
    has_delivery = any(kw in review_text for kw in delivery_keywords)
    has_price = any(kw in review_text for kw in price_keywords)
    has_indifferent = any(kw in review_text for kw in indifferent_keywords)
    
    # 전역 부정 탐지 (어떤 카테고리에도 명시되지 않은 일반적인 불만)
    has_general_neg = any(kw in review_text for kw in common_bad_keywords)
    
    analysis = {
        "taste_score": -1, # 미정 상태로 시작
        "taste_eval": "맛에 대한 평가를 분석 중입니다.",
        "delivery_score": -1,
        "delivery_eval": "배달 서비스에 대한 분석입니다.",
        "etc_score": -1, "etc_eval": "",
        "has_taste": has_taste, "has_delivery": has_delivery,
        "has_etc": False
    }

    # 세부 분석 - 배달
    if has_delivery:
        # 우선순위: 명확한 긍정 -> 명확한 부정 -> 중립
        if any(good in review_text for good in ['빨라', '빨랐', '빠름', '신속', '엄청 빠', '정시', '빨라요', '빨라 직접', '빠르', '빨리', '빨리와서', '빠르게', '깔끔', '꼼꼼', '튼튼', '정성', '만족']):
            analysis["delivery_score"] = 5
            analysis["delivery_eval"] = "신속한 배달 혹은 꼼꼼한 포장에 만족하셨습니다."
        elif any(bad in review_text for bad in (['안 빠', '늦', '지연', '느림', '오래','느리', '식었', '식어', '걸렸', '걸리', '시간', '느리네요', '느림'] + common_bad_keywords)):
            analysis["delivery_score"] = 0
            analysis["delivery_eval"] = "배달 과정이나 포장 상태에서 아쉬운 점이 확인됩니다."
        elif any(neu in review_text for neu in indifferent_keywords):
            analysis["delivery_score"] = 3
            analysis["delivery_eval"] = "배달 과정이 전반적으로 무난했습니다."

    # 세부 분석 - 맛 / 음식 품질
    if has_taste:
        # 이물질/심각한 위생 문제는 맛/품질에서 가장 심각한 부정으로 처리
        if any(critical in review_text for critical in ['머리카락', '벌레', '이물질']):
            analysis["taste_score"] = 0
            analysis["taste_eval"] = "음식에서 이물질이 발견되어 매우 부정적인 피드백이 확인됩니다."
        elif any(bad_hygiene in review_text for bad_hygiene in ['위생 관리', '위생 상태가', '위생이 별로', '위생이 안', '위생 좀']):
            analysis["taste_score"] = 0
            analysis["taste_eval"] = "위생 상태에 대한 부정적인 지적이 확인됩니다."
        elif any(good in review_text for good in ['맛있', '맛나', '최고','맛없지 않', '맛도 있', '맛 좋', '좋아', '있고', '믿고', '믿음', '위생적', '깨끗']):
             analysis["taste_score"] = 5
             analysis["taste_eval"] = "음식의 맛과 품질(위생 포함)에 대해 매우 만족하셨습니다."
        elif any(bad in review_text for bad in (['맛없', '맛도 없', '맛고'] + common_bad_keywords)): # '맛고' 오타 대비
            analysis["taste_score"] = 0
            analysis["taste_eval"] = "맛에 대한 아쉬운 피드백이 확인됩니다."
        elif any(neu in review_text for neu in indifferent_keywords):
            analysis["taste_score"] = 3
            analysis["taste_eval"] = "음식의 맛이 전반적으로 평이하거나 무난합니다."

    # 세부 분석 - 가격/가성비/양
    if has_price:
        analysis["has_etc"] = True
        if any(good in review_text for good in ['착해', '저렴', '합리적', '가성비 좋', '가성비 최고', '양 많', '양도 많', '넉넉', '푸짐']):
            analysis["etc_score"] = 5
            analysis["etc_eval"] = "가격 대비 품질과 넉넉한 양에 만족하셨습니다."
        elif any(bad in review_text for bad in (['비싸', '비쌈', '값어치', '아깝', '적어', '적네', '적음', '창렬', '돈 아깝', '아깝네요'] + common_bad_keywords)):
            analysis["etc_score"] = 0
            analysis["etc_eval"] = "가격이나 양(가성비) 면에서 아쉬운 피드백이 확인됩니다."
        elif any(neu in review_text for neu in indifferent_keywords):
            analysis["etc_score"] = 3
            analysis["etc_eval"] = "가격이나 양이 대체로 무난한 수준입니다."

    # 최종 판정 로직
    pos_count = 0
    neg_count = 0
    neu_count = 0
    
    # 모델 감성 판별
    model_is_pos = (label == 'LABEL_1' and score > 0.5)

    # 항목별 판정 함수 (폴백 로직 및 중립 처리 포함)
    def determine_category_status(has_cat, score_val):
        nonlocal pos_count, neg_count, neu_count
        if has_cat:
            # 키워드로 판정되지 않은 경우 모델 감성 사용 (사용자 요청: 부정이 없으면 긍정)
            final_val = score_val
            if final_val == -1:
                final_val = 5 if model_is_pos else 0
            
            if final_val >= 4: 
                pos_count += 1
                return 5
            elif final_val == 3:
                neu_count += 1
                return 3
            else: 
                neg_count += 1
                return 0
        else:
            return 0

    if not has_price:
        analysis["etc_score"] = 0
    
    # 맛 판정
    analysis["taste_score"] = determine_category_status(has_taste, analysis["taste_score"])
    # 배달 판정
    analysis["delivery_score"] = determine_category_status(has_delivery, analysis["delivery_score"])
    
    # 가격/기타 판정 (최종 판정 카운트에 포함)
    if has_price:
        if analysis["etc_score"] == -1:
            analysis["etc_score"] = 5 if model_is_pos else 0
        
        if analysis["etc_score"] >= 4: 
            pos_count += 1
            analysis["etc_score"] = 5
        elif analysis["etc_score"] == 3:
            neu_count += 1
            analysis["etc_score"] = 3
        else: 
            neg_count += 1
            analysis["etc_score"] = 0

    # --- 사용자 요청 기반 최종 판정 로직 (맛, 배달, 가격/양 중심) ---
    mentioned_cats = [has_taste, has_delivery, has_price]
    # 카테고리가 아예 없는 경우 -> 모델 감성 직접 활용 (뉘앙스 판단)
    elif not any([has_taste, has_delivery, has_price]):
            # 1. '보통/무난' 등 중립 키워드가 있으면 '애매'로 우선 판정
            if any(kw in review_text for kw in indifferent_keywords):
                analysis["final_label"] = "애매"
            # 2. 확실하게 긍정적일 때만 '긍정' (임계치 0.6)
            elif model_is_pos and score > 0.6:
                analysis["final_label"] = "긍정"
            # 3. 확실하게 부정적일 때만 '부정' (임계치 0.6)
            elif label == 'LABEL_0' and score > 0.6:
                analysis["final_label"] = "부정"
            else:
                analysis["final_label"] = "애매"

def generate_rule_based_reasoning(state: GraphState):
    """API 실패 시 작동하는 규칙 기반 문장 생성기 (항목별 분리 및 답글 초안 생성 포함)"""
    analysis = state["analysis"]
    user_type = state.get("user_type", "consumer")
    final_label = analysis["final_label"]

    # --- 조언 데이터셋 정의 ---
    TASTE_ADVICE = [
        "전반적인 조리 과정과 간이 레시피대로 유지되는 있는지 재점검이 필요합니다.",
        "식재료의 신선도 혹은 소스의 배합 비율을 다시 한번 확인해보시는 것을 권장합니다.",
        "음식이 고객에게 전달될 때의 온도가 적절한지 포장 방식을 검토해보세요.",
        "주방 인력 간의 메뉴 숙지도가 차이가 있는지 확인하고 일관된 맛을 유지해야 합니다.",
        "염도나 맵기 등 대중적인 입맛에 맞게 레시피가 조정되었는지 피드백을 수집해보세요."
    ]
    DELIVERY_ADVICE = [
        "배달 대행사와의 거리를 고려하여 예상 도착 시간을 더 보수적으로 설정해보세요.",
        "배달 중 음식이 흔들리거나 식지 않도록 패키징 보완(보온팩 등)을 추천드립니다.",
        "피크 시간대에 배달 지연이 잦은지 확인하고 인력 배치를 조정할 필요가 있습니다.",
        "배달 기사님께 전달 시 요청사항이 누락되지 않도록 체크리스트를 활용해보세요.",
        "포장 용기 내 용량이 적절하여 국물 등이 새지 않는지 다시 한번 점검해주세요."
    ]

    # 긍정/부정 요소 추출
    pros = []
    cons = []
    if analysis.get("has_taste"):
        if analysis["taste_score"] >= 5: pros.append("맛")
        elif analysis["taste_score"] <= 1: cons.append("맛")
    if analysis.get("has_delivery"):
        if analysis["delivery_score"] >= 5: pros.append("배달")
        elif analysis["delivery_score"] <= 1: cons.append("배달")
    if analysis.get("has_etc"):
        if analysis["etc_score"] >= 5: pros.append("가격/가성비")
        elif analysis["etc_score"] <= 1: cons.append("가격/가성비")

    category_advice = []
    suggested_reply = ""

    # 답글 템플릿
    POS_REPLY_TEMPLATES = [
        "고객님, 소중한 리뷰와 칭찬 감사드립니다! 보내주신 성원에 보답하기 위해 앞으로도 변함없는 맛과 서비스로 모시겠습니다.",
        "정성 가득한 리뷰에 힘이 납니다! 만족스러운 식사가 되셨다니 정말 기쁘네요. 언제나 믿고 주문하실 수 있는 가게가 되겠습니다.",
        "최고의 찬사를 보내주셔서 감사합니다! 고객님의 따뜻한 말씀 한마디가 저희에겐 큰 보람입니다. 다음에 또 봬요! 😊",
        "맛있게 드셔주셔서 정말 감사합니다! 보내주신 응원에 힘입어 오늘도 최선을 다해 조리하겠습니다. 즐거운 하루 되세요!",
        "와우! 별 5개와 좋은 리뷰 너무나 감사드립니다. 고객님의 단골 메뉴가 될 수 있도록 항상 정성을 다하겠습니다. 감사합니다!"
    ]
    NEG_REPLY_TEMPLATES = [
        "고객님, 소중한 피드백 감사드립니다. 말씀해주신 {keyword_str} 부분을 즉시 개선하여 다음 이용 시에는 더 만족스러운 경험을 드릴 수 있도록 최선을 다하겠습니다.",
        "안녕하세요 사장님입니다. {keyword_str} 부분에서 불편을 드려 진심으로 사과드립니다. 해당 피드백을 바탕으로 내부 과정을 전면 재점검하겠습니다.",
        "리뷰 남겨주셔서 감사합니다. 불편을 겪으신 {keyword_str} 항목은 저희 매장에서 가장 중요하게 생각하는 부분인데 실망시켜 드려 죄송하며, 즉시 시정 조치하겠습니다.",
        "고객님의 귀한 의견 감사히 받겠습니다. {keyword_str} 관련 피드백은 저희 팀과 공유하여 더 나은 품질을 실천하는 계기로 삼겠습니다. 다시 한번 죄송합니다.",
        "불편을 드려 대단히 죄송합니다. 지적해주신 {keyword_str} 요소들을 면밀히 살펴보고 동일한 문제가 재발하지 않도록 철저히 관리하겠습니다."
    ]

    if user_type == "owner":
        if final_label == "정보 없음":
            reasoning = "분석 가능한 카테고리(맛, 배달, 가격/양)가 포함되지 않았으며, 전체적인 뉘앙스 파악도 어려운 리뷰입니다."
            suggested_reply = "소중한 리뷰 감사드립니다. 고객님의 의견을 바탕으로 더욱 발전하는 매장이 되겠습니다."
        elif final_label == "긍정":
            if not pros:
                reasoning = "전체적인 문맥에서 고객님의 높은 만족도가 느껴집니다. 특별한 카테고리 언급은 없으나 긍정적인 경험을 하신 것으로 분석됩니다."
            else:
                reasoning = "고객님께서 전반적인 서비스에 매우 만족하고 계십니다. 긍정적인 브랜드 이미지를 유지하기 위해 현재의 품질을 지속해 주세요."
            suggested_reply = random.choice(POS_REPLY_TEMPLATES)
        else:
            for con in cons:
                if con == "맛": category_advice.append({"category": "맛", "text": random.choice(TASTE_ADVICE)})
                elif con == "배달": category_advice.append({"category": "배달", "text": random.choice(DELIVERY_ADVICE)})
                elif con == "가격/양": category_advice.append({"category": "가격/양", "text": "원가 절감보다는 품질 유지와 적절한 할인 프로모션 구성을 검토해보세요."})
            
            if not cons:
                reasoning = f"전반적인 문맥에서 고객님의 아쉬움이 느껴집니다. 특별한 카테고리 언급은 없으나 서비스 전반에 대한 재점검이 권장되는 {final_label} 상황입니다."
            else:
                keyword_str = ", ".join(cons)
                reasoning = f"분석 결과 {keyword_str} 부분에서 아쉬움이 포착되었습니다. 전문 컨설팅 가이드를 확인하여 개선 계획을 세우시길 권장합니다."
            
            template = random.choice(NEG_REPLY_TEMPLATES)
            suggested_reply = template.format(keyword_str=", ".join(cons) if cons else "부족한")
    else:
        if not pros and not cons:
            reasoning = f"문맥 분석 결과 최종적으로 {final_label} 판정을 내렸습니다."
        else:
            res = ""
            if pros: res += f"{', '.join(pros)}에서 만족도가 높고 "
            if cons: res += f"{', '.join(cons)}에서 아쉬움이 보여 "
            reasoning = f"{res}종합적으로 {final_label} 분석되었습니다."

    return {
        "reasoning": reasoning,
        "category_advice": category_advice,
        "suggested_reply": suggested_reply
    }

def reasoning_node(state: GraphState):
    """로컬 규칙 기반 엔진을 통한 분석 결과 생성 (LLM 의존성 완전 제거)"""
    return generate_rule_based_reasoning(state)

# 그래프 구성
workflow = StateGraph(GraphState)
workflow.add_node("roberta", roberta_analysis_node)
workflow.add_node("reasoning", reasoning_node)

workflow.set_entry_point("roberta")
workflow.add_edge("roberta", "reasoning")
workflow.add_edge("reasoning", END)

# 컴파일
chain = workflow.compile()

# FAST API endpoint
class ReviewRequest(BaseModel):
    content: str
    user_type: str = "consumer"  # 'consumer' | 'owner'

@app.post("/api/analyze")
async def analyze_review(request: ReviewRequest):
    initial_state = {
        "content": request.content,
        "user_type": request.user_type
    }
    final_output = chain.invoke(initial_state)
    
    return {
        "score": round(final_output["score"] * 100, 1),
        "reasoning": final_output["reasoning"],
        "category_advice": final_output.get("category_advice", []),
        "suggested_reply": final_output.get("suggested_reply", ""),
        **final_output["analysis"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
