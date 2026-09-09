import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AxiosAdapter } from "axios";

import { mockChatrooms, mockMessages } from "./mockChatData";
import { MOCK_QUESTIONS, type MockQuestion } from "./practice_questions";

const STORAGE_KEY = "praxis-local-api-v1";
export const LOCAL_TOKEN =
  "eyJhbGciOiJub25lIn0.eyJzdWIiOiJsb2NhbC1hZG1pbiIsImV4cCI6NDEwMjQ0NDgwMH0.c2lnbmF0dXJl";

type JsonObject = Record<string, any>;

type LocalPracticeQuestion = {
  id: string;
  topic: string;
  question: string;
  options: string[];
  answer: string;
  hints: string[];
  totalMarks: number;
};

type LocalPractice = {
  practiceId: string;
  userId: string;
  topics: string[];
  difficulty: "easy" | "hard" | "dse";
  questionType: "mc" | "wq";
  questions: LocalPracticeQuestion[];
  createdAt: string;
  completed: boolean;
  answers?: string[];
  secondsSpent?: number;
};

type LocalUser = {
  userId: string;
  username: string;
  email: string;
  password: string;
  registeredAt: string;
  lastLogin: string;
  profile: JsonObject;
  pawCoins: number;
  xp: number;
  totalXp: number;
  items: Record<string, JsonObject>;
  buffs: JsonObject[];
  transactions: JsonObject[];
};

type LocalData = {
  users: Record<string, LocalUser>;
  practices: Record<string, LocalPractice>;
  dailyExercises: Record<string, LocalPractice>;
  chats: Record<string, JsonObject[]>;
  messages: Record<string, Record<string, JsonObject[]>>;
  followUps: Record<string, JsonObject>;
};

const now = () => new Date().toISOString();
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const id = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const shopItems = [
  {
    id: "DOUBLE_COINS_1H",
    name: "Double Paw Coins",
    description: "Double the paw coins earned from practice for one hour.",
    price: 180,
    type: "boost",
    buff: "double_coins",
    purchasable: true,
    durationSeconds: 3600,
  },
  {
    id: "DOUBLE_XP_1H",
    name: "Double XP",
    description: "Double the experience earned from practice for one hour.",
    price: 220,
    type: "boost",
    buff: "double_xp",
    purchasable: true,
    durationSeconds: 3600,
  },
  {
    id: "HOURLY_MAKEUP_HOURGLASS",
    name: "Streak Hourglass",
    description: "Protect your daily learning streak for one missed day.",
    price: 150,
    type: "boost",
    buff: "streak_makeup",
    purchasable: true,
    durationSeconds: 0,
  },
  {
    id: "DEFAULT_CAT",
    name: "Classic Cat",
    description: "The original Praxis study companion.",
    price: 0,
    type: "clothing",
    purchasable: true,
    durationSeconds: 0,
  },
  {
    id: "ROLLINGCAT_CUTE",
    name: "Cute Cat",
    description: "A cheerful pink companion for study sessions.",
    price: 320,
    type: "clothing",
    purchasable: true,
    durationSeconds: 0,
  },
  {
    id: "ROLLINGCAT_NEON",
    name: "Neon Cat",
    description: "A bright companion for late-night revision.",
    price: 450,
    type: "clothing",
    purchasable: true,
    durationSeconds: 0,
  },
  {
    id: "ROLLINGCAT_RAINBOW",
    name: "Rainbow Cat",
    description: "A colorful companion for your biggest milestones.",
    price: 650,
    type: "clothing",
    purchasable: true,
    durationSeconds: 0,
  },
].map((item) => ({ ...item, createdAt: now(), updatedAt: now() }));

const createAdmin = (): LocalUser => ({
  userId: "local-admin",
  username: "admin",
  email: "admin@praxis.local",
  password: "Admin123!",
  registeredAt: now(),
  lastLogin: now(),
  profile: {
    fullName: "Admin Student",
    age: 17,
    gender: "other",
    grade: "Form 6",
    school: "Praxis Academy",
    interests: ["Algebra", "Problem solving"],
    bio: "Working through maths one question at a time.",
  },
  pawCoins: 1200,
  xp: 340,
  totalXp: 340,
  items: {
    DEFAULT_CAT: {
      quantity: 1,
      status: "equipped",
      acquiredAt: now(),
      updatedAt: now(),
    },
  },
  buffs: [],
  transactions: [
    {
      id: "transaction-welcome",
      data: {
        type: "earn",
        itemId: null,
        quantity: null,
        coinsInvolved: 1200,
        createdAt: now(),
        reason: "Welcome reward",
      },
    },
  ],
});

