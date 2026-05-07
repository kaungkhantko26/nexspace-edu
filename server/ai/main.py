import math
import re
from collections import Counter

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="NexSpace EDU AI Processing Service")


class AnalyzeRequest(BaseModel):
    text: str = Field(min_length=20, max_length=50000)
    strict: bool = True


class PlagiarismRequest(BaseModel):
    text: str = Field(min_length=20, max_length=50000)
    sources: list[dict] = Field(default_factory=list)


AI_TRANSITIONS = {
    "furthermore",
    "moreover",
    "in conclusion",
    "it is important to note",
    "additionally",
    "in today's",
    "plays a crucial role",
    "delve",
    "underscore",
    "robust",
    "seamless",
    "comprehensive",
}

REFERENCE_CORPUS = [
    {
        "source": "GitHub README and documentation pattern corpus",
        "url": "local://github-public-docs-patterns",
        "text": "installation usage configuration environment variables run build test deploy api endpoint authentication database storage vector search command line options contributing license",
    },
    {
        "source": "Academic web source pattern corpus",
        "url": "local://academic-web-patterns",
        "text": "this study demonstrates findings indicate methodology literature review results discussion conclusion evidence citation peer reviewed analysis framework evaluation",
    },
    {
        "source": "Lecture notes pattern corpus",
        "url": "local://lecture-notes-patterns",
        "text": "learning outcomes assessment criteria key concepts revision notes tutorial practical lab worksheet assignment deadline marking rubric distinction merit pass",
    },
    {
        "source": "AI-generated generic writing pattern corpus",
        "url": "local://ai-writing-patterns",
        "text": "it is important to note furthermore moreover in conclusion plays a crucial role comprehensive robust seamless delve underscores today's rapidly evolving landscape",
    },
]

ACADEMIC_HEDGE_WORDS = {
    "may",
    "might",
    "could",
    "suggests",
    "indicates",
    "potentially",
    "generally",
    "typically",
}


def sentences_from_text(text: str) -> list[str]:
    return [sentence.strip() for sentence in re.split(r"(?<=[.!?])\s+", text.strip()) if sentence.strip()]


def words_from_text(text: str) -> list[str]:
    return re.findall(r"[A-Za-z']+", text.lower())


def safe_divide(numerator: float, denominator: float) -> float:
    return numerator / denominator if denominator else 0.0


def lexical_entropy(words: list[str]) -> float:
    if not words:
        return 0.0
    counts = Counter(words)
    total = len(words)
    return -sum((count / total) * math.log2(count / total) for count in counts.values())


def clamp(value: float, minimum: int = 0, maximum: int = 100) -> int:
    return max(minimum, min(maximum, round(value)))


def shingles(words: list[str], size: int = 5) -> set[str]:
    if len(words) < size:
        return {" ".join(words)} if words else set()
    return {" ".join(words[index:index + size]) for index in range(0, len(words) - size + 1)}


def jaccard(left: set[str], right: set[str]) -> float:
    if not left or not right:
        return 0.0
    return len(left & right) / len(left | right)


def paragraph_blocks(text: str) -> list[str]:
    blocks = [block.strip() for block in re.split(r"\n\s*\n", text.strip()) if block.strip()]
    if len(blocks) <= 1:
        blocks = sentences_from_text(text)
    return blocks


def classify_sentence(sentence: str) -> dict:
    words = words_from_text(sentence)
    lower = sentence.lower()
    avg_word_length = safe_divide(sum(len(word) for word in words), len(words))
    transition_hits = sum(1 for phrase in AI_TRANSITIONS if phrase in lower)
    hedge_hits = sum(1 for word in words if word in ACADEMIC_HEDGE_WORDS)
    comma_density = safe_divide(sentence.count(","), max(len(words), 1))
    length_pressure = max(0, len(words) - 24) * 1.6
    vocabulary_pressure = max(0, avg_word_length - 5.4) * 6
    transition_pressure = transition_hits * 12
    hedge_pressure = min(18, hedge_hits * 3)
    punctuation_pressure = comma_density * 60
    score = clamp(18 + length_pressure + vocabulary_pressure + transition_pressure + hedge_pressure + punctuation_pressure)
    return {
        "sentence": sentence,
        "aiProbability": score,
        "risk": "high" if score >= 72 else "medium" if score >= 45 else "low",
        "signals": {
            "wordCount": len(words),
            "averageWordLength": round(avg_word_length, 2),
            "transitionHits": transition_hits,
            "hedgeHits": hedge_hits,
            "commaDensity": round(comma_density, 3),
        },
    }


