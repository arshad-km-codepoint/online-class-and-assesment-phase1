"""
Ask Jev (TypeSafe AI) via OpenRouter to pick the right subject from a list.

Setup:
    export OPENROUTER_API_KEY=sk-or-...    
    python3 test.py

Note: Jev has no free tier, so your OpenRouter account needs a little credit.
"""

import json
import os
import urllib.request

API_URL = "https://openrouter.ai/api/alpha/decisions"  # OpenRouter's Decisions API (beta)
MODEL = "typesafe/jev-1.13"                             # or "typesafe/jev-latest"


def ask_jev(text):
    body = {
        "model": MODEL,
        # "state" = the input data Jev looks at
        "state": {"text": text},
        # "questions" = what you want decided. Here: one "choice" question.
        "questions": {
            "subject": {
                "type": "choice",
                "instructions": "Which school subject does `text` refer to?",
                # Each option needs a short, clear description. Jev has no
                # system prompt, so these label descriptions do the work.
                "criteria": {
                    "Mathematics": "Maths, math, algebra, geometry, numbers, calculation.",
                    "English": "The English language, grammar, literature in English.",
                    "Arabic": "The Arabic language, Arabic grammar or literature.",
                    "Malayalam": "The Malayalam language, Malayalam grammar or literature.",
                },
            }
        },
    }

    req = urllib.request.Request(
        API_URL,
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": "Bearer " + os.environ["OPENROUTER_API_KEY"],
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode("utf-8"))


if __name__ == "__main__":
    for word in ["maths", "grammar of Shakespeare", "ഗണിതം", "അക്ഷരമാല"]:
        result = ask_jev(word)
        answer = result["answers"]["subject"]
        print(f"{word!r:28} -> {answer.get('choice')}  "
              f"(confidence {answer.get('confidence')})")
        # Uncomment to see the probability for every option:
        # print("   ", answer.get("probabilities"))