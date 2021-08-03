const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//getting the username and room from URL
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});


const socket = io();

//join chatroom
socket.emit('joinRoom', {username, room});

socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    outputUsersInRoom(users);
});

socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const message = e.target.elements.msg.value;

    //sends message to server
    socket.emit('chatMessage', message);

    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
});

//outputs the message 
function outputMessage(message){
    //console.log('out putting message');
    const div = document.createElement('div');
    div.classList.add('message');

    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;

    document.querySelector('.chat-messages').appendChild(div);
}

function outputRoomName(room){
    roomName.textContent = room;
}

function outputUsersInRoom(users){
    userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join("")}`;
}
