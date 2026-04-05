// go-order\app\Customer-Service\api\utils.ts

/**
 * التحقق من صحة رقم الهاتف
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
}

/**
 * تنسيق رقم الهاتف للواتساب
 */
export function formatPhoneForWhatsApp(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * إنشاء رابط واتساب
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = formatPhoneForWhatsApp(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * التحقق من حجم الملف (حد أقصى 20 ميجابايت)
 */
export function isValidFileSize(file: File, maxSizeMB: number = 20): boolean {
  return file.size <= maxSizeMB * 1024 * 1024;
}

/**
 * التحقق من نوع الملف المسموح
 */
export function isValidFileType(file: File): boolean {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'image/jpg'
  ];
  return allowedTypes.includes(file.type);
}

/**
 * تأخير التنفيذ (للمحاكاة أو الانتظار)
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * ضغط الصورة قبل الرفع (اختياري)
 */
export async function compressImage(file: File, maxWidth: number = 1920): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        }, 'image/jpeg', 0.8);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}