const users=[];
const addUser=({id,username,room})=>{
  username=username.trim().toLowerCase();
  room=room.trim().toLowerCase();
  if(!username || !room){
    return {
      error:'UserName and Room are required!'  
    }  
  }
  const existUser=users.find((user)=>{
    return user.username===username && user.room===room; 
  })
  if(existUser){
    return {
      error:'Username is in use!'  
    }  
  }
  const user={id,username,room};
  users.push(user);
  return {user};
}
const removeUser=(id)=>{
  const index=users.findIndex((user)=>user.id===id);
  if(index!=-1){
    return users.splice(index,1)[0];   
  }  
}
const getUser=(id)=>{
  const existUser=users.find((user)=>user.id===id);
  if(existUser){
    return existUser;  
  }
}
const getUsersInRoom=(room)=>{
  room=room.trim().toLowerCase();  
  const res=users.filter((user)=>user.room===room);  
  if(!res.length){
    return [];  
  }
  else return res;
}
module.exports={
  addUser,
  removeUser,
  getUser,
  getUsersInRoom  
}