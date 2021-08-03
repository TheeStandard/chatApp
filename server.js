const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./untils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./untils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);



//set static folder
app.use(express.static(path.join(__dirname, 'public')));

//botName
const botName = "Datcord Bot";

//run when client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        //sending message to client side
        socket.emit('message', formatMessage(botName, "Welcome to Datcord"));

        //broadcast when user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`));

        //sending users in room
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    });

    //listen for chatMessage
    socket.on('chatMessage', message => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, message));
    });

    //broadcast when user disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user){
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));

            //sending users in room
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    });

});

const PORT = 3000 || process.env.PORT

server.listen(PORT, () => {
    console.log(`Sever running on port ${PORT}`);
});