// Vercel Serverless function
export default async function handler(req, res) {
  const body = req.body;

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

  if (body.message || body.callback_query) {
    const chatId = body.message?.chat.id || body.callback_query?.message.chat.id;
    const userId = body.message?.from.id || body.callback_query?.from.id;
    const data = body.callback_query?.data;

    if (body.message?.text === '/start') {
      // Send Join & Check buttons
      await fetch(`${API_URL}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🚀 Welcome!\n\n👉 Please join our channel to continue.`,
          reply_markup: {
            inline_keyboard: [
              [{ text: '🔗 Join Channel', url: 'https://t.me/neprosz' }],
              [{ text: '✅ Check', callback_data: 'check' }]
            ]
          }
        })
      });
    }

    if (data === 'check') {
      // Check if user joined
      const memberStatus = await fetch(`${API_URL}/getChatMember?chat_id=-1001998495788&user_id=${userId}`)
        .then(res => res.json());

      const status = memberStatus.result?.status;

      if (status === 'member' || status === 'administrator' || status === 'creator') {
        // User joined, send non-copyable mini app button
        await fetch(`${API_URL}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `✅ You have successfully joined!\n\n⭐ Click the button below to start watching IPL streaming!`,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '⭐ Watch IPL',
                    web_app: {
                      url: 'https://t.me/lifegrambot/Live'
                    }
                  }
                ]
              ]
            }
          })
        });
      } else {
        // User not joined yet
        await fetch(`${API_URL}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: body.callback_query.id,
            text: "❗ You haven't joined yet. Please join and then press Check.",
            show_alert: true
          })
        });
      }
    }
  }

  res.status(200).send('OK');
}
