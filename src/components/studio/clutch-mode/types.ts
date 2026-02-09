export interface ClutchIntakeData {
  deadline: string;
  deadlineTime: string;
  workingWindows: WorkingWindow[];
  minSleepHours: number;
  focusMethod: "25/5" | "50/10" | "90/15";
  energyLevel: number;
  brainDump: string;
  topOutcomes: string[];
  fixedCommitments: FixedCommitment[];
  doneEnough: string;
}

export interface WorkingWindow {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface FixedCommitment {
  id: string;
  label: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface ClutchPlan {
  summary: string;
  topPriorities: {
    task: string;
    reason: string;
    estimatedMinutes: number;
  }[];
  scheduleBlocks: {
    startTime: string;
    endTime: string;
    label: string;
    type: "work" | "break" | "admin" | "buffer";
  }[];
  next60Minutes: {
    step: string;
    minutes: number;
  }[];
  twoMinuteStart: string;
  ifBehindPlan: string[];
  notes: string[];
}

export interface ReplanData {
  completedTasks: string;
  remainingTime: string;
  currentEnergy: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  updatedPlan?: ClutchPlan;
}
