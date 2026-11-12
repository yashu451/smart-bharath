// Persistent store bridge
const persistentStore = require('./persistentStore');

module.exports = {
  memoryUsers: persistentStore.store.users,
  memoryActivities: persistentStore.store.activities,
  memoryDocuments: persistentStore.store.documents,
  memoryChat: persistentStore.store.chat,
  memoryGrievances: persistentStore.store.grievances,
  memorySavedSchemes: persistentStore.store.saved_schemes,
  memoryAppointments: persistentStore.store.appointments,
  persistentStore,
  saveToDisk: persistentStore.saveToDisk,
};
