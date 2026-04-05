// go-order\app\Customer-Service\api\telegram.ts

'use server';

import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export interface SendResult {
  success: boolean;
  error?: string;
  messageId?: number;
}

export interface SubscriptionParams {
  restaurantName: string;
  whatsapp: string;
  subscriptionType: string;
  autoRefill: boolean;
  // files?: FileData[]; // تم إلغاء الملفات
}

export interface FileData {
  name: string;
  type: string;
  size: number;
  base64: string;
}

export interface UpgradeParams {
  username: string;
  restaurantName: string;
  phone: string;
  plan: string;
}

export interface AddTablesParams {
  username: string;
  restaurantName: string;
  phone: string;
  tableCount: number;
}

export interface PasswordTicketParams {
  restaurantName: string;
  username: string;
  phone: string;
  requestType: 'ticket' | 'change';
  oldPassword?: string;
  newPassword?: string;
}

/**
 * إرسال رسالة إلى تلغرام
 */
async function sendTelegramMessage(message: string, chatId?: string): Promise<SendResult> {
  try {
    const token = process.env.TOKEN_API_TELEGRAM;
    if (!token) {
      throw new Error('Telegram token is not configured');
    }

    const targetChatId = chatId || process.env.CHAT_ID || '-1003830080073';

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.description || 'Failed to send message');
    }

    return {
      success: true,
      messageId: data.result?.message_id,
    };
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * إنشاء رابط واتساب
 */
function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * إرسال طلب اشتراك جديد (بدون ملفات)
 */
