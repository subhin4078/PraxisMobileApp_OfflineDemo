import type { MathTopic } from "@/src/types/api";

export type Difficulty = "easy" | "hard" | "dse";

export interface MockQuestion {
  id: string;
  topic: MathTopic;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option after shuffle
}

/** Shuffle an array of options and track the new index of the correct answer */
function shuffleOptions(
  options: string[],
  correctIndex: number,
): { shuffled: string[]; newCorrectIndex: number } {
  const indexed = options.map((opt, i) => ({
    opt,
    wasCorrect: i === correctIndex,
  }));
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
  }
  return {
    shuffled: indexed.map((x) => x.opt),
    newCorrectIndex: indexed.findIndex((x) => x.wasCorrect),
  };
}

// ─── Law of Indices ───────────────────────────────────────────────
const lawOfIndicesEasy: Omit<MockQuestion, "id">[] = [
  {
    topic: "law-of-indices",
    difficulty: "easy",
    question: "Simplify: x² × x³",
    options: ["x⁵", "x⁶", "x⁸", "2x⁵"],
    correctAnswer: 0,
  },
  {
    topic: "law-of-indices",
    difficulty: "easy",
    question: "Simplify: (x³)²",
    options: ["x⁶", "x⁵", "x⁹", "x³"],
    correctAnswer: 0,
  },
  {
    topic: "law-of-indices",
    difficulty: "easy",
    question: "Simplify: x⁷ ÷ x²",
    options: ["x⁵", "x⁹", "x³·⁵", "x⁴"],
    correctAnswer: 0,
  },
  {
    topic: "law-of-indices",
    difficulty: "easy",
    question: "Evaluate: 2⁰",
    options: ["1", "0", "2", "undefined"],
    correctAnswer: 0,
  },
  {
    topic: "law-of-indices",
    difficulty: "easy",
    question: "Simplify: 3² × 3³",
    options: ["3⁵", "9⁵", "3⁶", "6⁵"],
    correctAnswer: 0,
  },
  {
    topic: "law-of-indices",
    difficulty: "easy",
    question: "Evaluate: 5¹",
    options: ["5", "1", "0", "25"],
    correctAnswer: 0,
  },
  {
    topic: "law-of-indices",
    difficulty: "easy",
    question: "Simplify: a⁴ × a",
    options: ["a⁵", "a⁴", "2a⁴", "a³"],
    correctAnswer: 0,
  },
  {
    topic: "law-of-indices",
    difficulty: "easy",
    question: "Simplify: (2x)²",
    options: ["4x²", "2x²", "4x", "2x⁴"],
    correctAnswer: 0,
  },
  {
    topic: "law-of-indices",
    difficulty: "easy",
    question: "Evaluate: 10⁻¹",
    options: ["0.1", "10", "-10", "-1"],
    correctAnswer: 0,
  },
  {
    topic: "law-of-indices",
    difficulty: "easy",
    question: "Simplify: x⁰ + y⁰",
    options: ["2", "0", "1", "x + y"],
    correctAnswer: 0,
  },
];

