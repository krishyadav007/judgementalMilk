// Show all chatrooms and create new chat rooms;
import db from '@/lib/db';

export async function GET() {
  const chats = db.prepare('SELECT * FROM chats').all();
  const chatMessages = chats.map((chat) => {
    const messages = db.prepare('SELECT * FROM messages WHERE chatId = ?').all(chat.id);
    return { ...chat, messages };
  });
  return new Response(JSON.stringify(chatMessages), { status: 200 });
}

export async function POST() {
  const result = db.prepare('INSERT INTO chats (priority) VALUES (?)').run('Normal');
  const newChat = { id: result.lastInsertRowid, priority: 'Normal', messages: [] };
  return new Response(JSON.stringify(newChat), { status: 201 });
}