import db from '@/lib/db';

export async function PATCH(req, { params }) {
  const { chatId, messageId } = await params;
  const { text, endDate, status } = await req.json();
  console.log(text, endDate, status);
  // Update the message in the database
  db.prepare(
    'UPDATE messages SET text = ?, endDate = ?, status = ? WHERE id = ? AND chatId = ?'
  ).run(text, endDate, status, messageId, chatId);

  // Retrieve the updated chat data
  const updatedMessages = db.prepare(
    'SELECT * FROM messages WHERE chatId = ?'
  ).all(chatId);

  const updatedChat = db.prepare('SELECT * FROM chats WHERE id = ?').get(chatId);
  updatedChat.messages = updatedMessages;

  return new Response(JSON.stringify(updatedChat), { status: 200 });
}

export async function DELETE(req, { params }) {
  const { chatId, messageId } = await params;

  db.prepare('DELETE FROM messages WHERE id = ? AND chatId = ?').run(messageId, chatId);

    // Retrieve the updated chat data
    const updatedMessages = db.prepare(
      'SELECT * FROM messages WHERE chatId = ?'
    ).all(chatId);
  
    const updatedChat = db.prepare('SELECT * FROM chats WHERE id = ?').get(chatId);
    updatedChat.messages = updatedMessages;
    return new Response(JSON.stringify(updatedChat), { status: 200 });
  }