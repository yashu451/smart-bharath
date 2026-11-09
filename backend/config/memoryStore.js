// Shared in-memory resilience store for offline/reconnecting conditions
const memoryUsers = [];
const memoryActivities = [];
const memoryDocuments = [];
const memoryChat = [];
const memoryGrievances = [];

module.exports = {
  memoryUsers,
  memoryActivities,
  memoryDocuments,
  memoryChat,
  memoryGrievances,
};
