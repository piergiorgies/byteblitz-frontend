'use client';

import { ProfileInfo } from '@/models/User';
import api from '@/utils/ky';
import {
    Container,
    Title,
    Text,
    Tabs,
    Paper,
    Skeleton,
    Button,
    Divider,
    Grid,
    Space,
    useMantineColorScheme,
} from '@mantine/core';
import { Heatmap } from '@mantine/charts';
import { useEffect, useState, useCallback } from 'react';
import ChangePasswordForm from '@/components/users/ChangePasswordForm';
import SubmissionHistoryTable from '@/components/users/SubmissionHistoryTable';

export default function ProfilePage() {
    const [userInfo, setUserInfo] = useState<ProfileInfo>();
    const [loading, setLoading] = useState(true);

    const { setColorScheme, clearColorScheme } = useMantineColorScheme();

    const fetchUserInfo = async () => {
        try {
            const response = await api.get('users/profile/info');
            const data = await response.json<ProfileInfo>();
            setUserInfo(data);
        } catch (error) {
            console.log('Error fetching user info:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserInfo();
    }, []);

    const getFormattedData = useCallback(() => {
        if (!userInfo) return {};
        const formattedData: Record<string, number> = {};
        Object.entries(userInfo.submission_map).forEach(([key, value]) => {
            const date = new Date(key);
            const isoDate = date.toISOString().split('T')[0];
            formattedData[isoDate] = value;
        });
        return formattedData;
    }, [userInfo]);

    return (
        <Container size='lg' py='lg'>
            <Title order={2} mb='lg'>
                User Profile
            </Title>

            <Tabs
                defaultValue='info'
                orientation='vertical'
                variant='pills'
                radius='md'
                color='grey'
                inverted
            >
                <Tabs.List
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                    }}
                >
                    <Tabs.Tab value='info'>Personal Info</Tabs.Tab>
                    <Tabs.Tab value='activity'>Submission Activity</Tabs.Tab>
                    <Tabs.Tab value='recent'>Recent Submissions</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value='info' p='md'>
                    <Paper p='md' withBorder radius='md'>
                        <Title order={4}>Personal Information</Title>
                        <Divider my='sm' />
                        {loading ? (
                            <Skeleton height={80} />
                        ) : (
                            <>
                                <Text>
                                    <strong>Username:</strong>{' '}
                                    {userInfo?.username}
                                </Text>
                                <Text>
                                    <strong>Email:</strong> {userInfo?.email}
                                </Text>
                                <Divider
                                    my='md'
                                    label={
                                        userInfo?.has_password
                                            ? 'Change Password'
                                            : 'Set password'
                                    }
                                    labelPosition='center'
                                />

                                {userInfo && (
                                    <ChangePasswordForm
                                        has_password={userInfo?.has_password}
                                    />
                                )}
                            </>
                        )}
                    </Paper>
                </Tabs.Panel>

                <Tabs.Panel value='activity' p='md'>
                    <Paper p='md' withBorder radius='md'>
                        <Title order={4}>Submission Activity</Title>
                        <Divider my='sm' />
                        {userInfo && (
                            <Heatmap
                                data={getFormattedData()}
                                withTooltip
                                withWeekdayLabels
                                withMonthLabels
                                rectSize={14}
                                gap={2}
                                getTooltipLabel={({ date, value }) => {
                                    const d = new Date(date);
                                    return `${d.toLocaleDateString()} - ${value || 'No'} submissions`;
                                }}
                            />
                        )}
                        <Space h={40} />

                        <Title order={4}>Statistics</Title>
                        <Divider my='sm' />
                        {loading ? (
                            <Skeleton height={100} />
                        ) : (
                            <Grid>
                                <Grid.Col span={6}>
                                    <Text>
                                        <strong>Total year submissions</strong>{' '}
                                        {userInfo?.total_year_sub}
                                    </Text>
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Text>
                                        <strong>Acceptance Rate</strong>{' '}
                                        {(
                                            (userInfo?.acceptance || 0) * 100
                                        ).toFixed(2)}
                                        %
                                    </Text>
                                </Grid.Col>
                            </Grid>
                        )}
                    </Paper>
                </Tabs.Panel>
                <Tabs.Panel value='recent' p='md'>
                    <Paper p='md' withBorder radius='md'>
                        <Title order={4}>Recent Submissions</Title>
                        <Divider my='sm' />
                        <SubmissionHistoryTable />
                    </Paper>
                </Tabs.Panel>
            </Tabs>
        </Container>
    );
}
