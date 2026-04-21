import os
import requests
import json
import time
import subprocess

# Start the server in the background
server_process = subprocess.Popen(["python", "review.py"], cwd=os.getcwd())
time.sleep(10) # Give it time to load the model

def test_analyze(content):
    url = "http://localhost:8000/api/analyze"
    payload = {"content": content, "user_type": "owner"}
    try:
        response = requests.post(url, json=payload)
        return response.json()
    except Exception as e:
        return {"error": str(e)}

test_cases = [
    "생각보다는 별로였어요. 나쁘진 않은데 가격 대비 아쉽네요",
    "배달이 진짜 빨라요!",
    "맛은 있는데 가격이 너무 비싸요",
    "위생 상태가 좀 지저분하네요",
    "맛있게 잘 먹었습니다!"
]

print("Starting Verification Tests...")
results = []
for text in test_cases:
    res = test_analyze(text)
    print(f"\nSentence: {text}")
    print(f"Final Label: {res.get('final_label')}")
    print(f"Reasoning: {res.get('reasoning')}")
    results.append({"text": text, "label": res.get('final_label'), "reasoning": res.get('reasoning')})

# Cleanup
server_process.terminate()

with open("verification_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("\nVerification complete. Results saved to verification_results.json")
