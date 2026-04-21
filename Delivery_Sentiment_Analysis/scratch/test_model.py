import os
from transformers import BertTokenizer, AutoModelForSequenceClassification, pipeline

# 1. 모델 및 토크나이저 로드 (RoBERTa)
MODEL_PATH = "ju03/Chatbot_Emotion-classification"
tokenizer = BertTokenizer.from_pretrained(MODEL_PATH, use_fast=False)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
classifier = pipeline("text-classification", model=model, tokenizer=tokenizer)

test_sentence = "생각보다는 별로였어요. 나쁘진 않은데 가격 대비 아쉽네요"
result = classifier(test_sentence)
print(f"Sentence: {test_sentence}")
print(f"Result: {result}")