function createSeedPractice(
  practiceId: string,
  questions: MockQuestion[],
  difficulty: LocalPractice["difficulty"],
  createdAt: string,
  correctAnswers: number,
): LocalPractice {
  const practiceQuestions = questions.map(toPracticeQuestion);
  return {
    practiceId,
    userId: "local-admin",
    topics: [...new Set(practiceQuestions.map((question) => question.topic))],
    difficulty,
    questionType: "mc",
    questions: practiceQuestions,
    createdAt,
    completed: true,
    answers: practiceQuestions.map((question, index) =>
      index < correctAnswers
        ? question.answer
        : question.options.find((option) => option !== question.answer) || "",
    ),
    secondsSpent: practiceQuestions.length * 42,
  };
}

function createSeedPractices(): Record<string, LocalPractice> {
  const createdAt = (daysAgo: number) =>
    new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
  const easy = MOCK_QUESTIONS.filter(
    (question) => question.difficulty === "easy",
  );
  const hard = MOCK_QUESTIONS.filter(
    (question) => question.difficulty === "hard",
  );
  const dse = MOCK_QUESTIONS.filter(
    (question) => question.difficulty === "dse",
  );

  return {
    "seed-practice-easy": createSeedPractice(
      "seed-practice-easy",
      easy.slice(0, 5),
      "easy",
      createdAt(1),
      4,
    ),
    "seed-practice-hard": createSeedPractice(
      "seed-practice-hard",
      hard.slice(10, 15),
      "hard",
      createdAt(3),
      4,
    ),
    "seed-practice-dse": createSeedPractice(
      "seed-practice-dse",
      dse.slice(20, 25),
      "dse",
      createdAt(6),
      3,
    ),
  };
}

const createSeed = (): LocalData => ({
  users: { "local-admin": createAdmin() },
  practices: createSeedPractices(),
  dailyExercises: {},
  chats: { "local-admin": clone(mockChatrooms) },
  messages: { "local-admin": clone(mockMessages) },
  followUps: {},
});

let cachedData: LocalData | null = null;

function addMissingDemoData(data: LocalData) {
  data.users ||= {};
  data.users["local-admin"] ||= createAdmin();
  data.practices ||= {};
  data.chats ||= {};
  data.messages ||= {};
  data.dailyExercises ||= {};
  data.followUps ||= {};

  if (
    !Object.values(data.practices).some(
      (practice) => practice.userId === "local-admin",
    )
  ) {
    Object.assign(data.practices, createSeedPractices());
  }
  data.chats["local-admin"] ||= clone(mockChatrooms);
  data.messages["local-admin"] ||= clone(mockMessages);
}

async function getData(): Promise<LocalData> {
  if (cachedData) return cachedData;
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    cachedData = saved ? JSON.parse(saved) : createSeed();
    if (!cachedData || typeof cachedData !== "object") {
      cachedData = createSeed();
    }
  } catch {
    cachedData = createSeed();
  }
  addMissingDemoData(cachedData!);
  await saveData();
  return cachedData!;
}

async function saveData() {
  if (cachedData)
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cachedData));
}

export async function authenticateLocalUser(
  userNameOrEmail: string,
  password: string,
) {
  const data = await getData();
  const user = Object.values(data.users).find(
    (candidate) =>
      (candidate.username.toLowerCase() === userNameOrEmail.toLowerCase() ||
        candidate.email.toLowerCase() === userNameOrEmail.toLowerCase()) &&
      candidate.password === password,
  );
  if (!user) throw new Error("Invalid credentials");

  user.lastLogin = now();
  await saveData();
  return {
    userId: user.userId,
    username: user.username,
    email: user.email,
    accessToken: LOCAL_TOKEN,
    refreshToken: LOCAL_TOKEN,
  };
}

function responseError(status: number, error: string, config: any) {
  const requestError = new Error(error) as Error & {
    config?: any;
    response?: { status: number; data: JsonObject };
  };
  requestError.config = config;
  requestError.response = { status, data: { error } };
  return requestError;
}

function getUser(data: LocalData, userId: string, config: any) {
  const user = data.users[userId];
  if (!user) throw responseError(404, "User not found", config);
  return user;
}

