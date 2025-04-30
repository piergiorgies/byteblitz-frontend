import { Complexity } from "./Difficulty";
import { Scoreboard } from "./Scoreboard";

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
