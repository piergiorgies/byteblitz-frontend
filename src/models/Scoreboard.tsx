export interface UserScore {
    user_id: number;
    total_score: number;
    problems: Record<number, number>;
}

export interface Scoreboard {
    rankings: UserScore[];
}
