import {Visit} from '~/models/Visit';

let onlineUsers = 0;

export const setupSocketIO = (io) => {
    io.on('connection', (socket) => handleConnection(socket, io));
};

const handleConnection = async (socket, io) => {
    onlineUsers++;
    console.log("New connection established");

    try {
        const visit = await updateVisitCount();
        emitStats(io, visit.count);

        socket.on('disconnect', () => handleDisconnect(io));
    } catch (error) {
        console.error("Error handling Socket.IO connection:", error);
    }
};

const handleDisconnect = (io) => {
    onlineUsers--;
    emitStats(io);
};

const updateVisitCount = async () => {
    try {
        let visit = await Visit.findOne();
        if (!visit) {
            visit = new Visit({count: 1});
        } else {
            visit.count++;
        }
        await visit.save();
        return visit;
    } catch (error) {
        console.error("Error updating visit count:", error);
        throw error; // Re-throw the error to be caught in handleConnection
    }
};

const emitStats = async (io, totalVisits = null) => {
    try {
        if (totalVisits === null) {
            const visit = await Visit.findOne();
            totalVisits = visit ? visit.count : 0;
        }
        io.emit('stats', {online: onlineUsers, total: totalVisits});
    } catch (error) {
        console.error("Error emitting stats:", error);
    }
};
