// Changing the name of chat rooms.
import db from '@/lib/db';

export async function PATCH(req, { params }) {
  const { id } = await params;
  const { priority, name } = await req.json();
  if (priority !== undefined) {
    db.prepare('UPDATE chats SET priority = ? WHERE id = ?').run(priority, id);
  }
  if (name !== undefined) {
    db.prepare('UPDATE chats SET name = ? WHERE id = ?').run(name, id);
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

export async function DELETE(req, { params }) {
  const { id } = await params;

  /// Delete all messages in the chatroom
  db.prepare('DELETE FROM messages WHERE chatId = ?').run(id);

  // Delete the chatroom itself
  db.prepare('DELETE FROM chats WHERE id = ?').run(id);

  return new Response(JSON.stringify({ message: 'Chatroom deleted successfully' }), { status: 200 });
}