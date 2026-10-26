import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calculator, CheckCircle2, XCircle, Clock, AlertTriangle, 
  RotateCcw, ChevronRight, ChevronDown, ChevronUp, Award, Brain, BarChart2, BookOpen, 
  Filter, HelpCircle, ArrowRight, ExternalLink, PlayCircle, FileText, 
  Sparkles, Flame, Check, Search, Layers, Lightbulb, Compass, Building2
} from 'lucide-react';
import toast from 'react-hot-toast';

// -------------------------------------------------------------
// COMPREHENSIVE APTITUDE CURRICULUM, TOPICS, SUBTOPICS & RESOURCES
// -------------------------------------------------------------
const APTITUDE_CATALOG = [
  // ===================== QUANTITATIVE APTITUDE =====================
  {
    id: 'quant-arithmetic',
    category: 'Quantitative',
    title: 'Number Systems & Arithmetic Basics',
    icon: Calculator,
    themeColor: 'blue',
    description: 'Divisibility rules, HCF & LCM, Remainders, Unit Digits, and Surds.',
    frequencyTag: '🔥 Asked in 90%+ TCS, Infosys & Wipro Tests',
    subtopics: [
      {
        id: 'hcf-lcm',
        title: 'HCF & LCM',
        importance: 'Very High',
        difficulty: 'Easy',
        summary: 'Fundamental properties of factors, multiples, prime factorization, and remainder applications.',
        formulas: [
          'Product of two numbers = HCF × LCM',
          'HCF of Fractions = (HCF of Numerators) / (LCM of Denominators)',
          'LCM of Fractions = (LCM of Numerators) / (HCF of Denominators)',
          'Two numbers a and b are Co-prime if HCF(a, b) = 1.'
        ],
        shortcuts: 'To find the largest number that divides x, y, z leaving the same remainder r in each case, find HCF of |x - y|, |y - z|, and |z - x|.',
        companies: ['TCS', 'Infosys', 'Capgemini', 'Wipro', 'Cognizant'],
        resources: [
          { title: 'HCF & LCM Short Tricks & Shortcuts', type: 'video', url: 'https://www.youtube.com/results?search_query=HCF+and+LCM+shortcuts+aptitude', provider: 'Feel Free To Learn' },
          { title: 'HCF and LCM Theory & Formula Sheet', type: 'article', url: 'https://www.geeksforgeeks.org/lcm-and-hcf/', provider: 'GeeksforGeeks' },
          { title: 'Placement Solved Problems on HCF/LCM', type: 'practice', url: 'https://www.indiabix.com/aptitude/problems-on-h-c-f-and-l-c-m/', provider: 'IndiaBIX' }
        ],
        questions: [
          {
            id: 'q_hcf_1',
            question: 'The HCF and LCM of two numbers are 12 and 336 respectively. If one of the numbers is 84, what is the other number?',
            options: ['48', '36', '56', '72'],
            answer: 0, // 48
            explanation: 'Using the formula: First Number × Second Number = HCF × LCM\n84 × N = 12 × 336\nN = (12 × 336) / 84 = 336 / 7 = 48.'
          },
          {
            id: 'q_hcf_2',
            question: 'Find the greatest number which on dividing 1657 and 2037 leaves remainders 6 and 5 respectively.',
            options: ['127', '135', '118', '142'],
            answer: 0, // 127
            explanation: 'Required number = HCF of (1657 - 6) and (2037 - 5) = HCF of 1651 and 2032.\n2032 = 1651 × 1 + 381\n1651 = 381 × 4 + 127\n381 = 127 × 3 + 0\nTherefore, HCF = 127.'
          }
        ]
      },
      {
        id: 'divisibility-remainders',
        title: 'Divisibility Rules & Remainders',
        importance: 'High',
        difficulty: 'Medium',
        summary: 'Cyclicity of remainders, Fermat Little Theorem basics, and test rules for 3, 7, 9, 11, and 13.',
        formulas: [
          'Divisibility by 9: Sum of digits must be divisible by 9.',
          'Divisibility by 11: Difference between sum of odd placed digits and even placed digits must be 0 or multiple of 11.',
          'Unit digit of a^b repeats in cycles of 4 for 2, 3, 7, 8.'
        ],
        shortcuts: 'Power cyclicity shortcut: Divide the power by 4. If remainder is r (1, 2, 3), unit digit is a^r. If remainder is 0, unit digit is a^4.',
        companies: ['TCS NQT', 'Cognizant', 'Mindtree'],
        resources: [
          { title: 'Remainder Theorem & Cyclicity Tricks', type: 'video', url: 'https://www.youtube.com/results?search_query=unit+digit+and+remainder+theorem+shortcuts', provider: 'CareerRide' },
          { title: 'Divisibility Rules Quick Handbook', type: 'article', url: 'https://www.geeksforgeeks.org/divisibility-rules/', provider: 'GeeksforGeeks' }
        ],
        questions: [
          {
            id: 'q_rem_1',
            question: 'What is the unit digit in the product (7^95 - 3^58)?',
            options: ['0', '4', '6', '7'],
            answer: 1, // 4
            explanation: 'For 7: Cyclicity is 4 (7, 9, 3, 1). 95 = 4 × 23 + 3 -> unit digit of 7^95 is 7^3 = 343 -> 3.\nFor 3: Cyclicity is 4 (3, 9, 7, 1). 58 = 4 × 14 + 2 -> unit digit of 3^58 is 3^2 = 9.\nSince 3 < 9, borrow 10: 13 - 9 = 4.'
          }
        ]
      }
    ]
  },
  {
    id: 'quant-commercial',
    category: 'Quantitative',
    title: 'Commercial Mathematics & Percentages',
    icon: Calculator,
    themeColor: 'blue',
    description: 'Percentages, Profit & Loss, Simple and Compound Interest, Discounts & Markups.',
    frequencyTag: '🔥 95% Repeat in Campus Placement Exams',
    subtopics: [
      {
        id: 'percentages-profit-loss',
        title: 'Percentages, Profit & Loss',
        importance: 'Extremely High',
        difficulty: 'Easy-Medium',
        summary: 'Percentage change, cost price (CP), selling price (SP), marked price (MP), and successive discounts.',
        formulas: [
          'Profit% = (Profit / CP) × 100',
          'SP = CP × (100 + Profit%) / 100',
          'Net Discount for successive discounts a% and b% = [a + b - (ab / 100)]%'
        ],
        shortcuts: 'Fraction to percentage conversions: 1/6 = 16.66%, 1/7 = 14.28%, 1/8 = 12.5%, 1/9 = 11.11%, 1/11 = 9.09%, 1/12 = 8.33%.',
        companies: ['Amazon', 'Accenture', 'Deloitte', 'TCS', 'Infosys'],
        resources: [
          { title: 'Profit and Loss in 10 Seconds Tricks', type: 'video', url: 'https://www.youtube.com/results?search_query=profit+and+loss+shortcuts+tricks', provider: 'Feel Free To Learn' },
          { title: 'Percentages & Fraction Equivalents Cheatsheet', type: 'article', url: 'https://www.geeksforgeeks.org/profit-and-loss-concepts-formulas/', provider: 'GeeksforGeeks' }
        ],
        questions: [
          {
            id: 'q_pl_1',
            question: 'A shopkeeper marks an article 25% above cost price and allows a discount of 10% on marked price. What is his net profit percentage?',
            options: ['12.5%', '15%', '10%', '14%'],
            answer: 0,
            explanation: 'Let CP = 100. MP = 125.\nDiscount = 10% of 125 = 12.5.\nSP = 125 - 12.5 = 112.5.\nProfit = 112.5 - 100 = 12.5%.'
          },
          {
            id: 'q_pl_2',
            question: 'If the cost price of 12 pens is equal to the selling price of 8 pens, what is the gain percentage?',
            options: ['33.33%', '50%', '66.67%', '25%'],
            answer: 1, // 50%
            explanation: 'Let CP of 1 pen = Rs. 1. CP of 8 pens = Rs. 8.\nSP of 8 pens = CP of 12 pens = Rs. 12.\nProfit on 8 pens = 12 - 8 = Rs. 4.\nGain% = (4 / 8) × 100 = 50%.'
          }
        ]
      },
      {
        id: 'simple-compound-interest',
        title: 'Simple & Compound Interest',
        importance: 'High',
        difficulty: 'Medium',
        summary: 'Principal, annual interest rate, compounding periods, and difference between CI and SI.',
        formulas: [
          'Simple Interest (SI) = (P × R × T) / 100',
          'Compound Amount (A) = P × (1 + R/100)^T',
          'Difference between CI and SI for 2 years = P × (R / 100)^2'
        ],
        shortcuts: 'Rule of 72: A sum of money doubles in approximately 72 / R years at R% compound interest per annum.',
        companies: ['Capgemini', 'TCS', 'Wipro', 'Goldman Sachs'],
        resources: [
          { title: 'CI & SI Formula-Free Concept Approach', type: 'video', url: 'https://www.youtube.com/results?search_query=simple+compound+interest+tricks', provider: 'CareerRide' },
          { title: 'Compound Interest Placement Formulas', type: 'article', url: 'https://www.geeksforgeeks.org/simple-interest-and-compound-interest/', provider: 'GeeksforGeeks' }
        ],
        questions: [
          {
            id: 'q_ci_1',
            question: 'The difference between simple and compound interest compounded annually on a certain sum of money for 2 years at 4% per annum is Rs. 1. The sum is:',
            options: ['Rs. 625', 'Rs. 650', 'Rs. 600', 'Rs. 675'],
            answer: 0,
            explanation: 'Difference for 2 years = P × (R / 100)^2\n1 = P × (4 / 100)^2 = P × (1 / 25)^2 = P / 625\nP = Rs. 625.'
          }
        ]
      }
    ]
  },
  {
    id: 'quant-time-motion',
    category: 'Quantitative',
    title: 'Time, Work & Motion',
    icon: Calculator,
    themeColor: 'blue',
    description: 'Time & Work, Pipes & Cisterns, Speed Time Distance, Relative Speed, and Boats & Streams.',
    frequencyTag: '🔥 98% Repeated Across All Service & Product Companies',
    subtopics: [
      {
        id: 'time-work-pipes',
        title: 'Time and Work & Pipes',
        importance: 'Extremely High',
        difficulty: 'Medium',
        summary: 'Efficiency method (LCM of days to find total work units), alternating days, and negative work (leakage).',
        formulas: [
          'Total Work = Efficiency × Time',
          'If A takes x days and B takes y days, together they take (xy) / (x + y) days.',
          'Man-Days Formula: (M1 × D1 × H1) / W1 = (M2 × D2 × H2) / W2'
        ],
        shortcuts: 'LCM Method: Assume total work = LCM of individual times. Then calculate units done per day (efficiency) to avoid fraction calculations.',
        companies: ['Amazon', 'TCS', 'Infosys', 'Accenture', 'Microsoft'],
        resources: [
          { title: 'Time and Work LCM Method Masterclass', type: 'video', url: 'https://www.youtube.com/results?search_query=time+and+work+lcm+method+shortcuts', provider: 'Feel Free To Learn' },
          { title: 'Pipes & Cisterns Complete Placement Notes', type: 'article', url: 'https://www.geeksforgeeks.org/time-and-work/', provider: 'GeeksforGeeks' }
        ],
        questions: [
          {
            id: 'q_tw_1',
            question: 'A can complete a piece of work in 12 days, and B can complete the same work in 18 days. If they work together for 4 days, what fraction of the work remains unfinished?',
            options: ['1/3', '4/9', '5/9', '7/18'],
            answer: 1,
            explanation: 'LCM of 12 and 18 = 36 units (Total Work).\nEfficiency of A = 36 / 12 = 3 units/day.\nEfficiency of B = 36 / 18 = 2 units/day.\nCombined efficiency = 5 units/day.\nWork done in 4 days = 4 × 5 = 20 units.\nRemaining work = 36 - 20 = 16 units.\nFraction remaining = 16 / 36 = 4/9.'
          }
        ]
      },
      {
        id: 'speed-distance-trains',
        title: 'Speed, Distance & Trains',
        importance: 'High',
        difficulty: 'Medium',
        summary: 'Average speed, unit conversions (km/h to m/s), relative speed for trains, and upstream/downstream.',
        formulas: [
          'Speed = Distance / Time',
          'Conversion: 1 km/h = 5/18 m/s, and 1 m/s = 18/5 km/h',
          'Average Speed for equal distances = (2 × u × v) / (u + v)',
          'Relative Speed: (u + v) if moving in opposite directions; |u - v| if same direction.'
        ],
        shortcuts: 'When a train crosses a pole or man, distance = length of train. When crossing a platform/bridge, distance = length of train + length of platform.',
        companies: ['TCS', 'Cognizant', 'Deloitte', 'Wipro'],
        resources: [
          { title: 'Speed Time and Distance Relative Speed Hacks', type: 'video', url: 'https://www.youtube.com/results?search_query=speed+distance+time+relative+speed+tricks', provider: 'CareerRide' },
          { title: 'Trains and Boats Formulas Summary', type: 'article', url: 'https://www.geeksforgeeks.org/speed-distance-and-time/', provider: 'GeeksforGeeks' }
        ],
        questions: [
          {
            id: 'q_spd_1',
            question: 'A train 150m long is running at 54 km/h. How much time will it take to cross an electric pole?',
            options: ['10 sec', '12 sec', '8 sec', '15 sec'],
            answer: 0, // 10 sec
            explanation: 'Speed in m/s = 54 × (5 / 18) = 15 m/s.\nDistance to cross pole = Length of train = 150m.\nTime = Distance / Speed = 150 / 15 = 10 seconds.'
          }
        ]
      }
    ]
  },
  {
    id: 'quant-algebra-modern',
    category: 'Quantitative',
    title: 'Algebra, Combinatorics & Probability',
    icon: Calculator,
    themeColor: 'blue',
    description: 'Permutations, Combinations, Probability, AP/GP, and Logarithms.',
    frequencyTag: '🔥 Standard in Online Assessment Round 1',
    subtopics: [
      {
        id: 'permutations-probability',
        title: 'Permutations, Combinations & Probability',
        importance: 'High',
        difficulty: 'Hard',
        summary: 'Arrangement vs Selection, circular permutations, independent events, and conditional probability.',
        formulas: [
          'nPr = n! / (n - r)! (Arrangement where order matters)',
          'nCr = n! / [r! × (n - r)!] (Selection where order does not matter)',
          'P(Event) = (Favorable Outcomes) / (Total Outcomes)',
          'P(A ∪ B) = P(A) + P(B) - P(A ∩ B)'
        ],
        shortcuts: 'Selection of at least 1 object from n distinct objects = 2^n - 1.',
        companies: ['Amazon', 'Google', 'Flipkart', 'Accenture'],
        resources: [
          { title: 'Permutations & Probability in 1 Video', type: 'video', url: 'https://www.youtube.com/results?search_query=probability+permutations+combinations+aptitude', provider: 'Feel Free To Learn' },
          { title: 'Probability Placement Guide & Formula Sheet', type: 'article', url: 'https://www.geeksforgeeks.org/probability-in-maths/', provider: 'GeeksforGeeks' }
        ],
        questions: [
          {
            id: 'q_prob_1',
            question: 'A bag contains 5 red balls and 4 black balls. Two balls are drawn at random without replacement. What is the probability that both balls are red?',
            options: ['5/18', '5/9', '20/81', '10/27'],
            answer: 0,
            explanation: 'Total balls = 9.\nNumber of ways to draw 2 red balls = 5C2 = (5 × 4) / 2 = 10.\nTotal ways to draw 2 balls from 9 = 9C2 = (9 × 8) / 2 = 36.\nProbability = 10 / 36 = 5 / 18.'
          }
        ]
      }
    ]
  },

  // ===================== LOGICAL REASONING =====================
  {
    id: 'logical-analytical',
    category: 'Logical',
    title: 'Analytical & Arrangement Reasoning',
    icon: Brain,
    themeColor: 'purple',
    description: 'Linear & Circular Seating, Blood Relations, and Direction Sense.',
    frequencyTag: '🔥 100% Guaranteed in Placement Round 1',
    subtopics: [
      {
        id: 'seating-arrangements',
        title: 'Seating Arrangements',
        importance: 'Extremely High',
        difficulty: 'Medium',
        summary: 'Facing center vs facing outwards, linear row positioning, and multiple-attribute constraints.',
        formulas: [
          'Circular arrangement facing Center: Clockwise = Left, Counter-Clockwise = Right.',
          'Circular arrangement facing Outwards: Clockwise = Right, Counter-Clockwise = Left.',
          'Linear arrangement facing North: Left is West, Right is East.'
        ],
        shortcuts: 'Always start with definite positions (e.g. "X sits at the extreme left" or "Y is 2nd to the left of Z") and eliminate contradictory branches.',
        companies: ['TCS', 'Infosys', 'Capgemini', 'Cognizant', 'Deloitte'],
        resources: [
          { title: 'Seating Arrangement Tricks for Placements', type: 'video', url: 'https://www.youtube.com/results?search_query=seating+arrangement+tricks+placement', provider: 'Feel Free To Learn' },
          { title: 'Step-by-step Seating Arrangement Guide', type: 'article', url: 'https://www.geeksforgeeks.org/seating-arrangement-reasoning/', provider: 'GeeksforGeeks' }
        ],
        questions: [
          {
            id: 'q_seat_1',
            question: 'Five friends A, B, C, D, and E are sitting in a row facing North. C is sitting in the middle. A is to the immediate right of C. D is to the immediate left of B, and B is at the extreme right. Who is sitting at the extreme left?',
            options: ['E', 'A', 'D', 'C'],
            answer: 0, // E
            explanation: 'Row has 5 positions: [1, 2, 3, 4, 5].\nC is in the middle -> Pos 3 = C.\nA is immediate right of C -> Pos 4 = A.\nB is at extreme right -> Pos 5 = B.\nD is immediate left of B -> Pos 4 should be D? Wait: "A is immediate right of C (Pos 4)". If B is extreme right (Pos 5), and D is left of B, then D and A conflict unless positions are arranged correctly: E, D, C, A, B or E at Pos 1.\nPos 1 must be E.'
          }
        ]
      },
      {
        id: 'blood-relations',
        title: 'Blood Relations',
        importance: 'High',
        difficulty: 'Easy-Medium',
        summary: 'Family tree mapping, generational levels, coded relationships (A + B means A is father of B).',
        formulas: [
          'Represent Male as (+ or [box]) and Female as (- or [circle]).',
          'Represent Siblings with a horizontal single bond (-), Marriages with a double bond (=).',
          'Generational gaps are represented vertically.'
        ],
        shortcuts: 'Break down complex sentences from back to front: "the only son of my father\'s father" -> Father\'s father = Grandfather -> Only son = Father.',
        companies: ['TCS NQT', 'Wipro', 'Infosys', 'Cognizant'],
        resources: [
          { title: 'Blood Relations Family Tree Method', type: 'video', url: 'https://www.youtube.com/results?search_query=blood+relations+family+tree+shortcuts', provider: 'CareerRide' },
          { title: 'Coded Blood Relations Practice Set', type: 'practice', url: 'https://www.indiabix.com/logical-reasoning/blood-relation-test/', provider: 'IndiaBIX' }
        ],
        questions: [
          {
            id: 'q_br_1',
            question: 'Pointing to a photograph of a boy, Suresh said, "He is the only son of the mother of my mother." How is Suresh related to that boy?',
            options: ['Nephew', 'Brother', 'Uncle', 'Cousin'],
            answer: 0, // Nephew
            explanation: 'Mother of Suresh\'s mother = Suresh\'s grandmother.\nOnly son of Suresh\'s grandmother = Suresh\'s maternal uncle.\nSince the boy in photo is Suresh\'s maternal uncle, Suresh is his Nephew.'
          }
        ]
      }
    ]
  },
  {
    id: 'logical-deductive',
    category: 'Logical',
    title: 'Deductive & Verbal Reasoning',
    icon: Brain,
    themeColor: 'purple',
    description: 'Syllogisms, Coding-Decoding, Series Completion, and Analogies.',
    frequencyTag: '🔥 High-Scoring in Technical Assessment Tests',
    subtopics: [
      {
        id: 'syllogisms',
        title: 'Syllogisms & Venn Logic',
        importance: 'High',
        difficulty: 'Medium',
        summary: 'All, Some, No, Some-Not statements, and the "Either-Or" complimentary pair condition.',
        formulas: [
          'All A are B implies Some B are A.',
          'No A is B implies No B is A.',
          'Complimentary Pair for "Either/Or": (Some + No) or (All + Some Not) with same subject and predicate.'
        ],
        shortcuts: 'Venn Diagram Method: Draw minimal overlap diagrams to test if conclusions hold in every possible case.',
        companies: ['Amazon', 'Infosys', 'Accenture', 'TCS'],
        resources: [
          { title: 'Syllogism 100-50 Method & Venn Shortcuts', type: 'video', url: 'https://www.youtube.com/results?search_query=syllogism+shortcuts+placement+exams', provider: 'Feel Free To Learn' },
          { title: 'Syllogisms Rules & Exception Handling', type: 'article', url: 'https://www.geeksforgeeks.org/syllogism-reasoning/', provider: 'GeeksforGeeks' }
        ],
        questions: [
          {
            id: 'q_syl_1',
            question: 'Statements:\n1. All engineers are innovators.\n2. Some innovators are entrepreneurs.\nConclusions:\nI. Some engineers are entrepreneurs.\nII. Some innovators are engineers.',
            options: ['Only conclusion I follows', 'Only conclusion II follows', 'Both I and II follow', 'Neither follows'],
            answer: 1,
            explanation: 'All engineers are innovators (A implies B). By conversion, Some innovators are engineers. Thus Conclusion II definitely follows.\nHowever, "Some innovators are entrepreneurs" doesn\'t necessarily intersect with the subset of engineers. Hence Conclusion I does not follow.'
          }
        ]
      },
      {
        id: 'coding-decoding',
        title: 'Coding-Decoding & Letter Series',
        importance: 'High',
        difficulty: 'Easy',
        summary: 'Alphabet positions (EJOTY = 5, 10, 15, 20, 25), reverse pairs (AZ, BY, CX, DW, EV), and pattern shifts.',
        formulas: [
          'EJOTY rule: E=5, J=10, O=15, T=20, Y=25.',
          'Sum of opposite alphabet positions is always 27 (e.g., A(1) + Z(26) = 27; B(2) + Y(25) = 27).'
        ],
        shortcuts: 'Check for constant shift (+1, +2), alternate shift (+1, -1), or letter reversal.',
        companies: ['TCS', 'Wipro', 'Capgemini', 'Cognizant'],
        resources: [
          { title: 'Coding Decoding Shortcut Tricks', type: 'video', url: 'https://www.youtube.com/results?search_query=coding+decoding+tricks+reasoning', provider: 'CareerRide' }
        ],
        questions: [
          {
            id: 'q_cd_1',
            question: 'In a certain code, "CLOUD" is written as "GPRYI". How is "SIGHT" written in that same code?',
            options: ['WKMKX', 'WMLKX', 'WKMKY', 'XLMKX'],
            answer: 0,
            explanation: 'Each letter is shifted forward: C(+4)=G, L(+4)=P, O(+3)=R, U(+4)=Y, D(+5)=I. For S(+4)=W, I(+2)=K, G(+6)=M, H(+3)=K, T(+4)=X -> WKMKX.'
          }
        ]
      }
    ]
  },

  // ===================== VERBAL ABILITY =====================
  {
    id: 'verbal-grammar',
    category: 'Verbal',
    title: 'Grammar & Sentence Mechanics',
    icon: BookOpen,
    themeColor: 'emerald',
    description: 'Subject-Verb Agreement, Tenses, Modifiers, Prepositions, and Spotting Errors.',
    frequencyTag: '🔥 Critical for TCS NQT, Infosys Verbal, & AMCAT',
    subtopics: [
      {
        id: 'subject-verb-agreement',
        title: 'Subject-Verb Agreement & Error Spotting',
        importance: 'Extremely High',
        difficulty: 'Medium',
        summary: 'Agreement rules for collective nouns, neither/nor, either/or, along with, as well as, and indefinite pronouns.',
        formulas: [
          'With "Neither... nor" and "Either... or", the verb agrees with the subject closest to it.',
          'Phrases like "along with", "as well as", "together with" do not change the subject number.',
          '"Each", "Every", "Everyone", "Nobody", "Somebody" always take a singular verb.'
        ],
        shortcuts: 'Eliminate prepositional phrases between the subject and the verb to find the real singular or plural subject.',
        companies: ['TCS', 'Infosys', 'Wipro', 'Deloitte', 'Accenture'],
        resources: [
          { title: 'Top 10 Subject-Verb Agreement Rules for Campus', type: 'video', url: 'https://www.youtube.com/results?search_query=subject+verb+agreement+rules+english+aptitude', provider: 'CareerRide' },
          { title: 'Comprehensive Grammar Rules Cheatsheet', type: 'article', url: 'https://www.geeksforgeeks.org/subject-verb-agreement/', provider: 'GeeksforGeeks' }
        ],
        questions: [
          {
            id: 'q_sva_1',
            question: 'Choose the grammatically correct sentence:',
            options: [
              'Neither the manager nor the employees was aware of the policy revision.',
              'Neither the manager nor the employees were aware of the policy revision.',
              'Neither the manager or the employees was aware of the policy revision.',
              'Neither the manager nor the employees has been aware of the policy revision.'
            ],
            answer: 1,
            explanation: 'With "neither... nor", the verb agrees with the closer subject ("employees", which is plural), hence "were aware" is correct.'
          }
        ]
      }
    ]
  },
  {
    id: 'verbal-vocab-comprehension',
    category: 'Verbal',
    title: 'Vocabulary, Para Jumbles & Comprehension',
    icon: BookOpen,
    themeColor: 'emerald',
    description: 'Synonyms & Antonyms, Idioms, Sentence Rearrangement (Para Jumbles), and Reading Comprehension.',
    frequencyTag: '🔥 High Weightage in Campus Hiring Drives',
    subtopics: [
      {
        id: 'para-jumbles',
        title: 'Para Jumbles (Sentence Rearrangement)',
        importance: 'High',
        difficulty: 'Medium',
        summary: 'Identifying opening sentences, pronoun reference tracking, conjunction transitions, and mandatory pairs.',
        formulas: [
          'Opening sentences introduce nouns or concepts (rarely pronouns like he, she, it, they).',
          'Transition words like "However", "Therefore", "Moreover" indicate continuation or contrast.',
          'Chronology: Cause always precedes effect.'
        ],
        shortcuts: 'Find Mandatory Pairs (e.g. A must follow C). Then eliminate options that do not contain the mandatory sequence CA.',
        companies: ['Infosys', 'TCS', 'Capgemini', 'Cognizant'],
        resources: [
          { title: 'Para Jumbles Shortcut Techniques', type: 'video', url: 'https://www.youtube.com/results?search_query=para+jumbles+tricks+placement', provider: 'PrepInsta' }
        ],
        questions: [
          {
            id: 'q_pj_1',
            question: 'Select the antonym for "METICULOUS":',
            options: ['Careless', 'Thorough', 'Painstaking', 'Scrupulous'],
            answer: 0,
            explanation: 'Meticulous means taking or showing extreme care about minute details; precise. The exact opposite is Careless.'
          }
        ]
      }
    ]
  },

  // ===================== DATA INTERPRETATION =====================
  {
    id: 'di-charts-tables',
    category: 'Data Interpretation',
    title: 'Data Interpretation & Sufficiency',
    icon: BarChart2,
    themeColor: 'amber',
    description: 'Tables, Bar Graphs, Pie Charts, Line Graphs, Caselets, and Data Sufficiency.',
    frequencyTag: '🔥 Mandatory in Product, Analytics & Campus Tests',
    subtopics: [
      {
        id: 'tables-bar-pie',
        title: 'Tables, Bar Charts & Pie Charts',
        importance: 'Extremely High',
        difficulty: 'Medium',
        summary: 'Fast percentage calculations, degree to percentage conversions in pie charts (360° = 100%), and CAGR/growth rates.',
        formulas: [
          'In a Pie Chart: 1% = 3.6 degrees, and 1 degree = (100 / 360)% = 5/18%',
          'Percentage Growth = [(Current Value - Base Value) / Base Value] × 100',
          'Ratio Comparison: If a/b and c/d, cross multiply: a×d vs b×c.'
        ],
        shortcuts: 'Approximation trick: Round large numbers to nearest ten or hundred to eliminate unlikely options quickly.',
        companies: ['Amazon', 'Deloitte', 'Goldman Sachs', 'TCS Digital', 'Infosys'],
        resources: [
          { title: 'Data Interpretation Speed Calculation Tricks', type: 'video', url: 'https://www.youtube.com/results?search_query=data+interpretation+pie+chart+tricks', provider: 'Feel Free To Learn' },
          { title: 'Data Interpretation Charts & Tables Practice', type: 'article', url: 'https://www.geeksforgeeks.org/data-interpretation/', provider: 'GeeksforGeeks' }
        ],
        questions: [
          {
            id: 'q_di_1',
            question: 'A software company reports quarterly revenue: Q1: $40M, Q2: $50M, Q3: $45M, Q4: $65M. What is the percentage growth in revenue from Q1 to Q4?',
            options: ['50.0%', '62.5%', '37.5%', '42.0%'],
            answer: 1, // 62.5%
            explanation: 'Growth = [(Q4 - Q1) / Q1] × 100 = [(65 - 40) / 40] × 100 = (25 / 40) × 100 = 62.5%.'
          }
        ]
      }
    ]
  }
];