function levelFor(totalXp: number) {
  return Math.max(1, Math.floor(totalXp / 250) + 1);
}

function inventory(user: LocalUser) {
  return { pawCoins: user.pawCoins, items: user.items };
}

function progression(user: LocalUser) {
  const level = levelFor(user.totalXp);
  return {
    level,
    xp: user.xp,
    totalXp: user.totalXp,
    xpToNextLevel: level * 250,
  };
}

function hintsFor(question: LocalPracticeQuestion) {
  return [
    `Identify the key idea in ${question.topic.replaceAll("-", " ")}.`,
    "Work through the options one step at a time.",
    `Check your result against the expression: ${question.question}`,
  ];
}

function fallbackQuestions(
  topics: string[],
  difficulty: "easy" | "hard" | "dse",
  amount: number,
) {
  const topicPool = MOCK_QUESTIONS.filter(
    (question) =>
      topics.includes(question.topic) && question.difficulty === difficulty,
  );
  const pool = topicPool.length
    ? topicPool
    : MOCK_QUESTIONS.filter((question) => question.difficulty === difficulty);
  const available = pool.length ? pool : MOCK_QUESTIONS;
  return Array.from(
    { length: Math.max(1, amount) },
    (_, index) => available[index % available.length],
  );
}

function toPracticeQuestion(question: MockQuestion): LocalPracticeQuestion {
  const practiceQuestion: LocalPracticeQuestion = {
    id: question.id,
    topic: question.topic,
    question: question.question,
    options: question.options,
    answer: question.options[question.correctAnswer],
    hints: [],
    totalMarks: 1,
  };
  practiceQuestion.hints = hintsFor(practiceQuestion);
  return practiceQuestion;
}

function visibleQuestion(question: LocalPracticeQuestion, answer?: string) {
  return {
    topic: question.topic,
    question: question.question,
    options: question.options,
    hints: question.hints,
    totalMarks: question.totalMarks,
    ...(answer === undefined
      ? {}
      : {
          answer: question.answer,
          solution: `The correct answer is ${question.answer}.`,
          studentAnswer: answer,
          awardedSteps: answer === question.answer ? ["Correct answer"] : [],
          isStudentCorrect: answer === question.answer,
        }),
  };
}

function practiceDetail(practice: LocalPractice) {
  return {
    questions: practice.questions.map((question, index) =>
      visibleQuestion(
        question,
        practice.completed ? practice.answers?.[index] || "" : undefined,
      ),
    ),
    difficulty: practice.difficulty,
    questionType: practice.questionType,
    createdAt: practice.createdAt,
    secondsSpent: practice.secondsSpent,
  };
}

function addRewards(user: LocalUser, correct: number, total: number) {
  const coinsGained = 20 + correct * 8;
  const xpGained = 15 + correct * 10;
  user.pawCoins += coinsGained;
  user.xp += xpGained;
  user.totalXp += xpGained;
  user.transactions.unshift({
    id: id("transaction"),
    data: {
      type: "earn",
      itemId: null,
      quantity: null,
      coinsInvolved: coinsGained,
      createdAt: now(),
      reason: `Completed ${total} questions`,
    },
  });
  return {
    coinsGained,
    xpGained,
    itemsGranted: [],
    updatedPawCoins: user.pawCoins,
    updatedLevel: levelFor(user.totalXp),
    updatedXp: user.xp,
    totalXp: user.totalXp,
  };
}

function markPractice(
  user: LocalUser,
  practice: LocalPractice,
  answers: string[],
  secondsSpent: number,
) {
  practice.answers = practice.questions.map((_, index) => answers[index] || "");
  practice.secondsSpent = Math.max(0, secondsSpent);
  practice.completed = true;
  const correct = practice.questions.filter(
    (question, index) => question.answer === practice.answers?.[index],
  ).length;
  return {
    markingResult: practice.questions.map((question, index) => ({
      answer: question.answer,
      solution: `The correct answer is ${question.answer}.`,
      studentAnswer: practice.answers?.[index] || "",
      awardedSteps:
        question.answer === practice.answers?.[index] ? ["Correct answer"] : [],
      totalMarks: question.totalMarks,
      isStudentCorrect: question.answer === practice.answers?.[index],
    })),
    rewards: addRewards(user, correct, practice.questions.length),
  };
}

