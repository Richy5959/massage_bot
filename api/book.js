const axios = require('axios');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userName, service, master, date, time, price, userId } = req.body;

  // 1. Отправка в Google Таблицу (замените URL на ваш из Шага 1)
  const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

  // 2. Настройки Telegram
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

  const message = `
🔔 *Новая запись на массаж!*
👤 Клиент: ${userName}
💆‍♂️ Услуга: ${service}
👨‍🏫 Мастер: ${master}
📅 Дата: ${date}
⏰ Время: ${time}
💰 Цена: ${price}
🆔 ID клиента: ${userId}
  `;

  try {
    // Отправляем в Telegram
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: ADMIN_CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    });

    // Отправляем в Google Таблицы
    if (GOOGLE_SCRIPT_URL) {
      await axios.post(GOOGLE_SCRIPT_URL, req.body);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Failed to process booking' });
  }
}
