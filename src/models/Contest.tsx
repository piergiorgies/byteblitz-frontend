import { Complexity } from './Difficulty';
import { Scoreboard } from './Scoreboard';

export interface Contest {
    id: number;
    name: string;
    description: string;
    start_datetime: Date;
    end_datetime: Date;
    is_public: boolean;
    is_registration_open: boolean;
}

export interface ContestMinimal extends Contest {
    duration: number;
    n_participants: number;
    n_problems: number;
    n_submissions: number;
}

export interface ContestProblem {
    id: number;
    title: string;
    points: number;
    languages: string[];
    difficulty: Complexity;
    is_public: boolean;
}

export interface ContestUser {
    id: number;
    username: string;
}
export interface ContestInfos extends Contest {
    duration: number;
    n_submissions: number;
    problems: ContestProblem[];
    users: ContestUser[];
    scoreboard: Scoreboard;
}

export interface ContestSubmission {
    id: number;
    problem_id: number;
    problem_title: string;
    user_id: number;
    username: string;
    status: string;
    created_at: Date;
    score: number;
}

export interface TestCaseDetail {
    number: number;
    memory: number;
    time: number;
    notes: string;
    result_code: number;
}

export interface SubmissionInfo {
    id: number;
    code: string;
    problem_id: number;
    test_case_results: TestCaseDetail[];
}
