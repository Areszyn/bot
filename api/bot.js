const TelegramBot = require('node-telegram-bot-api');

// Use the environment variable for the bot token
const token = process.env.BOT_TOKEN; // BOT_TOKEN is set in Vercel

// Create the bot
const bot = new TelegramBot(token, { polling: true });

// Channel ID to check if the user has joined
const channelId = -1001998495788;  // Replace with your actual channel ID

// Handle '/start' command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  // Send a welcoming message with an attractive inline keyboard
  await bot.sendMessage(chatId, '🌟 **Welcome to our IPL Watch Party Bot!** 🌟\n\n' +
    'Here, you can get access to live IPL streams, but first, let’s ensure you are part of our exclusive channel.\n' +
    'Please press the button below to join the channel, then use the **Check** button to proceed! 😊', {
    parse_mode: 'Markdown',  // Enable Markdown for formatting
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🚀 Join the Channel', url: 'https://t.me/neprosz' },
          { text: '✅ Check my Status', callback_data: 'check' }
        ]
      ]
    }
  });
});

// Handle inline button presses (callback queries)
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id; // Get message ID
  const data = callbackQuery.data; // Get the callback data ('check' button press)

  // Handle "Check" button press
  if (data === 'check') {
    try {
      // Get chat member info to check if the user is in the channel
      const userInChannel = await bot.getChatMember(channelId, chatId);

      // Check if the user is a member of the channel
      if (userInChannel.status === 'member' || userInChannel.status === 'administrator') {
        await bot.sendMessage(chatId, '✅ *You have successfully joined the channel!*\n\n' +
          'Now, you can enjoy the IPL live stream by clicking the button below. 🎥🎉', {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { 
                  text: '👉 Watch IPL Live Now', 
                  web_app: { 
                    url: 'https://susu.liveipl.me/'  // Replace with your mini app URL
                  }
                }
              ]
            ]
          }
        });
      } else {
        await bot.sendMessage(chatId, '❌ *You need to join the channel first!* 😞\n\n' +
          'Please click the "Join the Channel" button to gain access.', {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🚀 Join the Channel', url: 'https://t.me/neprosz' }
              ]
            ]
          }
        });
      }

      // Delete the original "Check" message after processing
      await bot.deleteMessage(chatId, messageId);

    } catch (error) {
      console.error('Error while checking channel membership:', error);
      await bot.sendMessage(chatId, '❌ *Something went wrong, please try again later!* 😓', {
        parse_mode: 'Markdown'
      });
    }
  }
});

// Exporting the handler for Vercel (Serverless Function)
module.exports = (req, res) => {
  // Here we handle the incoming request and pass it to the bot
  bot.processUpdate(req.body); // Process the update for the bot
  res.status(200).send('OK');  // Respond to Vercel that the function has successfully processed the request
};
