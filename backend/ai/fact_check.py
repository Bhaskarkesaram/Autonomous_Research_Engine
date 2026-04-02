def fact_check(answer, context):
    context_text = " ".join(context).lower()
    answer_text = answer.lower()

    matches = sum(1 for word in answer_text.split() if word in context_text)

    confidence = min(1.0, 0.5 + matches * 0.02)

    return {
        "verified": matches > 3,
        "confidence": round(confidence, 2)
    }