export interface TestCaseSubmission {
    id?: number;
    number: number;
    notes: string;
    time: number;
    memory: number;
    result_id: number;
}

export interface SubmissionResult {
    id: number;
    code: string;
    description: string;
}

export interface ProblemSubmission {
    id: number;
    user_id: number;
    problem_id: number;
    language_id: number;
    submitted_code: string;
    submission_result_id: number;
    created_at: string;
    score: number;
}

export interface TotalResult {
    type: string;
    submission_id: number;
    score: number;
    result: string;
}