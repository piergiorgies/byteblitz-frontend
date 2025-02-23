'use client';

import { Flex, Group, Text, Title, Badge, useMantineTheme } from '@mantine/core';
import { FaRegClock } from 'react-icons/fa6';

interface ContestHeaderProps {
    title: string;
    startDatetime?: string;
    endDatetime?: string;
}

export default function ContestHeader({
    title,
    startDatetime,
    endDatetime,
}: ContestHeaderProps) {
    const theme = useMantineTheme();

    // Helper function to determine the contest status
    const getStatus = () => {
        if (!startDatetime || !endDatetime) return 'upcoming'; // Default if no datetimes
        const now = new Date().getTime();
        const start = new Date(startDatetime).getTime();
        const end = new Date(endDatetime).getTime();

        if (now < start) return 'upcoming';  // Contest has not started yet
        if (now >= start && now <= end) return 'ongoing';  // Contest is currently ongoing
        return 'past';  // Contest has ended
    };

    const currentStatus = getStatus();

    // Dynamic badge text and color based on status
    let dynamicBadgeText = '';
    let dynamicBadgeColor = '';
    switch (currentStatus) {
        case 'upcoming':
            dynamicBadgeText = 'Upcoming';
            dynamicBadgeColor = 'blue';
            break;
        case 'ongoing':
            dynamicBadgeText = 'Ongoing';
            dynamicBadgeColor = 'green';
            break;
        case 'past':
            dynamicBadgeText = 'Past';
            dynamicBadgeColor = 'gray';
            break;
        default:
            dynamicBadgeText = 'No Status';  // Fallback if something goes wrong
            dynamicBadgeColor = 'gray';  // Fallback
    }

    return (
        <Flex direction="column" align="start" mt={8} gap="xs">
            {/* Contest Title with Badge */}
            <Flex align="center">
                <Title order={1}>{title}</Title>
                <Badge color={dynamicBadgeColor} variant="light" ml={10}>
                    {dynamicBadgeText}
                </Badge>
            </Flex>

            {/* Date-Time Info */}
            <Flex direction="row" gap="lg" align="center">
                {startDatetime && (
                    <Group gap="xs">
                        <FaRegClock size={18} style={{ color: theme.colors.gray[6] }} />
                        <Text size="sm" c="dimmed">Starts:</Text>
                        <Text size="sm" fw={600} c="gray.9">
                            {new Date(startDatetime).toLocaleString('en-US', {
                                weekday: 'short',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                            })}
                        </Text>
                    </Group>
                )}

                {endDatetime && (
                    <Group gap="xs">
                        <FaRegClock size={18} style={{ color: theme.colors.gray[6] }} />
                        <Text size="sm" c="dimmed">Ends:</Text>
                        <Text size="sm" fw={600} c="gray.9">
                            {new Date(endDatetime).toLocaleString('en-US', {
                                weekday: 'short',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                            })}
                        </Text>
                    </Group>
                )}
            </Flex>
        </Flex>
    );
}
