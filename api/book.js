const axios = require('axios');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, userId, userName, service, master, date, time, price, status, message: customMessage } = req.body;
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
  const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

  // ОБРАБОТКА ИЗМЕНЕНИЯ СТАТУСА (Уведомление клиента)
  if (action === 'update_status') {
    try {
      const statusText = {
        'process': 'В РАБОТЕ ⏳',
        'done': 'ЗАВЕРШЕН ✅',
        'rejected': 'ОТКЛОНЕН ❌'
      };

      const notificationText = `🔔 *Обновление статуса вашего заказа!*\n\n📅 Дата: ${customMessage ? '' : date}\n📌 Статус: *${statusText[status] || status}*\n\n${customMessage || 'Мастер скоро свяжется с вами.'}`;

      await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        chat_id: userId,
        text: notificationText,
        parse_mode: 'Markdown'
      });

      return res.status(200).json({ success: true, notified: true });
    } catch (error) {
      console.error('Notification Error:', error);
      return res.status(500).json({ error: 'Failed to notify user' });
    }
  }

  // ОБРАБОТКА НОВОГО ЗАКАЗА
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
    // Отправляем админу в Telegram
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
    console.error('Booking Error:', error);
    return res.status(500).json({ error: 'Failed to process booking' });
  }
}