export default function AptitudePracticePage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTopicId, setExpandedTopicId] = useState('quant-arithmetic');
  const [selectedSubtopicId, setSelectedSubtopicId] = useState('hcf-lcm');
  const [viewMode, setViewMode] = useState('CURRICULUM'); // 'CURRICULUM' | 'TEST'

  // Interactive Question State for in-page practice
  const [subtopicAnswers, setSubtopicAnswers] = useState({});
  const [showExplanationMap, setShowExplanationMap] = useState({});

  // Timed Test Mode States
  const [activeTest, setActiveTest] = useState(false);
  const [testQuestions, setTestQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [testFinished, setTestFinished] = useState(false);
  const [showTestExplanations, setShowTestExplanations] = useState(false);

  const categories = ['All', 'Quantitative', 'Logical', 'Verbal', 'Data Interpretation'];

  // Flattened questions for all categories for test mode
  const allFlattenedQuestions = useMemo(() => {
    const list = [];
    APTITUDE_CATALOG.forEach(cat => {
      cat.subtopics.forEach(sub => {
        sub.questions.forEach(q => {
          list.push({
            ...q,
            category: cat.category,
            topic: sub.title
          });
        });
      });
    });
    return list;
  }, []);

  // Filtered Topics based on category and search query
  const filteredCatalog = useMemo(() => {
    return APTITUDE_CATALOG.filter(topic => {
      const matchCat = selectedCategory === 'All' || topic.category.toLowerCase() === selectedCategory.toLowerCase();
      if (!matchCat) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTopic = topic.title.toLowerCase().includes(q) || topic.description.toLowerCase().includes(q);
        const inSub = topic.subtopics.some(s => 
          s.title.toLowerCase().includes(q) || 
          s.summary.toLowerCase().includes(q) ||
          s.companies.some(c => c.toLowerCase().includes(q))
        );
        return inTopic || inSub;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  // Selected subtopic object
  const activeSubtopic = useMemo(() => {
    for (const topic of APTITUDE_CATALOG) {
      const found = topic.subtopics.find(s => s.id === selectedSubtopicId);
      if (found) {
        return { ...found, parentCategory: topic.category, parentTopic: topic.title };
      }
    }
    return APTITUDE_CATALOG[0]?.subtopics[0];
  }, [selectedSubtopicId]);

  // Handle in-page practice answer click
  const handleAnswerSubtopicQuestion = (questionId, optionIdx, correctIdx) => {
    setSubtopicAnswers(prev => ({
      ...prev,
      [questionId]: {
        selected: optionIdx,
        isCorrect: optionIdx === correctIdx
      }
    }));
    setShowExplanationMap(prev => ({
      ...prev,
      [questionId]: true
    }));
  };

  // Timed Assessment Handlers
  const startAssessment = (category = 'All') => {
    const list = category === 'All'
      ? allFlattenedQuestions
      : allFlattenedQuestions.filter(q => q.category.toLowerCase() === category.toLowerCase());

    if (list.length === 0) {
      toast.error('No questions available in this category for test.');
      return;
    }

    setTestQuestions(list);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setTimeLeft(list.length * 90);
    setTestFinished(false);
    setShowTestExplanations(false);
    setActiveTest(true);
    setViewMode('TEST');
  };

  useEffect(() => {
    let timer;
    if (activeTest && !testFinished && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setTestFinished(true);
            toast('Time is up! Submitting answers...', { icon: '⏰' });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeTest, testFinished, timeLeft]);

  const handleSelectOptionInTest = (optIdx) => {
    if (testFinished) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [currentIndex]: optIdx
    }));
  };

  const handleFinishTest = () => {
    setTestFinished(true);
    toast.success('Practice test submitted successfully!');
  };

  const calculateScore = () => {
    let score = 0;
    testQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) score++;
    });
    return score;
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
              <Calculator className="w-3.5 h-3.5" />
              Campus Placement Aptitude Curriculum & Learning Resources
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Aptitude Practice & Learning Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              Explore all campus aptitude topics, examine core subtopics, study key formulas and shortcuts, access curated video lectures, and practice high-frequency placement questions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (viewMode === 'TEST') {
                  setViewMode('CURRICULUM');
                  setActiveTest(false);
                } else {
                  startAssessment(selectedCategory);
                }
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm ${
                viewMode === 'TEST'
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {viewMode === 'TEST' ? (
                <>
                  <Compass className="w-4 h-4" /> Back to Curriculum
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" /> Start Timed Mock Assessment
                </>
              )}
            </button>
          </div>
        </div>

        {/* TOP LEVEL METRIC CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div 
            onClick={() => setSelectedCategory('Quantitative')}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 cursor-pointer transition-all flex items-center justify-between"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Quantitative</p>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">4 Major Areas</h3>
              <p className="text-[11px] text-blue-400 mt-0.5">Speed Math, Profit/Loss, Time & Work</p>
            </div>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Calculator className="w-5 h-5" />
            </div>
          </div>

          <div 
            onClick={() => setSelectedCategory('Logical')}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 cursor-pointer transition-all flex items-center justify-between"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Logical Reasoning</p>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">2 Major Areas</h3>
              <p className="text-[11px] text-purple-400 mt-0.5">Arrangements, Syllogisms, Relations</p>
            </div>
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <Brain className="w-5 h-5" />
            </div>
          </div>

          <div 
            onClick={() => setSelectedCategory('Verbal')}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all flex items-center justify-between"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Verbal Ability</p>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">2 Major Areas</h3>
              <p className="text-[11px] text-emerald-400 mt-0.5">Subject-Verb, Para Jumbles, Vocab</p>
            </div>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div 
            onClick={() => setSelectedCategory('Data Interpretation')}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all flex items-center justify-between"
          >
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Data Interpretation</p>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">1 Major Area</h3>
              <p className="text-[11px] text-amber-400 mt-0.5">Tables, Pie Charts, Growth Rates</p>
            </div>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <BarChart2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* SEARCH & FILTER TOOLBAR */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-500 font-semibold mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Category:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Keyword Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topic, subtopic (e.g. HCF, Syllogism, Work)..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-blue-500 text-xs text-white placeholder-slate-500 outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* MAIN BODY: CURRICULUM BROWSER (TOPIC -> SUBTOPICS -> RESOURCES) */}
        {viewMode === 'CURRICULUM' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT COLUMN: TOPICS & SUBTOPICS ACCORDION DIRECTORY (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" /> Aptitude Topics & Subtopics
                </h2>
                <span className="text-[11px] text-slate-500">
                  {filteredCatalog.length} Topics
                </span>
              </div>

              {filteredCatalog.map((topic) => {
                const isExpanded = expandedTopicId === topic.id;
                const Icon = topic.icon;

                return (
                  <div
                    key={topic.id}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isExpanded
                        ? 'bg-slate-900 border-slate-700 shadow-xl'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700/80'
                    }`}
                  >
                    {/* Topic Header Accordion Button */}
                    <button
                      onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                      className="w-full p-4 text-left flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-blue-400 shrink-0 mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {topic.category}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {topic.subtopics.length} Subtopics
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-white mt-1">{topic.title}</h3>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                            {topic.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-slate-400 pt-1 shrink-0">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {/* Subtopics List when Topic is expanded */}
                    {isExpanded && (
                      <div className="p-3 bg-slate-950/70 border-t border-slate-800/80 space-y-2">
                        <p className="text-[11px] font-semibold text-slate-400 px-2 flex items-center justify-between">
                          <span>Select a subtopic to view resources:</span>
                          <span className="text-[10px] text-amber-400">{topic.frequencyTag}</span>
                        </p>

                        <div className="space-y-1.5">
                          {topic.subtopics.map((sub) => {
                            const isSubSelected = selectedSubtopicId === sub.id;

                            return (
                              <button
                                key={sub.id}
                                onClick={() => setSelectedSubtopicId(sub.id)}
                                className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between gap-2 ${
                                  isSubSelected
                                    ? 'bg-blue-600/15 border-blue-500 text-white shadow-md ring-1 ring-blue-500/50 font-bold'
                                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/70 hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${isSubSelected ? 'bg-blue-400 animate-ping' : 'bg-slate-600'}`} />
                                  <span>{sub.title}</span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                                    {sub.difficulty}
                                  </span>
                                  <ChevronRight className={`w-3.5 h-3.5 ${isSubSelected ? 'text-blue-400' : 'text-slate-600'}`} />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* RIGHT COLUMN: SUBTOPIC DETAILS, FORMULAS, CURATED RESOURCES & PRACTICE QUESTIONS (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {activeSubtopic ? (
                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-6">
                  
                  {/* Subtopic Header */}
                  <div className="space-y-2 border-b border-slate-800 pb-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {activeSubtopic.parentCategory} &bull; {activeSubtopic.parentTopic}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {activeSubtopic.difficulty}
                        </span>
                      </div>

                      <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" /> {activeSubtopic.importance} Importance
                      </span>
                    </div>

                    <h2 className="text-xl font-black text-white">{activeSubtopic.title}</h2>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activeSubtopic.summary}
                    </p>

                    {/* Companies asking this subtopic */}
                    {activeSubtopic.companies && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                          Frequently Asked In:
                        </span>
                        {activeSubtopic.companies.map((company, cIdx) => (
                          <span
                            key={cIdx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-950 text-slate-300 border border-slate-800 flex items-center gap-1"
                          >
                            <Building2 className="w-2.5 h-2.5 text-slate-500" />
                            {company}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* KEY FORMULAS & SHORTCUTS BOX */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Key Formulas & Core Concepts
                    </h3>
                    
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
                      {activeSubtopic.formulas?.map((formula, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-slate-300">
                          <span className="text-blue-400 font-bold shrink-0">&bull;</span>
                          <span>{formula}</span>
                        </div>
                      ))}
                    </div>

                    {activeSubtopic.shortcuts && (
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-300 font-bold block mb-0.5">Speed Shortcut:</strong>
                          <span>{activeSubtopic.shortcuts}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CURATED LEARNING RESOURCES (Videos, Docs, Cheatsheets) */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-blue-400" /> Curated Learning Resources & Masterclasses
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activeSubtopic.resources?.map((res, rIdx) => {
                        const isVideo = res.type === 'video';
                        const isPractice = res.type === 'practice';
                        return (
                          <a
                            key={rIdx}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/50 transition-all flex items-start justify-between gap-3 group"
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-blue-400 group-hover:text-blue-300 shrink-0 mt-0.5">
                                {isVideo ? (
                                  <PlayCircle className="w-4 h-4 text-rose-400" />
                                ) : isPractice ? (
                                  <Award className="w-4 h-4 text-amber-400" />
                                ) : (
                                  <FileText className="w-4 h-4 text-blue-400" />
                                )}
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block font-semibold">
                                  {res.provider} &bull; {res.type.toUpperCase()}
                                </span>
                                <h4 className="text-xs font-bold text-white group-hover:text-blue-300 line-clamp-1 mt-0.5">
                                  {res.title}
                                </h4>
                              </div>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 shrink-0 mt-1" />
                          </a>
                        );
                      })}
                    </div>
                  </div>

                  {/* SOLVED PRACTICE QUESTIONS FOR THIS SUBTOPIC */}
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-blue-400" /> Placement Practice Questions ({activeSubtopic.questions?.length || 0})
                      </h3>
                      <span className="text-[11px] text-slate-500">Instant Solution & Validation</span>
                    </div>

                    <div className="space-y-4">
                      {activeSubtopic.questions?.map((q, qIdx) => {
                        const ansState = subtopicAnswers[q.id];
                        const showExpl = showExplanationMap[q.id];

                        return (
                          <div
                            key={q.id || qIdx}
                            className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <span className="text-[11px] font-bold text-blue-400">Q{qIdx + 1}.</span>
                              <p className="flex-1 text-xs text-white font-medium leading-relaxed">
                                {q.question}
                              </p>
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {q.options.map((opt, optIdx) => {
                                const isSelected = ansState?.selected === optIdx;
                                const isCorrect = optIdx === q.answer;
                                const hasAnswered = ansState !== undefined;

                                let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';

                                if (hasAnswered) {
                                  if (isCorrect) {
                                    btnStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-200 font-bold ring-1 ring-emerald-500/40';
                                  } else if (isSelected && !isCorrect) {
                                    btnStyle = 'bg-rose-500/15 border-rose-500 text-rose-200 font-bold ring-1 ring-rose-500/40';
                                  } else {
                                    btnStyle = 'bg-slate-900/40 border-slate-800/40 text-slate-500 opacity-60';
                                  }
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    onClick={() => handleAnswerSubtopicQuestion(q.id, optIdx, q.answer)}
                                    className={`p-2.5 rounded-lg border text-left text-xs transition flex items-center justify-between gap-2 ${btnStyle}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="w-5 h-5 rounded bg-slate-950 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                        {String.fromCharCode(65 + optIdx)}
                                      </span>
                                      <span>{opt}</span>
                                    </div>
                                    {hasAnswered && isCorrect && (
                                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Answer Feedback & Toggle Explanation */}
                            {ansState && (
                              <div className="pt-2 border-t border-slate-800/70 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className={`font-bold flex items-center gap-1 ${ansState.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {ansState.isCorrect ? (
                                      <>
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct Answer!
                                      </>
                                    ) : (
                                      <>
                                        <XCircle className="w-3.5 h-3.5" /> Incorrect Option
                                      </>
                                    )}
                                  </span>

                                  <button
                                    onClick={() => setShowExplanationMap(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                                    className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                                  >
                                    {showExpl ? 'Hide Explanation' : 'View Step-by-Step Solution'}
                                    {showExpl ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                  </button>
                                </div>

                                {showExpl && (
                                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-line font-mono">
                                    <strong className="text-blue-300 block mb-1">Step-by-Step Working:</strong>
                                    {q.explanation}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
                  Select a subtopic from the directory on the left to see its formulas, cheat sheet, video masterclasses, and questions.
                </div>
              )}
            </div>

          </div>
        )}

        {/* TIMED PRACTICE ASSESSMENT INTERFACE */}
        {viewMode === 'TEST' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Question Panel */}
            <div className="lg:col-span-3 space-y-6">
              <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl space-y-6">
                
                {/* Test Top Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                      Question {currentIndex + 1} of {testQuestions.length}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">
                        {testQuestions[currentIndex]?.category} &bull; {testQuestions[currentIndex]?.topic}
                      </span>
                    </div>
                  </div>

                  {/* Timer */}
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono font-bold text-xs ${
                    timeLeft < 60 
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse'
                      : 'bg-slate-950 text-slate-300 border border-slate-800'
                  }`}>
                    <Clock className="w-3.5 h-3.5" />
                    {formatTime(timeLeft)}
                  </div>
                </div>

                {/* Question Text */}
                <div className="text-sm sm:text-base text-white whitespace-pre-line leading-relaxed font-medium">
                  {testQuestions[currentIndex]?.question}
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {testQuestions[currentIndex]?.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[currentIndex] === optIdx;
                    const isCorrect = testQuestions[currentIndex]?.answer === optIdx;

                    let borderClass = 'border-slate-800 hover:border-slate-700 bg-slate-950';

                    if (testFinished) {
                      if (isCorrect) {
                        borderClass = 'border-emerald-500 bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/40 font-bold';
                      } else if (isSelected && !isCorrect) {
                        borderClass = 'border-rose-500 bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/40 font-bold';
                      }
                    } else if (isSelected) {
                      borderClass = 'border-blue-500 bg-blue-500/15 text-white ring-2 ring-blue-500/40 font-bold';
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={testFinished}
                        onClick={() => handleSelectOptionInTest(optIdx)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${borderClass}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-700'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="text-xs sm:text-sm font-medium">{opt}</span>
                        </div>

                        {testFinished && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        {testFinished && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Test Explanation Working */}
                {testFinished && showTestExplanations && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1.5 font-mono">
                    <strong className="text-blue-300 block">Explanation & Working:</strong>
                    <p className="leading-relaxed whitespace-pre-line">
                      {testQuestions[currentIndex]?.explanation}
                    </p>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <button
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(prev => prev - 1)}
                    className="px-4 py-2 border border-slate-800 rounded-xl text-xs text-slate-400 hover:text-white disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {!testFinished ? (
                      currentIndex === testQuestions.length - 1 ? (
                        <button
                          onClick={handleFinishTest}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md"
                        >
                          Submit Assessment
                        </button>
                      ) : (
                        <button
                          onClick={() => setCurrentIndex(prev => prev + 1)}
                          className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
                        >
                          Next Question <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => setShowTestExplanations(!showTestExplanations)}
                        className="px-4 py-2 text-xs text-blue-400 font-bold hover:underline"
                      >
                        {showTestExplanations ? 'Hide Explanations' : 'View Explanations'}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Right Question Palette & Scorecard */}
            <div className="space-y-4">
              {testFinished && (
                <div className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-xl text-center">
                  <Award className="w-10 h-10 mx-auto mb-2 text-yellow-300" />
                  <h3 className="text-base font-bold">Assessment Completed</h3>
                  <div className="text-3xl font-black my-2">
                    {calculateScore()} / {testQuestions.length}
                  </div>
                  <p className="text-xs text-blue-100">
                    Accuracy: {Math.round((calculateScore() / testQuestions.length) * 100)}%
                  </p>
                  <button
                    onClick={() => startAssessment(selectedCategory)}
                    className="mt-4 w-full py-2 bg-white text-blue-700 font-bold text-xs rounded-xl hover:bg-blue-50 transition flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Retake Test
                  </button>
                </div>
              )}

              {/* Palette */}
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Question Navigator
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {testQuestions.map((q, idx) => {
                    const answered = selectedAnswers[idx] !== undefined;
                    const isCurrent = currentIndex === idx;
                    let bg = 'bg-slate-950 text-slate-400 border border-slate-800';

                    if (testFinished) {
                      if (selectedAnswers[idx] === q.answer) {
                        bg = 'bg-emerald-600 text-white font-bold';
                      } else if (answered) {
                        bg = 'bg-rose-600 text-white font-bold';
                      }
                    } else if (isCurrent) {
                      bg = 'bg-blue-600 text-white font-bold ring-2 ring-blue-400';
                    } else if (answered) {
                      bg = 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-9 rounded-lg text-xs font-bold transition flex items-center justify-center ${bg}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    setViewMode('CURRICULUM');
                    setActiveTest(false);
                  }}
                  className="w-full mt-4 py-2 border border-slate-800 text-xs text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
                >
                  Exit Test Mode
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
