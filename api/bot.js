const TelegramBot = require('node-telegram-bot-api');

// Use the environment variable for the bot token
const token = process.env.BOT_TOKEN;  // BOT_TOKEN is set in Vercel

// Create the bot
const bot = new TelegramBot(token, { polling: true });

// Channel ID to check if the user has joined
const channelId = -1001998495788;  // Replace with your actual channel ID

// Handle '/start' command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  // Send message with "Join" and "Check" buttons
  await bot.sendMessage(chatId, 'Welcome! Please check if you have joined the channel:', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Join Channel', url: 'https://t.me/neprosz' },
          { text: 'Check', callback_data: 'check' }
        ]
      ]
    }
  });
});

// Handle inline button presses (callback queries)
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data; // Get the callback data ('check' button press)

  // Handle "Check" button press
  if (data === 'check') {
    try {
      // Get chat member info to check if the user is in the channel
      const userInChannel = await bot.getChatMember(channelId, chatId);

      // Check if the user is a member of the channel
      if (userInChannel.status === 'member' || userInChannel.status === 'administrator') {
        await bot.sendMessage(chatId, '✅ You have successfully joined the channel!');
        
        // Send message with web_app button to open the mini app
        await bot.sendMessage(chatId, '⭐ Click the button below to start watching IPL streaming!', {
          reply_markup: {
            inline_keyboard: [
              [
                { 
                  text: 'Watch IPL Live Now', 
                  web_app: { 
                    url: 'https://susu.liveipl.me/'  // Replace with your mini app URL
                  }
                }
              ]
            ]
          }
        });
      } else {
        await bot.sendMessage(chatId, '❌ You need to join the channel first.');
      }
    } catch (error) {
      console.error('Error while checking channel membership:', error);
      await bot.sendMessage(chatId, '❌ Something went wrong, please try again later.');
    }
  }
});