const lawOfIndicesHard: Omit<MockQuestion, "id">[] = [
  {
    topic: "law-of-indices",
    difficulty: "hard",
    question: "Simplify: (2a³b²)³",
    options: ["8a⁹b⁶", "6a⁹b⁶", "8a⁶b⁵", "2a⁹b⁶"],
    correctAnswer: 0,
  },
  {
    topic: "law-of-indices",
    difficulty: "hard",
    question: "Simplify: x⁻² × x⁵",
    options: ["x³", "x⁻³", "x⁷", "x⁻⁷"],
    correctAnswer: 0,
  },
  {
    topic: "law-of-indices",
    difficulty: "hard",
    question: "Evaluate: (27)^(2/3)",
    options: ["9", "18", "3", "27"],
    correctAnswer: 0,
  },
  {
    topic: "law-of-indices",
    difficulty: "hard",
    question: "Simplify: (x⁴y⁻²)/(x⁻¹y³)",
    options: ["x⁵y⁻⁵", "x³y⁻⁵", "x⁵y⁵", "x³y"],
    correctAnswer: 0,
  },
  {
    topic: "law-of-indices",
    difficulty: "hard",
    question: "Evaluate: 8^(-2/3)",
    options: ["1/4", "4", "-4", "1/8"],
    correctAnswer: 0,
  },
  {
    topic: "law-of-indices",
    difficulty: "hard",
    question: "Simplify: (3⁻²)⁻³",
    options: ["3⁶", "3⁻⁶", "3⁵", "1/729"],
    correctAnswer: 0,
  },
  {
    topic: "law-of-indices",
    difficulty: "hard",
    question: "If 2ˣ = 16, find x.",
    options: ["4", "8", "3", "2"],
    correctAnswer: 0,
  },
  {
    topic: "law-of-indices",
    difficulty: "hard",
    question: "Simplify: (a²b³)⁰ + a⁰",
    options: ["2", "0", "1", "a²b³"],
    correctAnswer: 0,
  },
  {
    topic: "law-of-indices",
    difficulty: "hard",
    question: "Simplify: 16^(3/4)",
    options: ["8", "12", "4", "64"],
    correctAnswer: 0,
  },
  {
    topic: "law-of-indices",
    difficulty: "hard",
    question: "Simplify: (x^(1/2))⁶",
    options: ["x³", "x⁶", "x^(1/3)", "x¹²"],
    correctAnswer: 0,
  },
];

const lawOfIndicesDse: Omit<MockQuestion, "id">[] = [
  {
    topic: "law-of-indices",
    difficulty: "dse",
    question: "Simplify: (4a²b)² ÷ (2ab)²",
    options: ["4a²", "2a²", "4a²b²", "a²"],
    correctAnswer: 0,
  },
  {
    topic: "law-of-indices",
    difficulty: "dse",
    question: "If 9ˣ = 27, find x.",
    options: ["3/2", "2/3", "3", "2"],
    correctAnswer: 0,
  },
  {
    topic: "law-of-indices",
    difficulty: "dse",
    question: "Simplify: (8/27)^(-2/3)",
    options: ["9/4", "4/9", "3/2", "2/3"],
    correctAnswer: 0,
  },
  {
    topic: "law-of-indices",
    difficulty: "dse",
    question: "If 5^(2x-1) = 125, find x.",
    options: ["2", "3", "1", "4"],
    correctAnswer: 0,
  },
  {
    topic: "law-of-indices",
    difficulty: "dse",
    question: "Simplify: 2^(n+3) ÷ 2^(n-1)",
    options: ["16", "8", "4", "2"],
    correctAnswer: 0,
  },
  {
    topic: "law-of-indices",
    difficulty: "dse",
    question: "Evaluate: (0.001)^(-1/3)",
    options: ["10", "100", "0.1", "1000"],
    correctAnswer: 0,
  },
  {
    topic: "law-of-indices",
    difficulty: "dse",
    question: "Simplify: (x²y⁻¹)³ × (x⁻³y²)",
    options: ["x³y⁻¹", "x⁶y⁻³", "x³y", "x⁹y⁻¹"],
    correctAnswer: 0,
  },
  {
    topic: "law-of-indices",
    difficulty: "dse",
    question: "If 4^x × 2^(3x) = 2¹⁰, find x.",
    options: ["2", "10/5", "5", "3"],
    correctAnswer: 0,
  },
  {
    topic: "law-of-indices",
    difficulty: "dse",
    question: "Simplify: √(a⁶b⁴) in index form",
    options: ["a³b²", "a⁶b⁴", "a³b⁴", "a²b³"],
    correctAnswer: 0,
  },
  {
    topic: "law-of-indices",
    difficulty: "dse",
    question: "Evaluate: 25^(1/2) + 8^(1/3)",
    options: ["7", "5", "8", "13"],
    correctAnswer: 0,
  },
];

