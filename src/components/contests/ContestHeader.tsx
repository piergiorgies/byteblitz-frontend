'use client';

import {
    Flex,
    Group,
    Text,
    Title,
    Badge,
    useMantineTheme,
    Button,
    Paper,
    Tooltip
} from '@mantine/core';
import { FaRegClock, FaHourglassHalf } from 'react-icons/fa6';

interface ContestHeaderProps {
    title: string;
    startDatetime?: string;
    endDatetime?: string;
    isRegistrationOpen?: boolean;
    handleUserRegistration?: () => void;
    timeLeft?: string;
}

export default function ContestHeader({
    title,
    startDatetime,
    endDatetime,
    isRegistrationOpen,
    handleUserRegistration,
    timeLeft,
}: ContestHeaderProps) {
    const theme = useMantineTheme();

    const truncatedTitle = title.length > 40 ? title.slice(0, 37) + '...' : title;

    const getStatus = () => {
        if (!startDatetime || !endDatetime) return 'upcoming';
        const now = new Date().getTime();
        const start = new Date(startDatetime).getTime();
        const end = new Date(endDatetime).getTime();

        if (now < start) return 'upcoming';
        if (now >= start && now <= end) return 'ongoing';
        return 'past';
    };

    const currentStatus = getStatus();

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
    }

    const showRegistration = currentStatus === 'upcoming' && isRegistrationOpen;

    return (
        <Flex direction='column' align='start' mt={8} gap='xs'>
            <Flex
                justify='space-between'
                align='center'
                style={{ width: '100%' }}
            >
                <Flex align='center'>
                    <Tooltip label={title} withArrow>
                        <Title order={1} >{truncatedTitle}</Title>
                    </Tooltip>
                    <Badge color={dynamicBadgeColor} variant='light' ml={10}>
                        {dynamicBadgeText}
                    </Badge>
                </Flex>

                <Group gap='sm'>
                    {timeLeft && currentStatus === 'ongoing' && (
                        <Paper
                            radius='md'
                            p='xs'
                            withBorder
                            shadow='xs'
                        >
                            <Group gap='xs'>
                                <FaHourglassHalf
                                    size={14}
                                    color={theme.colors.green[7]}
                                />
                                <Text size='sm' c='green.9'>
                                    Ends in: {timeLeft}
                                </Text>
                            </Group>
                        </Paper>
                    )}
                    {showRegistration && (
                        <Button
                            size='sm'
                            color='blue'
                            variant='outline'
                            onClick={handleUserRegistration}
                        >
                            Register Now
                        </Button>
                    )}
                </Group>
            </Flex>

            <Flex direction='row' gap='lg' align='center'>
                {startDatetime && (
                    <Group gap='xs'>
                        <FaRegClock
                            size={18}
                            style={{ color: theme.colors.gray[6] }}
                        />
                        <Text size='sm' c='dimmed'>
                            Starts:
                        </Text>
                        <Text size='sm' fw={600} style={{ color: theme.colors.gray[6] }}>
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
                    <Group gap='xs'>
                        <FaRegClock
                            size={18}
                            style={{ color: theme.colors.gray[6] }}
                        />
                        <Text size='sm' c='dimmed'>
                            Ends:
                        </Text>
                        <Text size='sm' fw={600} style={{ color: theme.colors.gray[6] }}>
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
