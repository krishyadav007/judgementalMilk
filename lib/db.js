import Database from 'better-sqlite3';

const db = new Database('database.sqlite');

db.exec(`
  CREATE TABLE IF NOT EXISTS chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    priority TEXT DEFAULT 'Normal',
    name TEXT DEFAULT 'Enterhere'
  );
    CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chatId INTEGER NOT NULL,
    text TEXT NOT NULL,
    endDate DATE,
    status TEXT DEFAULT 'Idle',
    createdDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEditedDate TIMESTAMP DEFAULT NULL,
    linkedChatroomId INTEGER DEFAULT NULL,
    FOREIGN KEY (chatId) REFERENCES chats (id)
    );
`);

export default db;