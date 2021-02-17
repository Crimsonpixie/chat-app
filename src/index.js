const path=require('path');
const express=require('express');
const app=express();
const socketio=require('socket.io');
const http=require('http');
const Filter=require('bad-words');
const { generateMessage, generateLocationMessaage } = require('./utils/message');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');
require('./utils/message');
const port=process.env.PORT||3000;
const publicDirectoryPath=path.join(__dirname,'../public');
app.use(express.static(publicDirectoryPath));
const server=http.createServer(app);
const io=socketio(server);
io.on('connection',(socket)=>{
  console.log('New connection for socket.io');
  socket.on('join',(options,callback)=>{
    const {error,user}=addUser({id:socket.id,...options})
    if(error){
      return callback(error);
    }
    socket.join(user.room);
    socket.emit('Message',generateMessage('Admin','Welcome!'));
    socket.broadcast.to(user.room).emit('Message',generateMessage('Admin',`${user.username} has logged in!`));  
    io.to(user.room).emit('roomData',{
      room:user.room,
      users:getUsersInRoom(user.room)
    })
    callback();  
  })
  socket.on('sendMessage',(message,callback)=>{
    const filter=new Filter({placeHolder:'x'});
    if(filter.isProfane(message)){
      return callback(filter.clean(message));
    }
    const user=getUser(socket.id);
    io.to(user.room).emit('Message',generateMessage(`${user.username}`,message)); 
    callback();
  })
  socket.on('sendLocation',(coords,callback)=>{
    const user=getUser(socket.id);
    io.to(user.room).emit('locationMessage',generateLocationMessaage(`${user.username}`,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
    callback();
  })
  socket.on('disconnect',()=>{
    const user=removeUser(socket.id);
    if(user){
      io.to(user.room).emit('Message',generateMessage('Admin',`${user.username} has left!`)); 
      io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUsersInRoom(user.room)
      })
    }
  }) 
})
server.listen(port,()=>{
  console.log('Server is up on port '+port);  
})