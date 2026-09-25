// In-memory storage for users and tasks

const users = new Map();
const tasks = new Map();

// ==================== SAMPLE USERS ====================

users.set("user-1", {
  id: "user-1",
  name: "Ashwini Barapatre",
  email: "ashwinibarapatre121@gmail.com",
  password: "123456",
});

users.set("user-2", {
  id: "user-2",
  name: "Vaibhav Araikar",
  email: "vaibhav@gmail.com",
  password: "112233",
});

users.set("user-3", {
  id: "user-3",
  name: "Aryan Batulwar",
  email: "aryan887@gmail.com",
  password: "789023",
});

// Export the stores
module.exports = {
  users,
  tasks,
};