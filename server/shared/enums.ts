export enum SOCKET_EVENTS {
  JOIN_QUE = "JOIN_QUE",
  UPDATE_ROOM = "UPDATE_ROOM",
  WORD_COMPLETED = "WORD_COMPLETED",
  UPDATE_TIME_TO_START = "UPDATE_TIME_TO_START",
  START_MATCH = "START_MATCH",
  LEAVE_ROOM = "LEAVE_ROOM",
}
export enum ROOM_STATES {
  WAITING,
  STARTED,
}