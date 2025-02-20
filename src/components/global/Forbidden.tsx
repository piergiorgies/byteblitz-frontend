import { Alert, Center, Text } from '@mantine/core';

export default function Forbidden() {
    return (
        <Center>
            <Alert color='red' title='Forbidden'>
                <Text>You do not have permission to view this page.</Text>
            </Alert>
        </Center>
    );
}