function statistics(data: LocalData, userId: string) {
  const completed = Object.values(data.practices).filter(
    (practice) => practice.userId === userId && practice.completed,
  );
  const history = completed.map((practice) => {
    const correct = practice.questions.filter(
      (question, index) => question.answer === practice.answers?.[index],
    ).length;
    return {
      score: practice.questions.length
        ? correct / practice.questions.length
        : 0,
      difficulty: practice.difficulty,
      secondsPerQuestion:
        (practice.secondsSpent || 0) / Math.max(1, practice.questions.length),
      questionsCount: practice.questions.length,
      finishedAt: practice.createdAt,
    };
  });
  const averageScore = history.length
    ? history.reduce((sum, item) => sum + item.score, 0) / history.length
    : 0;
  const completedQuestions = completed.reduce(
    (sum, practice) => sum + practice.questions.length,
    0,
  );
  const topicStats = completed.reduce<
    Record<string, { correct: number; total: number; difficulty: number }>
  >((accumulator, practice) => {
    practice.questions.forEach((question, index) => {
      const entry = accumulator[question.topic] || {
        correct: 0,
        total: 0,
        difficulty: 0,
      };
      entry.total += 1;
      entry.correct += question.answer === practice.answers?.[index] ? 1 : 0;
      entry.difficulty +=
        practice.difficulty === "dse"
          ? 100
          : practice.difficulty === "hard"
            ? 70
            : 40;
      accumulator[question.topic] = entry;
    });
    return accumulator;
  }, {});
  const byTopicPerformance = Object.fromEntries(
    Object.entries(topicStats).map(([topic, value]) => [
      topic,
      {
        averageScore: value.correct / value.total,
        averageDifficultyScore: value.difficulty / value.total,
        questionsCompleted: value.total,
      },
    ]),
  );
  const activityLogs = Array.from({ length: 5 }, (_, index) => {
    const daysAgo = 4 - index;
    const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const seededActivity = [
      { completedQuestions: 6, participatedBattles: 0, chatAsked: 1 },
      { completedQuestions: 5, participatedBattles: 0, chatAsked: 2 },
      { completedQuestions: 8, participatedBattles: 0, chatAsked: 1 },
      { completedQuestions: 4, participatedBattles: 0, chatAsked: 3 },
      { completedQuestions: 7, participatedBattles: 0, chatAsked: 2 },
    ][index];
    return { date, activity: seededActivity };
  });
  return {
    overview: {
      averageScore,
      averageSpeed: history.length
        ? history.reduce((sum, item) => sum + item.secondsPerQuestion, 0) /
          history.length
        : 0,
      averageDifficultyScore: averageScore * 100,
      topicsCovered: completedQuestions ? 1 : 0,
    },
    practiceHistory: history,
    byTopicPerformance,
    activityLogs,
  };
}

function dailyStreak(data: LocalData, userId: string) {
  const completed = Object.values(data.dailyExercises).filter(
    (exercise) => exercise.userId === userId && exercise.completed,
  );
  return {
    dailyStreak: {
      startDate: completed.length ? completed[0].createdAt.slice(0, 10) : null,
      currentStreak: completed.length ? 1 : 0,
      longestStreak: completed.length ? 1 : 0,
      weekStartDate: now().slice(0, 10),
      weekCompletedExercises: completed.length,
    },
  };
}

function chatResponse(content: string) {
  return {
    inputType: "problemSolving",
    title: "Math Study Notes",
    problemSolving: {
      restatedProblem: content,
      termExplanation:
        "Break the question into the known values and the operation it asks you to perform.",
      solutionSteps: [
        "Read the question carefully and identify the mathematical relationship.",
        "Write the relevant expression before calculating.",
        "Check that the final answer matches the question.",
      ],
      finalAnswer: "Use the same method on the next similar question.",
      commonMistakes: [
        "Skipping a calculation step",
        "Forgetting to check signs",
      ],
      verification:
        "Substitute your answer into the original expression where possible.",
    },
  };
}

function parseBody(data: unknown): JsonObject {
  if (!data) return {};
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  return data as JsonObject;
}