export async function sendSubscriptionRequest(params: SubscriptionParams): Promise<SendResult> {
  try {
    const { restaurantName, whatsapp, subscriptionType, autoRefill } = params;
    
    const subscriptionName = subscriptionType === 'trial' ? 'تجربة مجانية (14 يوم)' : subscriptionType;
    
    const message = `
🏪 *طلب اشتراك جديد - GoOrder*

*اسم المطعم:* ${restaurantName}
*رقم الواتساب:* ${whatsapp}
*نوع الاشتراك:* ${subscriptionName}
*التعبئة التلقائية:* ${autoRefill ? 'نعم ✅' : 'لا ❌'}

📅 *تاريخ الطلب:* ${new Date().toLocaleString('ar-SA')}
    `;

    const whatsappMessage = `🌹 *مرحباً وسهلاً بمطعم ${restaurantName}* 🌹

لقد بلغنا رغبتكم بالحصول على خدمة *GoOrder* بنوع الاشتراك: *${subscriptionName}*

وبكل تأكيد، نتشرف بذلك ونتطلع للتعاون المستقبلي لبناء خدمة أفضل.

*سنعمل على إرسال بيانات الخدمة ورابط التسجيل بأسرع وقت ممكن.*

✨ يتوفر لدينا خدمة إضافية مجانية للعملاء الجدد، وهي *تهيئة بيانات المطعم* (إضافة المنيو، إعداد الطاولات، تكويد المنتجات)

يرجى إخبارنا إن رغبتم بهذه الخدمة البسيطة، وسنخبركم بالبيانات اللازمة.

*شكراً لثقتكم بنا*
 *GoOrder* 

📌 في انتظار تواصلكم`;
    
    const whatsappLink = generateWhatsAppLink(whatsapp, whatsappMessage);
    
    const fullMessage = message + `\n\n*رابط التواصل:* ${whatsappLink}`;
    
    // إرسال الرسالة فقط بدون ملفات
    const messageResult = await sendTelegramMessage(fullMessage);
    
    return messageResult;
  } catch (error) {
    console.error('Error in sendSubscriptionRequest:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * إرسال طلب ترقية اشتراك
 */
export async function sendUpgradeRequest(params: UpgradeParams): Promise<SendResult> {
  try {
    const { username, restaurantName, phone, plan } = params;
    
    const planDetails: Record<string, string> = {
      normal: '• خدمة إدارة طلبات الطاولات داخل المطعم\n• 5$ + 1.5$ لكل طاولة',
      pro: '• خدمة إدارة الطلبات داخل وخارج المطعم\n• صفحات إعلانية للوجبات\n• 10$ + 1$ لكل طاولة',
      plus: '• نظام متكامل لإدارة المطعم\n• إدارة الموظفين والإحصائيات\n• 25$ + 1.5$ لكل طاولة زائدة عن 5 طاولات'
    };

    const message = `
🚀 *طلب ترقية اشتراك - GoOrder*

*نوع الترقية:* ${plan.toUpperCase()}
*Username:* ${username}
*اسم المطعم:* ${restaurantName}
*رقم التواصل:* ${phone}

*تفاصيل الباقة:*
${planDetails[plan] || planDetails.normal}

📅 *تاريخ الطلب:* ${new Date().toLocaleString('ar-SA')}
    `;

    const whatsappMessage = `اهلاً وسهلاً إدارة مطعم ${restaurantName}\nتم اعلامنا بأنكم ترغبون باشتراك ${plan.toUpperCase()} للشهر المقبل\nنتشرف بخدمتكم ونتطلع لتقديم خدمة افضل\nفي انتظار تواصلكم`;
    const whatsappLink = generateWhatsAppLink(phone, whatsappMessage);
    
    return await sendTelegramMessage(message + `\n\n*رابط التواصل:* ${whatsappLink}`);
  } catch (error) {
    console.error('Error in sendUpgradeRequest:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * إرسال طلب إضافة طاولات
 */
export async function addTablesRequest(params: AddTablesParams): Promise<SendResult> {
  try {
    const { username, restaurantName, phone, tableCount } = params;
    
    const whatsappMessage = `اهلاً وسهلاً إدارة مطعم ${restaurantName}\nلقد قدمت طلباً لإضافة ${tableCount} طاولة\nسنقوم بإنشاء ال QR code الخاص بالطاولات المحددة وارسالها لكم في اسرع وقت\nنتشرف بخدمتكم`;
    const whatsappLink = generateWhatsAppLink(phone, whatsappMessage);
    
    const message = `
➕ *طلب إضافة طاولات - GoOrder*

*Username:* ${username}
*اسم المطعم:* ${restaurantName}
*عدد الطاولات الجديدة:* ${tableCount}

*رابط التواصل:* 
${whatsappLink}

📅 *تاريخ الطلب:* ${new Date().toLocaleString('ar-SA')}
    `;

    return await sendTelegramMessage(message);
  } catch (error) {
    console.error('Error in addTablesRequest:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * إرسال تذكرة كلمة المرور
 */
export async function passwordTicketRequest(params: PasswordTicketParams): Promise<SendResult> {
  try {
    const { restaurantName, username, phone, requestType, oldPassword, newPassword } = params;
    
    const isChangePassword = requestType === 'change';
    
    const message = isChangePassword 
      ? `
🔐 *طلب تغيير كلمة المرور - GoOrder*

*اسم المطعم:* ${restaurantName}
*Username:* ${username}
*رقم التواصل:* ${phone}
*كلمة المرور السابقة:* ${oldPassword || 'غير مدخلة'}
*كلمة المرور الجديدة:* ${newPassword || 'غير مدخلة'}

📅 *تاريخ الطلب:* ${new Date().toLocaleString('ar-SA')}
      `
      : `
🎫 *تذكرة كلمة المرور - GoOrder*

*اسم المطعم:* ${restaurantName}
*Username:* ${username}
*رقم التواصل:* ${phone}

📅 *تاريخ الطلب:* ${new Date().toLocaleString('ar-SA')}
      `;

    const whatsappMessage = isChangePassword
      ? `مرحباً! مطعم ${restaurantName}\n\nلقد أبلغتنا خدمة العملاء بأنك ترغب في تغيير كلمة المرور الخاصة بالخدمة.\nسيتم مراجعة البيانات وتغيير كلمة المرور وإرسالها في أسرع وقت ممكن.\n\nنتشرف بخدمتكم\nمع أطيب تحيات\nGoOrder\n`
      : `مرحباً! مطعم ${restaurantName}\n\nلقد أبلغتنا خدمة العملاء بأنك نسيت كلمة المرور الخاصة بالخدمة.\nسيتم مراجعة البيانات وإيجاد كلمة المرور الخاصة بك وإرسالها في أسرع وقت ممكن.\n\nنتشرف بخدمتكم\nمع أطيب تحيات\nGoOrder\n`;
    
    const whatsappLink = generateWhatsAppLink(phone, whatsappMessage);
    
    return await sendTelegramMessage(message + `\n\n*رابط التواصل:* ${whatsappLink}`);
  } catch (error) {
    console.error('Error in passwordTicketRequest:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}