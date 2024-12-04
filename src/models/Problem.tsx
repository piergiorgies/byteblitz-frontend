export interface Constraint {
    problem_id: number;
    language_id: number;
    language_name: string;
    memory_limit: number;
    time_limit: number;
}

export interface Problem {
    id: number;
    title: string;
    description: string;
    points: number;
    is_public: boolean;
    constraints: Constraint[];
}