// ─── Change of Subject ────────────────────────────────────────────
const changeOfSubjectEasy: Omit<MockQuestion, "id">[] = [
  {
    topic: "change-of-subject",
    difficulty: "easy",
    question: "Make x the subject: y = 3x + 5",
    options: ["x = (y - 5)/3", "x = (y + 5)/3", "x = 3y - 5", "x = y/3 + 5"],
    correctAnswer: 0,
  },
  {
    topic: "change-of-subject",
    difficulty: "easy",
    question: "Make r the subject: A = πr²",
    options: ["r = √(A/π)", "r = A/(2π)", "r = A/π", "r = √(Aπ)"],
    correctAnswer: 0,
  },
  {
    topic: "change-of-subject",
    difficulty: "easy",
    question: "Make b the subject: a = b - c",
    options: ["b = a + c", "b = a - c", "b = c - a", "b = ac"],
    correctAnswer: 0,
  },
  {
    topic: "change-of-subject",
    difficulty: "easy",
    question: "Make t the subject: d = st",
    options: ["t = d/s", "t = ds", "t = s/d", "t = d - s"],
    correctAnswer: 0,
  },
  {
    topic: "change-of-subject",
    difficulty: "easy",
    question: "Make x the subject: y = x/4",
    options: ["x = 4y", "x = y/4", "x = y + 4", "x = y - 4"],
    correctAnswer: 0,
  },
  {
    topic: "change-of-subject",
    difficulty: "easy",
    question: "Make h the subject: V = lwh",
    options: ["h = V/(lw)", "h = Vlw", "h = V - lw", "h = lw/V"],
    correctAnswer: 0,
  },
  {
    topic: "change-of-subject",
    difficulty: "easy",
    question: "Make x the subject: y = 2x",
    options: ["x = y/2", "x = 2y", "x = y - 2", "x = y²"],
    correctAnswer: 0,
  },
  {
    topic: "change-of-subject",
    difficulty: "easy",
    question: "Make c the subject: P = 2(a + c)",
    options: ["c = P/2 - a", "c = P - 2a", "c = (P - a)/2", "c = P/2 + a"],
    correctAnswer: 0,
  },
  {
    topic: "change-of-subject",
    difficulty: "easy",
    question: "Make m the subject: F = ma",
    options: ["m = F/a", "m = Fa", "m = a/F", "m = F - a"],
    correctAnswer: 0,
  },
  {
    topic: "change-of-subject",
    difficulty: "easy",
    question: "Make x the subject: y = x + 7",
    options: ["x = y - 7", "x = y + 7", "x = 7y", "x = 7 - y"],
    correctAnswer: 0,
  },
];

