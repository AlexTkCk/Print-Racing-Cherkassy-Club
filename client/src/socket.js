import { io } from 'socket.io-client';

const socket = io('ws://localhost:5000', {
    cors: {
        origin: '*',
    },
});
const currentUserId = await new Promise((resolve) => {
    socket.on('client_connected', (data) => {
        resolve(data.client_id);
    })
})


export {socket, currentUserId};

