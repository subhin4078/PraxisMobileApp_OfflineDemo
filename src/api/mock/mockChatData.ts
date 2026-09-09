import { Chatroom } from "@/src/api/chat/useGetChatrooms";
import { Message } from "@/src/api/chat/useGetMessages";

export const mockChatrooms: Chatroom[] = [
  {
    chatId: "mock-chat-1",
    title: "Quadratic Equations Help",
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    chatId: "mock-chat-2",
    title: "Calculus: Derivatives",
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
  {
    chatId: "mock-chat-3",
    title: "Trigonometry Basics",
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
];

export const mockMessages: Record<string, Message[]> = {
  "mock-chat-1": [
    {
      role: "user",
      content: "How do I solve x² + 5x + 6 = 0?",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      role: "model",
      content: {
        inputType: "problemSolving",
        title: "Solving Quadratic Equation",
        problemSolving: {
          restatedProblem:
            "We need to find the values of x that satisfy the equation x² + 5x + 6 = 0",
          termExplanation:
            "This is a quadratic equation in standard form ax² + bx + c = 0, where a=1, b=5, and c=6. We can solve it by factoring.",
          solutionSteps: [
            "Identify the coefficients: a = 1, b = 5, c = 6",
            "Find two numbers that multiply to 6 and add to 5: these are 2 and 3",
            "Factor the equation: (x + 2)(x + 3) = 0",
            "Set each factor to zero: x + 2 = 0 or x + 3 = 0",
            "Solve for x: x = -2 or x = -3",
          ],
          finalAnswer: "x = -2 or x = -3",
          commonMistakes: [
            "Forgetting to check both solutions",
            "Making sign errors when factoring",
          ],
          verification:
            "We can verify: (-2)² + 5(-2) + 6 = 4 - 10 + 6 = 0 ✓ and (-3)² + 5(-3) + 6 = 9 - 15 + 6 = 0 ✓",
        },
      },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5000).toISOString(),
    },
    {
      role: "user",
      content: "What if I use the quadratic formula instead?",
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    },
    {
      role: "model",
      content: {
        inputType: "problemSolving",
        title: "Using Quadratic Formula",
        problemSolving: {
          restatedProblem: "Solve x² + 5x + 6 = 0 using the quadratic formula",
          termExplanation:
            "The quadratic formula is x = [-b ± √(b² - 4ac)] / (2a). It works for any quadratic equation.",
          solutionSteps: [
            "Identify a = 1, b = 5, c = 6",
            "Calculate the discriminant: b² - 4ac = 25 - 24 = 1",
            "Apply the formula: x = [-5 ± √1] / 2",
            "Simplify: x = [-5 ± 1] / 2",
            "Solution 1: x = (-5 + 1) / 2 = -4/2 = -2",
            "Solution 2: x = (-5 - 1) / 2 = -6/2 = -3",
          ],
          finalAnswer: "x = -2 or x = -3 (same result as factoring!)",
          commonMistakes: [
            "Forgetting the ± symbol",
            "Making arithmetic errors with negative numbers",
          ],
          verification:
            "Both methods give the same answer, confirming x = -2 or x = -3",
        },
      },
      timestamp: new Date(
        Date.now() - 1.5 * 60 * 60 * 1000 + 5000,
      ).toISOString(),
    },
  ],
  "mock-chat-2": [
    {
      role: "user",
      content: "What is the derivative of f(x) = 3x² + 2x - 5?",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      role: "model",
      content: {
        inputType: "problemSolving",
        title: "Finding the Derivative",
        problemSolving: {
          restatedProblem:
            "Find the derivative f'(x) of the polynomial function f(x) = 3x² + 2x - 5",
          termExplanation:
            "We use the power rule: the derivative of xⁿ is n·xⁿ⁻¹. For polynomials, we differentiate each term separately.",
          solutionSteps: [
            "Apply power rule to first term: d/dx(3x²) = 3·2x¹ = 6x",
            "Apply power rule to second term: d/dx(2x) = 2·1x⁰ = 2",
            "Derivative of constant: d/dx(-5) = 0",
            "Combine all terms: f'(x) = 6x + 2",
          ],
          finalAnswer: "f'(x) = 6x + 2",
          commonMistakes: [
            "Forgetting to multiply by the original exponent",
            "Not reducing the exponent by 1",
            "Forgetting that the derivative of a constant is 0",
          ],
          verification:
            "We can check using the definition of derivative or verify that our power rule application is correct.",
        },
      },
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000 + 5000).toISOString(),
    },
    {
      role: "user",
      content: "Can you explain the power rule more?",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      role: "model",
      content: {
        inputType: "conceptExplanation",
        title: "The Power Rule for Derivatives",
        conceptExplanation: {
          conceptOverview:
            "The power rule is one of the most fundamental rules in calculus. It states that if f(x) = xⁿ, then f'(x) = n·xⁿ⁻¹. In other words, bring down the exponent as a coefficient and reduce the exponent by 1.",
          keyTerms:
            "• Derivative: rate of change of a function\n• Exponent: the power to which a number is raised\n• Coefficient: the number multiplying the variable",
          equations:
            "Power Rule: d/dx(xⁿ) = n·xⁿ⁻¹\n\nExamples:\n• d/dx(x³) = 3x²\n• d/dx(x⁵) = 5x⁴\n• d/dx(x) = 1·x⁰ = 1",
          exampleProblem:
            "Find d/dx(4x³):\n1. Multiply 4 by the exponent 3: 4·3 = 12\n2. Reduce exponent by 1: 3-1 = 2\n3. Answer: 12x²",
          commonMistakes: [
            "Forgetting to multiply by the coefficient",
            "Not reducing the exponent",
            "Confusing with exponential functions (aˣ)",
          ],
        },
      },
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000 + 5000).toISOString(),
    },
  ],
  "mock-chat-3": [
    {
      role: "user",
      content: "What is sin, cos, and tan?",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      role: "model",
      content: {
        inputType: "conceptExplanation",
        title: "Trigonometric Functions Basics",
        conceptExplanation: {
          conceptOverview:
            "Sine (sin), cosine (cos), and tangent (tan) are the three primary trigonometric functions. They describe the relationships between angles and sides in right triangles.",
          keyTerms:
            "• Opposite: side across from the angle\n• Adjacent: side next to the angle (not hypotenuse)\n• Hypotenuse: longest side, opposite the right angle\n• Angle: measured in degrees or radians",
          equations:
            "For a right triangle with angle θ:\n\nsin(θ) = opposite / hypotenuse\ncos(θ) = adjacent / hypotenuse\ntan(θ) = opposite / adjacent\n\nAlso: tan(θ) = sin(θ) / cos(θ)",
          exampleProblem:
            "In a right triangle with angle θ = 30°:\n• If hypotenuse = 2 and opposite = 1\n• Then sin(30°) = 1/2 = 0.5\n• Adjacent = √3 (by Pythagorean theorem)\n• cos(30°) = √3/2 ≈ 0.866\n• tan(30°) = 1/√3 ≈ 0.577",
          commonMistakes: [
            "Confusing which side is opposite vs adjacent",
            "Forgetting that angles can be in degrees or radians",
            "Mixing up the sin and cos definitions",
          ],
        },
      },
      timestamp: new Date(
        Date.now() - 24 * 60 * 60 * 1000 + 5000,
      ).toISOString(),
    },
    {
      role: "user",
      content: "What's the unit circle?",
      timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    },
    {
      role: "model",
      content:
        "The unit circle is a circle with radius 1 centered at the origin (0,0) on a coordinate plane. It's incredibly useful in trigonometry because:\n\n1. Any point (x, y) on the unit circle can be described as (cos θ, sin θ) where θ is the angle from the positive x-axis\n\n2. This means sin θ is the y-coordinate and cos θ is the x-coordinate of points on the circle\n\n3. Common angles like 30°, 45°, 60°, 90° have exact values that are easy to remember\n\nFor example, at 45° (or π/4 radians):\n• cos(45°) = √2/2 ≈ 0.707\n• sin(45°) = √2/2 ≈ 0.707\n• tan(45°) = 1\n\nThe unit circle helps visualize how trig functions work and makes it easier to remember their values!",
      timestamp: new Date(
        Date.now() - 23 * 60 * 60 * 1000 + 5000,
      ).toISOString(),
    },
  ],
};
