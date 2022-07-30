import User from "../models/user.model.js";
import mongoose from 'mongoose';
import { response } from "express";

const handler = {}

handler.clientConnected = async (socket) => {
    try {
        const userId = socket.handshake.auth.id;

        const user = await User.findById(mongoose.Types.ObjectId(`${userId}`)).populate("rooms");
        const userRooms = user.rooms;

        for (const room of userRooms) {
            socket.join(room._id);
        }

        socket.on('send_message', ({ message, roomId }) => {
            console.log(roomId, userId, message)
            socket.to(`${roomId}`).emit('receive_message', { roomId, userId, message });
        });

        socket.on('receive_message', ({ roomId, userId, message }) => {
            console.log('received');
            console.log(roomId, userId, message)
        });
    
    } catch (e) {
        console.error(e);
        socket.disconnect();
    } 
}

export default handler;