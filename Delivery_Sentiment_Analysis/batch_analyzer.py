import csv
import random
import os
from review import chain

# 데이터 생성 설정
BATCH_COUNT_PER_TYPE = 500  # 유형별 500건씩 총 1000건
OUTPUT_FILE = "analysis_results.csv"

# 리뷰 생성을 위한 키워드 풀
FOODS = ["치킨", "피자", "짜장면", "마라탕", "스테이크", "초밥", "김치찌개", "돈까스", "삼겹살", "떡볶이", "커피/디저트"]
POSITIVE_ADJECTIVES = ["맛있어요", "최고예요", "정말 추천함", "신선해요", "양이 많아요", "가성비 갑", "깔끔해요", "사장님이 친절함"]
NEGATIVE_ADJECTIVES = ["맛없어요", "별로임", "다신 안 시킴", "머리카락 나옴", "불어서 왔음", "냄새나요", "싱거워요", "비싸요"]
DELIVERY_POSITIVE = ["배달이 빨라요", "정시 도착", "포장이 꼼꼼함", "기사님이 친절해요"]
DELIVERY_NEGATIVE = ["너무 늦게 왔음", "국물이 다 샜음", "배달이 안옴", "불친절함"]
NEUTRAL_PHRASES = ["그냥 그래요", "무난함", "보통이에요", "나쁘진 않은데 좋지도 않아요", "특별한 건 없어요"]

def generate_random_review():
    """다양한 조합으로 랜덤 리뷰 생성"""
    case = random.random()
    food = random.choice(FOODS)
    
    if case < 0.4: # 명확한 긍정
        return f"{food} {random.choice(POSITIVE_ADJECTIVES)}! {random.choice(DELIVERY_POSITIVE)}."
    elif case < 0.7: # 명확한 부정
        return f"{food} {random.choice(NEGATIVE_ADJECTIVES)}... {random.choice(DELIVERY_NEGATIVE)}."
    elif case < 0.9: # 중립/애매
        return f"{food} {random.choice(NEUTRAL_PHRASES)}. {random.choice(FOODS)}는 {random.choice(POSITIVE_ADJECTIVES)}."
    else: # 무관한 내용/정보 없음
        return "감사합니다 수고하세요."

def run_batch_analysis():
    print(f"총 {BATCH_COUNT_PER_TYPE * 2}건의 데이터 생성 및 분석을 시작합니다...")
    results = []
    
    types = ["consumer", "owner"]
    
    for user_type in types:
        print(f"[{user_type}] 데이터 처리 중...")
        for i in range(BATCH_COUNT_PER_TYPE):
            content = generate_random_review()
            
            # 분석 수행
            initial_state = {
                "content": content,
                "user_type": user_type
            }
            try:
                final_output = chain.invoke(initial_state)
                
                # 결과 가공
                sentiment = final_output.get("classification", {}).get("final_label", "분석 불가")
                # classification 정보가 state에 없을 경우 review.py 로직을 참고하여 유추하거나 직접 로직 호출
                # review.py를 보면 analysis 필드에 taste_score 등과 함께 최종 결과가 저장됨
                
                # 정확도(스코어)
                score = round(final_output.get("score", 0) * 100, 1)
                
                # 긍부정 이유
                reasoning = final_output.get("reasoning", "")
                
                # 추천 답변 (보여줄 이름: Suggested Reply)
                suggested_reply = final_output.get("suggested_reply", "") if user_type == "owner" else ""
                
                # review.py의 roberta_analysis_node를 보면 analysis 딕셔너리에 taste_eval 등이 들어감
                # 최종 라벨은 review.py 로직상 analysis 내부 로직을 통해 reasoning에 반영됨
                # 여기서는 reasoning에서 라벨을 추출하거나, chain 수행 시의 최종 상태를 활용
                
                # 실제 classification 라벨 추출 (review.py 로직 재현)
                label = "정보 없음"
                if "긍정" in reasoning: label = "긍정"
                elif "부정" in reasoning or "아쉬움" in reasoning: label = "부정"
                elif "애매" in reasoning or "분석되었습니다" in reasoning: label = "애매"

                results.append({
                    "입력데이터": content,
                    "긍/부정 최종출력": label,
                    "정확도": f"{score}%",
                    "긍/부정 이유": reasoning,
                    "추천답변": suggested_reply
                })
                
                if (i + 1) % 100 == 0:
                    print(f"  - {i + 1}건 완료...")
                    
            except Exception as e:
                print(f"에러 발생 ({content}): {e}")

    # CSV 저장
    # Windows 엑셀 호환성을 위해 utf-8-sig 사용
    with open(OUTPUT_FILE, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=["입력데이터", "긍/부정 최종출력", "정확도", "긍/부정 이유", "추천답변"])
        writer.writeheader()
        writer.writerows(results)

    print(f"\n분석 완료! 결과가 {OUTPUT_FILE}로 저장되었습니다.")

if __name__ == "__main__":
    run_batch_analysis()
