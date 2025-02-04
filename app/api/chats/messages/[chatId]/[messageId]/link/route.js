import db from '@/lib/db';

export async function POST(req, { params }) {
  const { chatId, messageId } = await params;

  // Create a new chatroom
  const result = db.prepare('INSERT INTO chats (name) VALUES (?)').run(`Linked Thread ${messageId}`);
  const newChatId = result.lastInsertRowid;

  // Link the message to the new chatroom
  db.prepare('UPDATE messages SET linkedChatroomId = ? WHERE id = ?').run(newChatId, messageId);

  const chats = db.prepare('SELECT * FROM chats').all();
  const chatMessages = chats.map((chat) => {
    const messages = db.prepare('SELECT * FROM messages WHERE chatId = ?').all(chat.id);
    return { ...chat, messages };
  });
  console.log("In server log");
  console.log(chatMessages);
  return new Response(JSON.stringify(chatMessages), { status: 200 });
}
