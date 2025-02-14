'use client';

import {
    Box,
    Center,
    Tabs,
    Text,
    Loader,
    Container,
    Grid,
    Title,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import api from '@/utils/ky';
import ContestCard from '@/components/contests/ContestCard';
import { ContestInfo } from '@/models/Contest';
import { User } from '@/models/User';

export default function Contests() {
    const [contests, setContests] = useState<{
        ongoing: ContestInfo[];
        upcoming: ContestInfo[];
        past: ContestInfo[];
    }>({
        ongoing: [],
        upcoming: [],
        past: [],
    });
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null as User | null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('users/me');
                response.json<User>().then((data) => {
                    setUser(data);
                });
            } catch (error) {
                setUser(null);
            }
        };

        fetchUser();
    }, []);

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const response = await api.get('contests/info');
                response
                    .json<{
                        ongoing: ContestInfo[];
                        upcoming: ContestInfo[];
                        past: ContestInfo[];
                    }>()
                    .then((data) => {
                        setContests(data);
                        setLoading(false);
                    });
            } catch (error) {
                console.error('Error fetching contests:', error);
                setLoading(false);
            }
        };

        fetchContests();
    }, []);

    return (
        <Box p='xl'>
            {loading ? (
                <Center mt='xl'>
                    <Loader size='lg' />
                </Center>
            ) : (
                <Grid gutter='xl'>
                    {/* Past Contests */}
                    <Grid.Col span={4}>
                        <Center>
                            <Title order={2}>Past Contests</Title>
                        </Center>
                        {contests.past.map((contest) => (
                            <ContestList
                                key={contest.id}
                                contests={[contest]}
                                user={user}
                            />
                        ))}
                    </Grid.Col>

                    {/* Ongoing Contests */}
                    <Grid.Col span={4}>
                        <Center>
                            <Title order={2}>Ongoing Contests</Title>
                        </Center>
                        {contests.ongoing.map((contest) => (
                            <ContestList
                                key={contest.id}
                                contests={[contest]}
                                user={user}
                            />
                        ))}
                    </Grid.Col>

                    {/* Upcoming Contests */}
                    <Grid.Col span={4}>
                        <Center>
                            <Title order={2}>Upcoming Contests</Title>
                        </Center>
                        {contests.upcoming.map((contest) => (
                            <ContestList
                                key={contest.id}
                                contests={[contest]}
                                user={user}
                            />
                        ))}
                    </Grid.Col>
                </Grid>
            )}
        </Box>
    );
}

function ContestList({
    contests,
    user,
}: {
    contests: ContestInfo[];
    user: User | null;
}) {
    if (contests.length === 0) {
        return <Text mt='md'>No contests available</Text>;
    }

    return (
        <Box mt='md'>
            {contests.map((contest) => (
                <ContestCard key={contest.id} contest={contest} user={user} />
            ))}
        </Box>
    );
}
