export interface TestCaseSubmission {
    id?: number;
    number: number;
    notes: string;
    time: number;
    memory: number;
    resultId: number;
}

export interface SubmissionResult {
    id: number;
    code: string;
    description: string;
}
