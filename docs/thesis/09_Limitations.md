# Chapter 9: System Limitations

## 9.1 Technical & Algorithmic Limitations
1. **Initial Proposed Weighting Framework:** The PRS component weights ($0.25, 0.20, 0.15, 0.15, 0.15, 0.10$) constitute an initial proposed framework based on academic literature and institutional practices; they require continuous empirical validation across diverse institutional datasets.
2. **Text-Centric Communication Evaluation:** Speech acoustic parameters (intonation, pitch variation, micro-pauses) are not evaluated; interview scoring evaluates lexical structure, conciseness, technical depth, and prompt adherence.
3. **Scanned PDF Ingestion:** PDF extraction relies on text streams. Non-OCR scanned image PDFs will yield minimal parsable text unless pre-processed via optical character recognition.
4. **LLM Provider Availability & Latency:** While Google Gemini 1.5 Flash provides high accuracy, cloud API availability, latency, and rate limits necessitate a high-fidelity offline fallback (`MockAIService`).
