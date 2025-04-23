'use client';

import { ContestInfo } from '@/models/Contest';
import { User } from '@/models/User';
import { Box, Button, Card, Flex, Group, Text } from '@mantine/core';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { FaClock, FaPeopleGroup, FaQuestion, FaUpload } from 'react-icons/fa6';

type ContestCardProps = {
    contest: ContestInfo;
};

export default function ContestCard({ contest }: ContestCardProps) {
    const now = dayjs();
    const start = dayjs(contest.start_datetime);
    const end = dayjs(contest.end_datetime);

    const router = useRouter();
    let actionButton;

    const handleRegister = () => {
        router.push(`/contests/view/upcoming?id=${contest.id}`);
    };

    const handleJoin = () => {
        router.push(`/contests/view/ongoing?id=${contest.id}`);
    };

    const handleViewResults = () => {
        router.push(`/contests/view/past?id=${contest.id}`);
    };

    if (now.isBefore(start)) {
        actionButton = (
            <Button color='blue' onClick={handleRegister}>
                View More
            </Button>
        );
    } else if (now.isAfter(start) && now.isBefore(end)) {
        actionButton = (
            <Button color='green' onClick={handleJoin}>
                Join Contest
            </Button>
        );
    } else {
        actionButton = (
            <Button color='gray' onClick={handleViewResults}>
                View Results
            </Button>
        );
    }

    return (
        <Card
            shadow='sm'
            padding='lg'
            radius='md'
            withBorder
            key={contest.id}
            mb='md'
        >
            <Flex>
                <div>
                    <Text size='xl'>{contest.name}</Text>
                    <Text
                        size='md'
                        c='dimmed'
                        style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: 400,
                        }}
                    >
                        {contest.description}
                    </Text>

                    <Group mt='md'>
                        <Text size='xs'>
                            Starts: {start.format('DD MMM YYYY, HH:mm')}
                        </Text>
                        <Text size='xs'>
                            Ends: {end.format('DD MMM YYYY, HH:mm')}
                        </Text>
                    </Group>

                    <Group mt='md'>
                        <Group gap='xs'>
                            <FaClock />
                            <Text size='xs'>{contest.duration} hrs</Text>
                        </Group>
                        <Group gap='xs'>
                            <FaPeopleGroup />
                            <Text size='xs'>
                                {contest.n_participants} participants
                            </Text>
                        </Group>
                        <Group gap='xs'>
                            <FaQuestion />
                            <Text size='xs'>{contest.n_problems} problems</Text>
                        </Group>
                        <Group gap='xs'>
                            <FaUpload />
                            <Text size='xs'>
                                {contest.n_submissions} submissions
                            </Text>
                        </Group>
                    </Group>
                </div>
                <Flex justify={'flex-end'} style={{ flex: 1 }}>
                    <div>{actionButton}</div>
                </Flex>
            </Flex>
        </Card>
    );
}