const changeOfSubjectHard: Omit<MockQuestion, "id">[] = [
  {
    topic: "change-of-subject",
    difficulty: "hard",
    question: "Make x the subject: y = (3x + 1)/(x - 2)",
    options: [
      "x = (2y + 1)/(y - 3)",
      "x = (2y - 1)/(y + 3)",
      "x = (y + 1)/(3 - y)",
      "x = (3y + 2)/(y - 1)",
    ],
    correctAnswer: 0,
  },
  {
    topic: "change-of-subject",
    difficulty: "hard",
    question: "Make r the subject: S = 4πr²",
    options: ["r = √(S/(4π))", "r = S/(4π)", "r = √(4πS)", "r = S²/(4π)"],
    correctAnswer: 0,
  },
  {
    topic: "change-of-subject",
    difficulty: "hard",
    question: "Make a the subject: v² = u² + 2as",
    options: [
      "a = (v² - u²)/(2s)",
      "a = v² - u²/(2s)",
      "a = (v - u)²/(2s)",
      "a = 2s/(v² - u²)",
    ],
    correctAnswer: 0,
  },
  {
    topic: "change-of-subject",
    difficulty: "hard",
    question: "Make x the subject: y = √(2x + 3)",
    options: [
      "x = (y² - 3)/2",
      "x = y²/2 + 3",
      "x = (y - 3)²/2",
      "x = √(y² - 3)",
    ],
    correctAnswer: 0,
  },
  {
    topic: "change-of-subject",
    difficulty: "hard",
    question: "Make t the subject: s = ut + ½at²",
    options: [
      "t = (-u ± √(u² + 2as))/a",
      "t = (s - u)/a",
      "t = 2s/(u + a)",
      "t = s/(u + at)",
    ],
    correctAnswer: 0,
  },
  {
    topic: "change-of-subject",
    difficulty: "hard",
    question: "Make b the subject: A = ½(a + b)h",
    options: ["b = 2A/h - a", "b = A/(2h) - a", "b = 2A - ah", "b = (A - a)/h"],
    correctAnswer: 0,
  },
  {
    topic: "change-of-subject",
    difficulty: "hard",
    question: "Make x the subject: 1/x + 1/y = 1/z",
    options: ["x = yz/(y - z)", "x = y + z", "x = z/(y - z)", "x = yz/(z - y)"],
    correctAnswer: 0,
  },
  {
    topic: "change-of-subject",
    difficulty: "hard",
    question: "Make R the subject: 1/R = 1/R₁ + 1/R₂",
    options: [
      "R = R₁R₂/(R₁ + R₂)",
      "R = R₁ + R₂",
      "R = (R₁ + R₂)/(R₁R₂)",
      "R = R₁R₂",
    ],
    correctAnswer: 0,
  },
  {
    topic: "change-of-subject",
    difficulty: "hard",
    question: "Make x the subject: y = (x² + 1)/x",
    options: [
      "x = (y ± √(y² - 4))/2",
      "x = y² - 1",
      "x = (y + 1)/2",
      "x = y/2 ± 1",
    ],
    correctAnswer: 0,
  },
  {
    topic: "change-of-subject",
    difficulty: "hard",
    question: "Make T the subject: l = g(T/(2π))²",
    options: ["T = 2π√(l/g)", "T = 2πl/g", "T = √(2πl/g)", "T = l/(2πg)"],
    correctAnswer: 0,
  },
];

const changeOfSubjectDse: Omit<MockQuestion, "id">[] = [
  {
    topic: "change-of-subject",
    difficulty: "dse",
    question: "Make x the subject: y = (ax + b)/(cx + d)",
    options: [
      "x = (dy - b)/(a - cy)",
      "x = (b - dy)/(cy - a)",
      "x = (ay - b)/(c - dy)",
      "x = a/(cy + d)",
    ],
    correctAnswer: 0,
  },
  {
    topic: "change-of-subject",
    difficulty: "dse",
    question: "Make h the subject: V = (1/3)πr²h",
    options: ["h = 3V/(πr²)", "h = V/(3πr²)", "h = πr²/(3V)", "h = 3πr²/V"],
    correctAnswer: 0,
  },
  {
    topic: "change-of-subject",
    difficulty: "dse",
    question: "If S = n/2(2a + (n-1)d), make d the subject.",
    options: [
      "d = (2S/n - 2a)/(n - 1)",
      "d = (S - na)/(n-1)",
      "d = 2(S - na)/n(n-1)",
      "d = S/(n(n-1)) - a",
    ],
    correctAnswer: 0,
  },
  {
    topic: "change-of-subject",
    difficulty: "dse",
    question: "Make x the subject: √(x + a) = b - x",
    options: [
      "Solve x² + (2b+1)x + (b²-a) = 0",
      "x = b² - a",
      "x = (b-a)²",
      "x = b - √a",
    ],
    correctAnswer: 0,
  },
  {
    topic: "change-of-subject",
    difficulty: "dse",
    question: "Make k the subject: T = 2π√(m/k)",
    options: ["k = 4π²m/T²", "k = T²/(4π²m)", "k = 2πm/T", "k = m/(2πT)²"],
    correctAnswer: 0,
  },
  {
    topic: "change-of-subject",
    difficulty: "dse",
    question: "Make c the subject: E = mc²",
    options: ["c = √(E/m)", "c = E/m²", "c = E/(2m)", "c = (E/m)²"],
    correctAnswer: 0,
  },
  {
    topic: "change-of-subject",
    difficulty: "dse",
    question: "If A = P(1 + r/n)^(nt), make r the subject.",
    options: [
      "r = n((A/P)^(1/(nt)) - 1)",
      "r = (A-P)/(Pnt)",
      "r = n(A/P - 1)/t",
      "r = (A/P)^(1/t) - 1",
    ],
    correctAnswer: 0,
  },
  {
    topic: "change-of-subject",
    difficulty: "dse",
    question: "Make y the subject: x² + y² = r² (y > 0)",
    options: ["y = √(r² - x²)", "y = r - x", "y = (r² - x²)/2", "y = r² - x"],
    correctAnswer: 0,
  },
  {
    topic: "change-of-subject",
    difficulty: "dse",
    question: "Make n the subject: S = a(rⁿ - 1)/(r - 1)",
    options: [
      "n = log((S(r-1)/a) + 1)/log(r)",
      "n = S(r-1)/(a·log r)",
      "n = log(S/a)/log(r)",
      "n = (S-a)/(r-1)",
    ],
    correctAnswer: 0,
  },
  {
    topic: "change-of-subject",
    difficulty: "dse",
    question: "Make x the subject: log₂(x + 3) = y",
    options: ["x = 2^y - 3", "x = y² - 3", "x = log₂(y) - 3", "x = 2y - 3"],
    correctAnswer: 0,
  },
];

