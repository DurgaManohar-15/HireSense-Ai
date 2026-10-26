# Chapter 3: Problem Statement

## 3.1 Formal Problem Definition
Let $S$ represent a candidate student profile characterized by a vector of demonstrated competencies across $K$ placement dimensions:
$$\mathbf{c} = [c_{\text{coding}}, c_{\text{technical}}, c_{\text{aptitude}}, c_{\text{resume}}, c_{\text{interview}}, c_{\text{comm}}]$$
where each $c_k \in [0, 100] \cup \{\text{null}\}$.

Given target preparation benchmarks $\mathbf{b}_{\text{company}}$ specifying required proficiency thresholds $\theta_j$ across skills $j \in \{1, \dots, M\}$, the system must solve three interrelated problems:
1. **Explainable Readiness Estimation:** Compute an objective readiness index $\text{PRS} \in [0, 100]$ alongside an evidence confidence score $\Gamma \in [0, 100]\%$.
2. **Deterministic Skill Gap Identification:** Compute non-negative proficiency deficits $\delta_j = \max(0, \theta_j - \hat{p}_j)$ where $\hat{p}_j$ is the reconciled multi-source observed proficiency.
3. **Adaptive Roadmap Optimization:** Formulate an optimal learning task schedule $T = \{t_1, t_2, \dots, t_N\}$ spanning $D$ days with $H$ hours/day that minimizes $\sum \delta_j$ subject to candidate time constraints.
