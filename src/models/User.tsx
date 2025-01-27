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
