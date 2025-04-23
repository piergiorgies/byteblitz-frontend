'use client';
import { Complexity } from '@/models/Difficulty';
import { Badge, MantineSize } from '@mantine/core';

type DifficultyProps = {
    difficulty: Complexity;
    size?: MantineSize | (string & {});
};

export default function Difficulty({ difficulty, size }: DifficultyProps) {
    return (
        <Badge
            color={
                difficulty === Complexity.Easy
                    ? 'green'
                    : difficulty === Complexity.Medium
                        ? 'orange'
                        : 'red'
            }
            size={size}
        >
            {difficulty}
        </Badge>
    );
}