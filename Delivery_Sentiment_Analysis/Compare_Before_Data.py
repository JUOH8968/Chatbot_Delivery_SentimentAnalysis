### 파인튜닝 전 모델
import os
import torch
from transformers import BertTokenizer, AutoModelForSequenceClassification, pipeline

# OpenMP 충돌 방지
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
# 1. 모델 설정
# A) 범용 감성 분석 모델 (Base Proxy: KLUE-BERT trained on NSMC or similar)
# klue/roberta-base : 이모델은 단지 한국어로 사전 학습된 모델
# jason9693/klue-roberta-base-nsmc : 이 모델로 정확도 판단하면 약 82%가 나올듯
BASE_MODEL_NAME = "doya/klue-sentiment-nsmc" # doya/klue-sentiment-nsmc , jason9693/klue-roberta-base-nsmc  # 이 모델은 감성분석이 된모델, 이모델로 정밀도, 재현율, f1-score, 정확도 판단해보기
base_tokenizer = BertTokenizer.from_pretrained(BASE_MODEL_NAME)
base_model = AutoModelForSequenceClassification.from_pretrained(BASE_MODEL_NAME)
base_classifier = pipeline("sentiment-analysis", model=base_model, tokenizer=base_tokenizer)

# B) 커스텀 배달 도메인 모델 (Custom Model)
CUSTOM_MODEL_NAME = "ju03/Chatbot_Emotion-classification"
custom_tokenizer = BertTokenizer.from_pretrained(CUSTOM_MODEL_NAME, use_fast=False)
custom_model = AutoModelForSequenceClassification.from_pretrained(CUSTOM_MODEL_NAME)
custom_classifier = pipeline("text-classification", model=custom_model, tokenizer=custom_tokenizer)

# 테스트 데이터 (배달 도메인 특화 문장)
test_data = [
    "배달팁이 너무 사악하네요.",
    "리뷰 약속한 서비스가 안 왔어요.",
    "눅눅하게 와서 속상합니다.",
    "도움되는 리뷰 보고 시켰는데 실패네요.",
    "포장 뜯기가 너무 힘들어요.",
    "사장님은 친절한데 맛은 그닥...",
    "한 시간 넘게 기다렸는데 다 식어서 왔네요.",
    "벌레 나왔는데 환불 안 해주네요.",
    "맛있어서 두 번째 시킵니다.",
    "양은 많은데 남길 것 같아요."
]
def map_label(label, model_type):
    if model_type == "base":
        return "긍정" if "POSITIVE" in label.upper() else "부정"
    else:
        return "긍정" if label == "LABEL_1" else "부정"
print("-" * 80)
print(f"{'테스트 리뷰 텍스트':<40} | {'범용(Base)':<10} | {'커스텀(Custom)':<10} | {'일치여부'}")
print("-" * 80)
for text in test_data:
    # 범용 모델 추론
    b_res = base_classifier(text)[0]
    b_label = map_label(b_res['label'], "base")
    b_score = round(b_res['score'], 3)
    
    # 커스텀 모델 추론
    c_res = custom_classifier(text)[0]
    c_label = map_label(c_res['label'], "custom")
    c_score = round(c_res['score'], 3)
    
    match = "✅" if b_label == c_label else "❌"
    
    print(f"{text[:38]:<40} | {b_label:<10} | {c_label:<10} | {match}")
print("-" * 80)
print("분석 요약:")
print("- ❌로 표시된 케이스는 범용 모델이 배달 도메인 문맥을 오해한 경우입니다.")