import ky from 'ky';

const api = ky.extend({
    hooks: {
        beforeRequest: [
            (options) => {
                const accessToken = localStorage.getItem('token');
                if (accessToken) {
                    options.headers.set(
                        'Authorization',
                        `Bearer ${accessToken}`,
                    );
                } else {
                    options.headers.set('Authorization', `Bearer`);
                }
            },
        ],
    },
    prefixUrl: process.env.NEXT_PUBLIC_API_HOST,
});

export default api;
