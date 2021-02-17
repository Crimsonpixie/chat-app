const socket=io();
//elements
const $messageForm=document.querySelector('#message-form');
const $messageFormInput=document.querySelector('input');
const $messageFormButton=document.querySelector('#message-button');
const $locationButton=document.querySelector('#location');
const $messages=document.querySelector('#messages');
//templates
const $messagesTemplate=document.querySelector('#message-template').innerHTML;
const $locationTemplate=document.querySelector('#location-template').innerHTML;
const $sidebarTemplate=document.querySelector('#sidebar-template').innerHTML;
//options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true});
const autoscroll=()=>{
  //New message element
  const $newMessage=$messages.lastElementChild;
  //Height of the new message
  const newMessageStyles=getComputedStyle($newMessage);
  const newMessageMargin=parseInt(newMessageStyles.marginBottom);
  const newMessageHeight=$newMessage.offsetHeight+newMessageMargin;
  //Visible Height
  const VisibleHeight=$messages.offsetHeight;
  //Height of messages container
  const containerHeight=$messages.scrollHeight;
  //How far have I scrolled?
  const scrollOffset=$messages.scrollTop+VisibleHeight;
  if(containerHeight-newMessageHeight<=scrollOffset){
    $messages.scrollTop=$messages.scrollHeight;
  }
}
socket.on('locationMessage',(message)=>{
  console.log(message);
  const html=Mustache.render($locationTemplate,{
   username:message.username,
   url:message.url,
   createdAt:moment(message.createdAt).format('h:mm a')     
  })  
  $messages.insertAdjacentHTML('beforeend',html);
  autoscroll();
})
socket.on('Message',(message)=>{
  console.log(message);
  const html=Mustache.render($messagesTemplate,{
    username:message.username, 
    message:message.text,
    createdAt:moment(message.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend',html);
  autoscroll();
})
socket.on('roomData',({room,users})=>{
  console.log(room);
  console.log(users);
  const html=Mustache.render($sidebarTemplate,{
    room,
    users    
  })
  document.querySelector('#sidebar').innerHTML=html;
})
$messageForm.addEventListener('submit',(e)=>{
  e.preventDefault();
  $messageFormButton.setAttribute('disabled','disabled');
  const message=e.target.elements.message.value;
  socket.emit('sendMessage',message,(error)=>{
   $messageFormButton.removeAttribute('disabled');
   $messageFormInput.value='';
   $messageFormInput.focus();   
   if(error){
    return console.log(error);
   }
   console.log('The message is delivered!');
  }); 
})
$locationButton.addEventListener('click',()=>{
  if(!navigator.geolocation){
    return alert('Geolocation API is not valid for your browser!!!');  
  }
  $locationButton.setAttribute('disabled','disabled');
  navigator.geolocation.getCurrentPosition((position)=>{
   socket.emit('sendLocation',{
     latitude:position.coords.latitude,
     longitude:position.coords.longitude     
   },()=>{
    $locationButton.removeAttribute('disabled');  
    console.log('Location sent!');
   })  
  }) 
})
socket.emit('join',{username,room},(error)=>{
  if(error){
   alert(error); 
   location.href='/';
  }
});
/* socket.on('updateCount',(count)=>{
  console.log('The count has been updated! ',count);   
})
document.querySelector('#increment').addEventListener('click',()=>{
  console.log('Clicked');
  socket.emit('increment');
}) */