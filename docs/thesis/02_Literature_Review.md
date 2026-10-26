# Chapter 2: Literature Review

## 2.1 Automated Assessment & Item Response Theory
Educational measurement systems traditionally employ standardized computerized adaptive testing (CAT) and Item Response Theory (IRT) (Lord, 1980) to estimate latent student ability from discrete test responses. While effective for standardized multiple-choice questions, conventional IRT models struggle to incorporate unstructured artifact data, such as resume textual summaries and interactive interview responses.

## 2.2 Normalized Learning Gain in Educational Interventions
Richard Hake (1998) introduced the **Normalized Learning Gain ($g$)** to measure the effectiveness of active-learning educational interventions:
$$g = \frac{\% \text{Post} - \% \text{Pre}}{100 - \% \text{Pre}}$$
Hake defined gain regimes as:
* High gain: $g \ge 0.70$
* Medium gain: $0.30 \le g < 0.70$
* Low gain: $g < 0.30$

This metric normalizes for student pre-intervention proficiency, preventing ceiling effects from skewing evaluation outcomes.

## 2.3 Large Language Models in Formative Assessment
Recent research (Achiam et al., 2023; Bubeck et al., 2023) demonstrates the efficacy of Large Language Models in providing formative qualitative feedback and rubric-based grading. However, unconstrained LLM grading introduces variance, hallucination risks, and prompt injection vulnerabilities. HireSense AI addresses this by decoupling numerical scoring (deterministic mathematical engine) from qualitative explanation generation (hybrid AI layer).
