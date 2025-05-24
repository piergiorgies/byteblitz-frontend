export interface User {
    id: number;
    username: string;
    email: string;
    registered_at: Date;
    user_type_id: number;
    code: string;
}

export interface UserType {
    id: number;
    code: string;
    permission: number;
    description: string;
}

export interface ProfileInfo {
    acceptance: number;
    total_year_sub: number;
    submission_map: Record<string, number>;
    email: string;
    username: string;
    registered_at: Date;
    has_password: boolean;
}