def detect_ai_strict(text: str) -> dict:
    sentences = sentences_from_text(text)
    words = words_from_text(text)
    unique_ratio = safe_divide(len(set(words)), len(words))
    entropy = lexical_entropy(words)
    lengths = [len(words_from_text(sentence)) for sentence in sentences]
    average_sentence_length = safe_divide(sum(lengths), len(lengths))
    variance = safe_divide(sum((length - average_sentence_length) ** 2 for length in lengths), len(lengths))
    burstiness = math.sqrt(variance)
    repetition_ratio = 1 - unique_ratio
    transition_density = safe_divide(sum(1 for phrase in AI_TRANSITIONS if phrase in text.lower()), max(len(sentences), 1))
    sentence_scores = [classify_sentence(sentence) for sentence in sentences[:80]]
    sentence_ai_average = safe_divide(sum(item["aiProbability"] for item in sentence_scores), len(sentence_scores))

    # Strict mode deliberately penalizes uniform sentence rhythm and generic academic filler.
    low_burstiness_pressure = max(0, 12 - burstiness) * 3.2
    repetition_pressure = repetition_ratio * 70
    entropy_pressure = max(0, 4.7 - entropy) * 12
    transition_pressure = transition_density * 45
    length_pressure = max(0, average_sentence_length - 22) * 1.8
    ai_score = clamp((sentence_ai_average * 0.48) + low_burstiness_pressure + repetition_pressure + entropy_pressure + transition_pressure + length_pressure)
    human_score = 100 - ai_score
    confidence = clamp(62 + min(22, len(words) / 35) + min(14, len(sentences) * 1.2))

    return {
        "humanScore": human_score,
        "aiScore": ai_score,
        "confidence": confidence,
        "strict": True,
        "summary": {
            "wordCount": len(words),
            "sentenceCount": len(sentences),
            "averageSentenceLength": round(average_sentence_length, 2),
            "burstiness": round(burstiness, 2),
            "lexicalDiversity": round(unique_ratio, 3),
            "lexicalEntropy": round(entropy, 3),
            "repetitionRatio": round(repetition_ratio, 3),
            "transitionDensity": round(transition_density, 3),
        },
        "signals": {
            "perplexityProxy": "low" if entropy < 4.2 else "medium" if entropy < 5.3 else "high",
            "burstiness": "low" if burstiness < 7 else "medium" if burstiness < 13 else "high",
            "repetition": "high" if repetition_ratio > 0.58 else "medium" if repetition_ratio > 0.44 else "low",
            "uniformSentenceRhythm": burstiness < 8,
            "genericAcademicPhrasing": transition_density > 0.14,
        },
        "sentenceLevel": sentence_scores,
        "suggestions": [
            "Add source-specific examples, quotations, data points, or lecture references.",
            "Vary sentence length and structure instead of repeating balanced explanatory paragraphs.",
            "Replace generic transition phrases with precise claims tied to evidence.",
            "Add a short reflective or methodological note where appropriate for authentic academic voice.",
        ],
    }


def detect_plagiarism(text: str, sources: list[dict]) -> dict:
    submitted_words = words_from_text(text)
    submitted_shingles = shingles(submitted_words, 5)
    submitted_bigrams = shingles(submitted_words, 2)
    blocks = paragraph_blocks(text)

    source_pool = REFERENCE_CORPUS + [
        {
            "source": str(source.get("name", "Uploaded comparison source")),
            "url": str(source.get("url", "local://uploaded-source")),
            "text": str(source.get("text", "")),
        }
        for source in sources
        if str(source.get("text", "")).strip()
    ]

    matches = []
    for source in source_pool:
        source_words = words_from_text(source["text"])
        source_score = jaccard(submitted_shingles, shingles(source_words, 5))
        phrase_score = jaccard(submitted_bigrams, shingles(source_words, 2))
        blended_score = clamp((source_score * 78) + (phrase_score * 32))
        if blended_score >= 4:
            matches.append({
                "source": source["source"],
                "url": source["url"],
                "match": blended_score,
                "semanticOverlap": round(source_score, 3),
                "phraseOverlap": round(phrase_score, 3),
            })

    repeated_blocks = []
    seen = Counter(block.lower() for block in blocks)
    for block, count in seen.items():
        if count > 1 and len(block.split()) >= 8:
            repeated_blocks.append({"text": block[:260], "count": count})

    highlighted = []
    for sentence in sentences_from_text(text)[:80]:
        sentence_words = words_from_text(sentence)
        sentence_shingles = shingles(sentence_words, 4)
        best_match = 0
        best_source = None
        for source in source_pool:
            score = jaccard(sentence_shingles, shingles(words_from_text(source["text"]), 4))
            if score > best_match:
                best_match = score
                best_source = source["source"]
        if best_match >= 0.18:
            highlighted.append({
                "sentence": sentence,
                "risk": "high" if best_match >= 0.34 else "medium",
                "source": best_source,
                "overlap": round(best_match, 3),
            })

    citation_markers = len(re.findall(r"\([A-Za-z][A-Za-z-]+,\s*\d{4}\)|\[\d+\]|\bet al\.", text))
    claim_sentences = [sentence for sentence in sentences_from_text(text) if len(words_from_text(sentence)) > 14]
    citation_issue_score = clamp(max(0, len(claim_sentences) - citation_markers) * 4)
    source_similarity = max([match["match"] for match in matches], default=0)
    duplicate_score = min(24, len(repeated_blocks) * 8)
    similarity = clamp(source_similarity + duplicate_score + citation_issue_score * 0.45)

    return {
        "similarity": similarity,
        "confidence": clamp(70 + min(20, len(submitted_words) / 80)),
        "sourceMatches": sorted(matches, key=lambda item: item["match"], reverse=True)[:8],
        "highlightedText": highlighted,
        "duplicateParagraphs": repeated_blocks,
        "citationIssues": {
            "citationMarkers": citation_markers,
            "longClaimSentences": len(claim_sentences),
            "riskScore": citation_issue_score,
        },
        "recommendations": [
            "Add citations beside source-dependent claims, not only at the end of the paragraph.",
            "Rewrite highlighted sentences with your own structure and source-specific evidence.",
            "Quote exact copied phrasing or replace it with a properly cited paraphrase.",
            "Compare against uploaded source files for stricter local similarity review.",
        ],
    }


@app.get("/health")
def health():
    return {"ok": True, "service": "nexspace-ai"}


@app.post("/detect-ai")
def detect_ai(payload: AnalyzeRequest):
    return detect_ai_strict(payload.text)


@app.post("/plagiarism")
def plagiarism(payload: PlagiarismRequest):
    return detect_plagiarism(payload.text, payload.sources)


@app.post("/chunk")
def chunk(payload: AnalyzeRequest):
    text = " ".join(payload.text.split())
    chunks = [text[index:index + 1200] for index in range(0, len(text), 1200)]
    return {"chunks": chunks}