// ─── Factorization ────────────────────────────────────────────────
const factorizationEasy: Omit<MockQuestion, "id">[] = [
  {
    topic: "factorization",
    difficulty: "easy",
    question: "Factorize: 6x + 12",
    options: ["6(x + 2)", "3(2x + 4)", "6(x + 12)", "2(3x + 12)"],
    correctAnswer: 0,
  },
  {
    topic: "factorization",
    difficulty: "easy",
    question: "Factorize: x² - 9",
    options: ["(x+3)(x-3)", "(x-9)(x+1)", "(x+9)(x-1)", "(x-3)²"],
    correctAnswer: 0,
  },
  {
    topic: "factorization",
    difficulty: "easy",
    question: "Factorize: x² + 5x + 6",
    options: ["(x+2)(x+3)", "(x+1)(x+6)", "(x+5)(x+1)", "(x-2)(x-3)"],
    correctAnswer: 0,
  },
  {
    topic: "factorization",
    difficulty: "easy",
    question: "Factorize: 3x² - 3x",
    options: ["3x(x - 1)", "3(x² - x)", "x(3x - 3)", "3x(x + 1)"],
    correctAnswer: 0,
  },
  {
    topic: "factorization",
    difficulty: "easy",
    question: "Factorize: x² - 4x + 4",
    options: ["(x - 2)²", "(x + 2)²", "(x-4)(x-1)", "(x-1)(x-4)"],
    correctAnswer: 0,
  },
  {
    topic: "factorization",
    difficulty: "easy",
    question: "Factorize: x² + 7x",
    options: ["x(x + 7)", "7x(x + 1)", "x(x + 1)", "(x+7)²"],
    correctAnswer: 0,
  },
  {
    topic: "factorization",
    difficulty: "easy",
    question: "Factorize: 4x² - 1",
    options: ["(2x+1)(2x-1)", "(4x+1)(x-1)", "(2x-1)²", "4(x+1)(x-1)"],
    correctAnswer: 0,
  },
  {
    topic: "factorization",
    difficulty: "easy",
    question: "Factorize: x² + 2x + 1",
    options: ["(x + 1)²", "(x + 2)(x - 1)", "(x - 1)²", "x(x + 2)"],
    correctAnswer: 0,
  },
  {
    topic: "factorization",
    difficulty: "easy",
    question: "Factorize: 5ab + 10a",
    options: ["5a(b + 2)", "5(ab + 2a)", "10a(b + 1)", "a(5b + 10)"],
    correctAnswer: 0,
  },
  {
    topic: "factorization",
    difficulty: "easy",
    question: "Factorize: x² - 16",
    options: ["(x+4)(x-4)", "(x-8)(x+2)", "(x-16)(x+1)", "(x+8)(x-2)"],
    correctAnswer: 0,
  },
];

