import { io } from 'socket.io-client';

const socket = io('ws://192.168.0.101:5000', {
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

