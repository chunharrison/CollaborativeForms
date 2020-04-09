
// contains the users as list of dictionaries containing:
//      socket id, username, room name
const users = [];


// adds a user to 
const addUser = ({id, name, room}) => {
    
    name = name.trim().toLowerCase();
    
    // const existingUser = users.find((user) => user.room === room && user.name === name);
    // if (existingUser) {
    //     return {error: 'Username is taken'};
    // }

    const user = {id, name, room}
    users.push(user)

    return user
}


const removeUser = (id) => {
    const userIndex = users.findIndex((user) => user.id === id);

    // if there is a user of the index above, remove the user from 'users' array
    if(userIndex !== -1) {
        return users.splice(userIndex, 1)[0];
    }
}

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

module.exports = { addUser, removeUser, getUser, getUsersInRoom };