const factorizationHard: Omit<MockQuestion, "id">[] = [
  {
    topic: "factorization",
    difficulty: "hard",
    question: "Factorize: 2x² + 7x + 3",
    options: ["(2x+1)(x+3)", "(2x+3)(x+1)", "(x+3)(2x-1)", "(2x-1)(x-3)"],
    correctAnswer: 0,
  },
  {
    topic: "factorization",
    difficulty: "hard",
    question: "Factorize: 6x² - x - 2",
    options: ["(3x-2)(2x+1)", "(6x+1)(x-2)", "(3x+2)(2x-1)", "(2x-2)(3x+1)"],
    correctAnswer: 0,
  },
  {
    topic: "factorization",
    difficulty: "hard",
    question: "Factorize: x³ - 8",
    options: [
      "(x-2)(x²+2x+4)",
      "(x-2)(x²-2x+4)",
      "(x+2)(x²-2x+4)",
      "(x-8)(x²+1)",
    ],
    correctAnswer: 0,
  },
  {
    topic: "factorization",
    difficulty: "hard",
    question: "Factorize: x⁴ - 1",
    options: ["(x²+1)(x+1)(x-1)", "(x²-1)²", "(x+1)²(x-1)²", "(x⁴-1)"],
    correctAnswer: 0,
  },
  {
    topic: "factorization",
    difficulty: "hard",
    question: "Factorize: 3x² - 12",
    options: ["3(x+2)(x-2)", "(3x+6)(x-2)", "3(x²-4)", "(x-2)(3x+6)"],
    correctAnswer: 0,
  },
  {
    topic: "factorization",
    difficulty: "hard",
    question: "Factorize: x³ + 27",
    options: [
      "(x+3)(x²-3x+9)",
      "(x+3)(x²+3x+9)",
      "(x-3)(x²+9)",
      "(x+27)(x²-1)",
    ],
    correctAnswer: 0,
  },
  {
    topic: "factorization",
    difficulty: "hard",
    question: "Factorize: 4x² - 12x + 9",
    options: ["(2x - 3)²", "(2x + 3)²", "(4x-3)(x-3)", "4(x-3)²"],
    correctAnswer: 0,
  },
  {
    topic: "factorization",
    difficulty: "hard",
    question: "Factorize: x² - xy - 2y²",
    options: ["(x-2y)(x+y)", "(x+2y)(x-y)", "(x-y)(x-2y)", "(x+y)(x+2y)"],
    correctAnswer: 0,
  },
  {
    topic: "factorization",
    difficulty: "hard",
    question: "Factorize: 9x² - 4y²",
    options: ["(3x+2y)(3x-2y)", "(9x+4y)(x-y)", "(3x-2y)²", "(3x+y)(3x-4y)"],
    correctAnswer: 0,
  },
  {
    topic: "factorization",
    difficulty: "hard",
    question: "Factorize: 2x³ + 16",
    options: [
      "2(x+2)(x²-2x+4)",
      "(2x+4)(x²-2x+4)",
      "2(x³+8)",
      "(x+2)(2x²-4x+8)",
    ],
    correctAnswer: 0,
  },
];