async function dispatch(config: any) {
  const data = await getData();
  const method = String(config.method || "get").toLowerCase();
  const path = String(config.url || "").replace(/^https?:\/\/[^/]+\/api/, "");
  const body = parseBody(config.data);

  if (method === "get" && path === "/health") return { status: "ok" };
  if (method === "post" && path === "/auth/register") {
    const duplicate = Object.values(data.users).some(
      (user) =>
        user.username.toLowerCase() === String(body.username).toLowerCase() ||
        user.email.toLowerCase() === String(body.email).toLowerCase(),
    );
    if (duplicate) throw responseError(409, "User already exists", config);
    const userId = id("local-user");
    data.users[userId] = {
      ...createAdmin(),
      userId,
      username: body.username,
      email: body.email,
      password: body.password,
      profile: { ...body.personalInfo, school: "", interests: [], bio: "" },
      items: {},
    };
    data.chats[userId] = [];
    data.messages[userId] = {};
    await saveData();
    return { userId, accessToken: LOCAL_TOKEN, refreshToken: LOCAL_TOKEN };
  }

  if (method === "get" && path.startsWith("/ranking/")) {
    const rankingType = path.split("/").pop();
    const admin = data.users["local-admin"] || Object.values(data.users)[0];
    if (rankingType === "practice") {
      return {
        ranking: [
          {
            userId: "peer-1",
            username: "Sofia",
            avgAccuracy: 0.94,
            avgSpeed: 22,
            avgDifficultyScore: 88,
            topicsCoverage: 0.9,
          },
          {
            userId: admin.userId,
            username: admin.username,
            avgAccuracy: statistics(data, admin.userId).overview.averageScore,
            avgSpeed: 35,
            avgDifficultyScore: 72,
            topicsCoverage: 0.5,
          },
          {
            userId: "peer-2",
            username: "Leo",
            avgAccuracy: 0.78,
            avgSpeed: 40,
            avgDifficultyScore: 66,
            topicsCoverage: 0.4,
          },
        ],
      };
    }
    if (rankingType === "streak") {
      return {
        ranking: [
          {
            userId: "peer-1",
            username: "Sofia",
            longestStreak: 14,
            startDate: now().slice(0, 10),
          },
          {
            userId: admin.userId,
            username: admin.username,
            longestStreak: dailyStreak(data, admin.userId).dailyStreak
              .longestStreak,
            startDate: now().slice(0, 10),
          },
          {
            userId: "peer-2",
            username: "Leo",
            longestStreak: 5,
            startDate: now().slice(0, 10),
          },
        ],
      };
    }
    return {
      ranking: [
        { userId: "peer-1", username: "Sofia", winRate: 0.8, avgScore: 8 },
        {
          userId: admin.userId,
          username: admin.username,
          winRate: 0.5,
          avgScore: 5,
        },
      ],
    };
  }

  if (method === "get" && path === "/shop/items") return { items: shopItems };

  const userMatch = path.match(/^\/users\/([^/]+)(?:\/(.*))?$/);
  if (!userMatch) throw responseError(404, "Route not found", config);
  const [, userId, resource = ""] = userMatch;
  const user = getUser(data, userId, config);
  const parts = resource.split("/").filter(Boolean);

  if (method === "get" && resource === "account") {
    return {
      username: user.username,
      email: user.email,
      registeredAt: user.registeredAt,
      lastLogin: user.lastLogin,
    };
  }
  if (method === "patch" && resource === "account") {
    if (body.password !== user.password)
      throw responseError(401, "Incorrect password", config);
    if (body.username) user.username = body.username;
    if (body.email) user.email = body.email;
    if (body.newPassword) user.password = body.newPassword;
    await saveData();
    return {};
  }
  if (method === "get" && resource === "profile") return clone(user.profile);
  if (method === "patch" && resource === "profile") {
    user.profile = { ...user.profile, ...body.personalInfo };
    await saveData();
    return {};
  }
  if (method === "delete" && !resource) {
    delete data.users[userId];
    delete data.chats[userId];
    delete data.messages[userId];
    await saveData();
    return {};
  }
  if (method === "get" && resource === "statistics")
    return statistics(data, userId);
  if (method === "get" && resource === "daily-streak")
    return dailyStreak(data, userId);
  if (method === "get" && resource === "rate-limit") {
    return {
      requestCount: 0,
      dailyLimit: 100,
      remainingRequests: 100,
      resetAt: now(),
    };
  }
  if (method === "get" && resource === "inventory")
    return { inventory: inventory(user) };
  if (method === "get" && resource === "buffs")
    return {
      buffs: user.buffs.filter(
        (buff) => !buff.expiresAt || buff.expiresAt > now(),
      ),
    };
  if (method === "get" && resource === "progression")
    return { progression: progression(user) };
  if (method === "get" && resource === "transactions")
    return { transactions: user.transactions, nextCursor: null };

  if (
    method === "post" &&
    parts[0] === "shop" &&
    parts[1] === "items" &&
    parts[3] === "purchase"
  ) {
    const item = shopItems.find((candidate) => candidate.id === parts[2]);
    if (!item) throw responseError(404, "Item not found", config);
    const quantity = Math.max(1, Number(body.quantity || 1));
    const cost = item.price * quantity;
    if (user.pawCoins < cost)
      throw responseError(400, "Insufficient coins", config);
    user.pawCoins -= cost;
    const owned = user.items[item.id];
    user.items[item.id] = {
      quantity: (owned?.quantity || 0) + quantity,
      status: owned?.status || "inBag",
      acquiredAt: owned?.acquiredAt || now(),
      updatedAt: now(),
    };
    user.transactions.unshift({
      id: id("transaction"),
      data: {
        type: "purchase",
        itemId: item.id,
        quantity,
        coinsInvolved: -cost,
        createdAt: now(),
        reason: `Purchased ${item.name}`,
      },
    });
    await saveData();
    return { inventory: inventory(user) };
  }
  if (
    method === "post" &&
    parts[0] === "inventory" &&
    parts[1] === "items" &&
    parts[3] === "use"
  ) {
    const itemId = parts[2];
    const owned = user.items[itemId];
    if (!owned?.quantity)
      throw responseError(400, "Item is not available", config);
    const item = shopItems.find((candidate) => candidate.id === itemId);
    if (item?.type === "boost") {
      owned.quantity -= 1;
      user.buffs.push({
        buff: item.buff || item.id,
        name: item.name,
        activatedAt: now(),
        expiresAt: new Date(
          Date.now() + item.durationSeconds * 1000,
        ).toISOString(),
      });
    } else {
      Object.values(user.items).forEach((entry) => {
        if (entry.status === "equipped") entry.status = "inBag";
      });
      owned.status = "equipped";
    }
    owned.updatedAt = now();
    user.transactions.unshift({
      id: id("transaction"),
      data: {
        type: "activate",
        itemId,
        quantity: 1,
        coinsInvolved: 0,
        createdAt: now(),
        reason: `Used ${item?.name || itemId}`,
      },
    });
    await saveData();
    return { inventory: inventory(user), buffs: user.buffs };
  }

  if (parts[0] === "practices") {
    if (method === "post" && parts.length === 1) {
      const practiceId = id("practice");
      const questions = fallbackQuestions(
        body.topics || [],
        body.difficulty || "easy",
        Number(body.amount || 5),
      ).map(toPracticeQuestion);
      const practice: LocalPractice = {
        practiceId,
        userId,
        topics: body.topics || [],
        difficulty: body.difficulty || "easy",
        questionType: body.questionType || "mc",
        questions,
        createdAt: now(),
        completed: false,
      };
      data.practices[practiceId] = practice;
      await saveData();
      return {
        practiceId,
        exercises: questions.map(({ question, options, hints }) => ({
          question,
          options,
          hints,
        })),
      };
    }
    if (method === "get" && parts.length === 1) {
      return {
        practices: Object.values(data.practices)
          .filter((practice) => practice.userId === userId)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .map((practice) => ({
            practiceId: practice.practiceId,
            topics: practice.topics,
            completed: practice.completed,
            createdAt: practice.createdAt,
          })),
      };
    }
    const practice = data.practices[parts[1]];
    if (!practice || practice.userId !== userId)
      throw responseError(404, "Practice not found", config);
    if (method === "get") return practiceDetail(practice);
    if (method === "patch") {
      if (practice.completed)
        throw responseError(409, "Practice is already completed", config);
      const result = markPractice(
        user,
        practice,
        body.answers || [],
        Number(body.secondsSpent || 0),
      );
      await saveData();
      return result;
    }
  }

  if (parts[0] === "daily-exercises") {
    if (method === "get" && parts[1] === "latest") {
      const key = `${userId}-${now().slice(0, 10)}`;
      if (!data.dailyExercises[key]) {
        data.dailyExercises[key] = {
          practiceId: key,
          userId,
          topics: ["law-of-indices"],
          difficulty: "easy",
          questionType: "mc",
          questions: fallbackQuestions(["law-of-indices"], "easy", 5).map(
            toPracticeQuestion,
          ),
          createdAt: now(),
          completed: false,
        };
        await saveData();
      }
      const exercise = data.dailyExercises[key];
      return {
        dailyExerciseId: exercise.practiceId,
        dailyExercise: practiceDetail(exercise),
      };
    }
    if (method === "patch") {
      const exercise = data.dailyExercises[parts[1]];
      if (!exercise)
        throw responseError(404, "Daily exercise not found", config);
      if (exercise.completed)
        throw responseError(409, "Daily exercise is already completed", config);
      const result = markPractice(
        user,
        exercise,
        body.answers || [],
        Number(body.secondsSpent || 0),
      );
      await saveData();
      return result;
    }
  }

  if (parts[0] === "chats") {
    data.chats[userId] ||= [];
    data.messages[userId] ||= {};
    if (method === "get" && parts.length === 1)
      return {
        chats: data.chats[userId].sort((a, b) =>
          b.updatedAt.localeCompare(a.updatedAt),
        ),
      };
    if (method === "post" && parts.length === 1) {
      const chatId = id("chat");
      data.chats[userId].push({
        chatId,
        title: body.title || "New conversation",
        updatedAt: now(),
      });
      data.messages[userId][chatId] = [];
      await saveData();
      return { chatId };
    }
    const chatId = parts[1];
    const chat = data.chats[userId].find((entry) => entry.chatId === chatId);
    if (!chat) throw responseError(404, "Chat not found", config);
    if (method === "patch" && parts.length === 2) {
      chat.title = body.title || chat.title;
      chat.updatedAt = now();
      await saveData();
      return {};
    }
    if (method === "delete" && parts.length === 2) {
      data.chats[userId] = data.chats[userId].filter(
        (entry) => entry.chatId !== chatId,
      );
      delete data.messages[userId][chatId];
      await saveData();
      return {};
    }
    data.messages[userId][chatId] ||= [];
    if (method === "get" && parts[2] === "messages")
      return { messages: data.messages[userId][chatId] };
    if (
      method === "post" &&
      parts[2] === "messages" &&
      (parts.length === 3 || parts[3] === "with-ocr")
    ) {
      const content = body.content || "Please explain this question.";
      const reply = chatResponse(content);
      data.messages[userId][chatId].push(
        { role: "user", content, timestamp: now() },
        { role: "model", content: reply, timestamp: now() },
      );
      chat.updatedAt = now();
      await saveData();
      return reply;
    }
    if (method === "post" && parts[2] === "generate") {
      const messageId = id("follow-up");
      const questions = [
        {
          question: "Which operation should you perform first?",
          options: [
            "The one inside brackets",
            "The last operation",
            "Any operation",
            "None",
          ],
        },
        {
          question: "What is a useful final step?",
          options: [
            "Check the answer",
            "Erase the work",
            "Change the question",
            "Skip it",
          ],
        },
        {
          question: "What helps avoid mistakes?",
          options: [
            "Show each step",
            "Guess quickly",
            "Ignore signs",
            "Use no working",
          ],
        },
      ];
      data.followUps[messageId] = { userId, chatId, questions };
      await saveData();
      return { messageId, questions };
    }
    if (method === "post" && parts[2] === "marking") {
      const followUp = body.messageId
        ? data.followUps[body.messageId]
        : undefined;
      const questions = (followUp?.questions || []).map(
        (question: JsonObject, index: number) => ({
          ...question,
          answer: question.options[0],
          solution: `The best answer is ${question.options[0]}.`,
          studentAnswer: body.answers?.[index] || "",
          awardedSteps:
            body.answers?.[index] === question.options[0]
              ? ["Correct answer"]
              : [],
          isStudentCorrect: body.answers?.[index] === question.options[0],
        }),
      );
      return { status: "marked", questionType: "mc", questions };
    }
  }

  if (parts[0] === "battles") {
    if (method === "get" && parts.length === 1) return { battles: [] };
    throw responseError(404, "Battle not found", config);
  }

  throw responseError(404, "Route not found", config);
}

export const localApiAdapter: AxiosAdapter = async (config) => {
  try {
    const data = await dispatch(config);
    return {
      data,
      status: 200,
      statusText: "OK",
      headers: {},
      config,
      request: {},
    };
  } catch (error) {
    return Promise.reject(error);
  }
};
