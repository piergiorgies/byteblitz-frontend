export interface Constraint {
    problemId: number;
    languageId: number;
    languageName: string;
    memoryLimit: number;
    timeLimit: number;
}

export interface Problem {
    id?: number;
    title: string;
    description: string;
    points: number;
    isPublic: boolean;
    constraints?: ConstraintsInfoInForm[];
    testCases?: ProblemTestCase[];
    difficulty: string;
}

export interface ConstraintsInfoInForm {
    languageId: number;
    timeLimit: number;
    memoryLimit: number;
}

export interface ProblemTestCase {
    number?: number;
    input: string;
    output: string;
    points: number;
    isPretest: boolean;
}
