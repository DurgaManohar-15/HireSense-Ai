# Chapter 4: Proposed Methodology

## 4.1 Hybrid Architecture Paradigm
HireSense AI enforces a strict multi-layer separation between deterministic numerical processing and qualitative AI guidance:
$$\text{Raw Student Inputs} \longrightarrow \text{Deterministic Scoring \& Normalization} \longrightarrow \text{PRS \& Skill Gaps} \longrightarrow \text{AI Contextual Explanation}$$

## 4.2 Placement Readiness Score (PRS) Mathematical Formulation
The Placement Readiness Score is computed over available components $\mathcal{A} \subseteq \{1, \dots, 6\}$:
$$\text{PRS} = \sum_{i \in \mathcal{A}} \left( \text{Score}_i \times \frac{w_i}{\sum_{k \in \mathcal{A}} w_k} \right)$$

### Proposed Initial Weights Framework (v1.0.0):
* $w_1 = 0.25$ (Coding Sandbox — dynamically normalized when sandbox is pending)
* $w_2 = 0.20$ (Core Technical Knowledge)
* $w_3 = 0.15$ (Quantitative Aptitude & Logic)
* $w_4 = 0.15$ (Resume ATS Parsability & Depth)
* $w_5 = 0.15$ (Mock Interview Technical Index)
* $w_6 = 0.10$ (Communication Quality & Structure)

## 4.3 Temporal Recency Weighting
Observed diagnostic attempts are weighted by their recency $t$ (days elapsed):
$$w_{\text{recency}}(t) = \begin{cases} 
1.00 & \text{if } t \le 30 \\ 
0.85 & \text{if } 30 < t \le 60 \\ 
0.70 & \text{if } 60 < t \le 90 \\ 
0.55 & \text{if } t > 90 
\end{cases}$$

## 4.4 Assessment Confidence Score
The confidence score $\Gamma \in [0, 100]\%$ measures evidence coverage:
$$\Gamma = \min\left(100, \left(\frac{|\mathcal{A}|}{6} \times 50\right) + \min(25, N_{\text{assessments}} \times 8) + \text{ArtifactBonus} + \text{ProfileBonus}\right)$$
