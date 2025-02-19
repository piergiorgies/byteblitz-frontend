'use client';

import { Complexity } from "@/models/Difficulty";
import { Badge, Center } from "@mantine/core";

type DifficultyProps = {
    difficulty: Complexity;
}

export default function Difficulty({ difficulty }: DifficultyProps) {

    return (
        <Badge color={
            difficulty === Complexity.Easy ? 'green' 
            : difficulty === Complexity.Medium ? 'orange' 
            : 'red'}>
                {difficulty}
        </Badge>
    );

}