const factorizationDse: Omit<MockQuestion, "id">[] = [
  {
    topic: "factorization",
    difficulty: "dse",
    question: "Factorize: a²b - ab² + a - b",
    options: [
      "(a - b)(ab + 1)",
      "(a + b)(ab - 1)",
      "ab(a - b) + (a - b)",
      "(a-b)(ab-1)",
    ],
    correctAnswer: 0,
  },
  {
    topic: "factorization",
    difficulty: "dse",
    question: "Factorize: x² + 2xy + y² - z²",
    options: ["(x+y+z)(x+y-z)", "(x+y)²-z²", "(x-y+z)(x-y-z)", "(x+z)(y-z)"],
    correctAnswer: 0,
  },
  {
    topic: "factorization",
    difficulty: "dse",
    question: "Factorize: x⁴ + x²y² + y⁴",
    options: [
      "(x²+xy+y²)(x²-xy+y²)",
      "(x²+y²)²",
      "(x+y)²(x²-y²)",
      "(x²+y²)(x²+y²)",
    ],
    correctAnswer: 0,
  },
  {
    topic: "factorization",
    difficulty: "dse",
    question: "Factorize: 6x² + 11x - 10",
    options: ["(3x-2)(2x+5)", "(6x-5)(x+2)", "(3x+2)(2x-5)", "(2x-2)(3x+5)"],
    correctAnswer: 0,
  },
  {
    topic: "factorization",
    difficulty: "dse",
    question: "Factorize: x³ - 3x² - 4x + 12",
    options: [
      "(x-3)(x-2)(x+2)",
      "(x-3)(x²-4)",
      "(x+3)(x-2)²",
      "(x-2)(x²-3x-6)",
    ],
    correctAnswer: 0,
  },
  {
    topic: "factorization",
    difficulty: "dse",
    question: "Factorize: 8x³ - 27y³",
    options: [
      "(2x-3y)(4x²+6xy+9y²)",
      "(2x-3y)(4x²-6xy+9y²)",
      "(2x+3y)(4x²-6xy-9y²)",
      "(8x-27y)(x²+y²)",
    ],
    correctAnswer: 0,
  },
  {
    topic: "factorization",
    difficulty: "dse",
    question: "Factorize: x² - y² + x + y",
    options: ["(x+y)(x-y+1)", "(x-y)(x+y+1)", "(x+1)(x-y²)", "(x+y)(x-y-1)"],
    correctAnswer: 0,
  },
  {
    topic: "factorization",
    difficulty: "dse",
    question: "Factorize: 2x² + 5xy + 3y²",
    options: ["(2x+3y)(x+y)", "(x+3y)(2x+y)", "(2x+y)(x+3y)", "(x+y)(2x+3y)"],
    correctAnswer: 0,
  },
  {
    topic: "factorization",
    difficulty: "dse",
    question: "Factorize: a³ + a²b - ab² - b³",
    options: ["(a+b)²(a-b)", "(a-b)(a+b)²", "(a²-b²)(a+b)", "(a+b)(a²-b²)"],
    correctAnswer: 0,
  },
  {
    topic: "factorization",
    difficulty: "dse",
    question: "Factorize: x⁴ - 5x² + 4",
    options: [
      "(x-1)(x+1)(x-2)(x+2)",
      "(x²-1)(x²-4)",
      "(x-1)²(x+2)²",
      "(x²+1)(x²-4)",
    ],
    correctAnswer: 0,
  },
];

// ─── Build & shuffle all questions ────────────────────────────────
function buildQuestions(
  raws: Omit<MockQuestion, "id">[],
  topicPrefix: string,
  diffPrefix: string,
): MockQuestion[] {
  return raws.map((q, i) => {
    const { shuffled, newCorrectIndex } = shuffleOptions(
      q.options,
      q.correctAnswer,
    );
    return {
      ...q,
      id: `${topicPrefix}-${diffPrefix}-${String(i + 1).padStart(2, "0")}`,
      options: shuffled,
      correctAnswer: newCorrectIndex,
    };
  });
}

export const MOCK_QUESTIONS: MockQuestion[] = [
  // Law of Indices (30)
  ...buildQuestions(lawOfIndicesEasy, "LOI", "EASY"),
  ...buildQuestions(lawOfIndicesHard, "LOI", "HARD"),
  ...buildQuestions(lawOfIndicesDse, "LOI", "DSE"),
  // Change of Subject (30)
  ...buildQuestions(changeOfSubjectEasy, "COS", "EASY"),
  ...buildQuestions(changeOfSubjectHard, "COS", "HARD"),
  ...buildQuestions(changeOfSubjectDse, "COS", "DSE"),
  // Factorization (30)
  ...buildQuestions(factorizationEasy, "FAC", "EASY"),
  ...buildQuestions(factorizationHard, "FAC", "HARD"),
  ...buildQuestions(factorizationDse, "FAC", "DSE"),
];

/** Filter questions by topics + difficulty, then randomly pick `count` */
export function pickQuestions(
  topics: MathTopic[],
  difficulty: Difficulty,
  count: number,
): MockQuestion[] {
  const pool = MOCK_QUESTIONS.filter(
    (q) => topics.includes(q.topic) && q.difficulty === difficulty,
  );
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
