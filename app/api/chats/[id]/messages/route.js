// Insert message into chat room
import db from '@/lib/db';

export async function POST(req, { params }) {
  const { id } = await params;
  const { text, status } = await req.json();
  db.prepare('INSERT INTO messages (chatId, text, status) VALUES (?, ?, ?)').run(id, text, status);

  const updatedChat = db.prepare('SELECT * FROM chats WHERE id = ?').get(id);
  const messages = db.prepare('SELECT * FROM messages WHERE chatId = ?').all(id);

  return new Response(JSON.stringify({ ...updatedChat, messages }), { status: 201 });
}
