// app/[restaurantName]/dashboard/components/tabs/MainInfo.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  UtensilsCrossed, 
  Save, 
  Edit, 
  Plus, 
  PackageX,
  Clock,
  Tag,
  CheckCircle2,
  Image as ImageIcon,
  X,
  FolderPlus,
  Upload,
  Loader2,
  ShoppingBag,
  Minus,
  Trash2
} from 'lucide-react';
import { Restaurant, MenuItem, getCurrencySymbol, Currency } from '@/types';

interface MainInfoProps {
  restaurant: Restaurant;
  onUpdateRestaurant?: (data: Partial<Restaurant>) => Promise<void>;
  onAddMenuItem?: (item: Omit<MenuItem, 'id'>) => Promise<MenuItem>;
  onUpdateMenuItem?: (id: string, data: Partial<MenuItem>) => Promise<void>;
  onDeleteMenuItem?: (id: string) => Promise<void>;
  onUploadImage?: (file: File, type: 'logo' | 'menu',restaurantId?: string, menuId?: string) => Promise<string>;
}

type TabType = 'info' | 'menu';

export function MainInfo({ 
  restaurant, 
  onUpdateRestaurant, 
  onAddMenuItem, 
  onUpdateMenuItem,
  onDeleteMenuItem,
  onUploadImage
}: MainInfoProps) {
  // استرجاع التبويب النشط من localStorage
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('activeTab') as TabType;
      return saved === 'info' || saved === 'menu' ? saved : 'info';
    }
    return 'info';
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(restaurant);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  // State لنافذة تأكيد تغيير العملة
const [showCurrencyModal, setShowCurrencyModal] = useState(false);
const [newCurrency, setNewCurrency] = useState<Currency | null>(null);

  // State للفئات
  const [categories, setCategories] = useState<string[]>(restaurant.categories || []);
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  //قائمة الوجبات لتسهيل البحث عن وجبة معينة وتعديلها
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // State للوجبات
  const [menuItems, setMenuItems] = useState<MenuItem[]>(restaurant.menu || []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);//حالة الوجبة
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    image: '',
    category: '',
    preparationTime: 30,
    isActive: true
  });

  const primaryColor = restaurant.primaryColor || '#f97316';


// منع التمرير في الخلفية عند فتح أي مودال
useEffect(() => {
  if (showAddModal || showCurrencyModal || showDeleteModal) {
    // حفظ قيمة overflow الحالية
    const originalOverflow = document.body.style.overflow;
    const scrollY = window.scrollY;
    
    // منع التمرير
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${scrollY}px`;
    
    // استرجاع التمرير عند الإغلاق
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo(0, scrollY);
    };
  }
}, [showAddModal, showCurrencyModal, showDeleteModal]);
  // حفظ التبويب النشط
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);


// حذف الوجبة
const handleDeleteMenuItem = async () => {
  if (!onDeleteMenuItem || !itemToDelete) return;
  
  setDeleting(true);
  try {
    await onDeleteMenuItem(itemToDelete.id);
    // إزالة الوجبة من القائمة المحلية
    setMenuItems(menuItems.filter(item => item.id !== itemToDelete.id));
    setShowDeleteModal(false);
    setItemToDelete(null);
    
    setSuccessMessage('تم حذف الوجبة بنجاح!');
    setShowSuccess(true);
  } catch (error) {
    console.error('خطأ في حذف الوجبة:', error);
    setSuccessMessage('حدث خطأ في حذف الوجبة');
    setShowSuccess(true);
  } finally {
    setDeleting(false);
  }
};

// فتح نافذة تأكيد الحذف
const openDeleteModal = (item: MenuItem) => {
  setItemToDelete(item);
  setShowDeleteModal(true);
};


  // رفع صورة
  const handleImageUpload = async (file: File, type: 'logo' | 'menu') => {
    if (!onUploadImage) return;
    
    setUploading(true);
    try {
      let menuId = ""
      if(type=='menu') { menuId = editingItem?.id||""}
      const imageUrl = await onUploadImage(file,type, restaurant.id,menuId);
      if (type === 'logo') {
        setFormData({ ...formData, logo: imageUrl });
      } else {
        if (editingItem) {
          setEditingItem({ ...editingItem, image: imageUrl });
        } else {
          setNewItem({ ...newItem, image: imageUrl });
        }
      }
      setSuccessMessage('تم رفع الصورة بنجاح');
      setShowSuccess(true);
    } catch (error) {
      console.error('خطأ في رفع الصورة:', error);
      setSuccessMessage('فشل رفع الصورة');
      setShowSuccess(true);
    } finally {
      setUploading(false);
    }
  };

// معالجة تغيير العملة مع التحذير
const handleCurrencyChange = (currency: Currency) => {
  if (currency === formData.currency) return;
  
  // فتح نافذة التأكيد
  setNewCurrency(currency);
  setShowCurrencyModal(true);
};

// تأكيد تغيير العملة
const confirmCurrencyChange = async () => {
  if (!newCurrency) return;
  
  // تحديث العملة محلياً فقط (دون حفظ في قاعدة البيانات)
  setFormData({ ...formData, currency: newCurrency });
  
  // إغلاق النافذة
  setShowCurrencyModal(false);
  setNewCurrency(null);
  
  // عرض رسالة توضيحية
  setSuccessMessage(`تم تغيير العملة إلى ${newCurrency === 'SYP' ? 'ليرة سورية' : newCurrency === 'TRY' ? 'ليرة تركية' : 'دولار أمريكي'}. لا تنس تحديث أسعار الوجبات!`);
  setShowSuccess(true);
};


  // إضافة فئة جديدة
  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updatedCategories = [...categories, newCategory.trim()];
      setCategories(updatedCategories);
      setFormData({ ...formData, categories: updatedCategories });
      setNewCategory('');
      setShowCategoryInput(false);
    }
  };

  // حذف فئة
  const handleDeleteCategory = (categoryToDelete: string) => {
    const updatedCategories = categories.filter(c => c !== categoryToDelete);
    setCategories(updatedCategories);
    setFormData({ ...formData, categories: updatedCategories });
    
    const updatedMenu = menuItems.map(item => 
      item.category === categoryToDelete ? { ...item, category: '' } : item
    );
    setMenuItems(updatedMenu);
  };

// حفظ معلومات المطعم
const handleSave = async () => {
  if (!onUpdateRestaurant) return;
  
  setSaving(true);
  try {
    await onUpdateRestaurant({
      ...formData,
      categories: categories
    });
    setSuccessMessage('تم حفظ البيانات بنجاح!');
    setShowSuccess(true);
    setIsEditing(false);
    
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  } catch (error) {
    console.error('خطأ:', error);
    setSuccessMessage('حدث خطأ في حفظ البيانات');
    setShowSuccess(true);
  } finally {
    setSaving(false);
  }
};

  // فتح تعديل الوجبة
  const handleEditMenuItem = (item: MenuItem) => {
    setEditingItem(item);
    setShowAddModal(true);
  };
const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
// إضافة وجبة جديدة
const handleAddMenuItem = async () => {
  // التحقق من الحقول المطلوبة
  const errors: Record<string, boolean> = {};
  
  if (!newItem.name || newItem.name.trim() === '') {
    errors.name = true;
  }
  if (!newItem.description || newItem.description.trim() === '') {
    errors.description = true;
  }
  if (!newItem.price || newItem.price <= 0) {
    errors.price = true;
  }
  if (!newItem.category || newItem.category.trim() === '') {
    errors.category = true;
  }
  if (!newItem.preparationTime || newItem.preparationTime <= 0) {
    errors.preparationTime = true;
  }
  
  // إذا كان هناك أخطاء، عرضها وإيقاف الإرسال
  if (Object.keys(errors).length > 0) {
    setFieldErrors(errors);
    setSuccessMessage('يرجى ملء جميع الحقول المطلوبة');
    setShowSuccess(true);
    return;
  }
  
  if (!onAddMenuItem) return;
  
  setSubmitting(true);
  
  try {
    const added = await onAddMenuItem(newItem as Omit<MenuItem, 'id'>);
    setMenuItems([...menuItems, added]);
    setShowAddModal(false);
    setFieldErrors({});
    
    setNewItem({
      name: '',
      description: '',
      price: 0,
      image: '',
      category: '',
      preparationTime: 30,
      isActive: true
    });
    
    setSuccessMessage('تم إضافة الوجبة بنجاح!');
    setShowSuccess(true);
  } catch (error) {
    console.error('خطأ:', error);
    setSuccessMessage('حدث خطأ في إضافة الوجبة');
    setShowSuccess(true);
  } finally {
    setSubmitting(false);
  }
};

// تحديث الوجبة
const handleUpdateMenuItem = async () => {
  if (!editingItem) return;
  
  // التحقق من الحقول المطلوبة
  const errors: Record<string, boolean> = {};
  
  if (!editingItem.name || editingItem.name.trim() === '') {
    errors.name = true;
  }
  if (!editingItem.description || editingItem.description.trim() === '') {
    errors.description = true;
  }
  if (!editingItem.price || editingItem.price <= 0) {
    errors.price = true;
  }
  if (!editingItem.category || editingItem.category.trim() === '') {
    errors.category = true;
  }
  if (!editingItem.preparationTime || editingItem.preparationTime <= 0) {
    errors.preparationTime = true;
  }
  
  // إذا كان هناك أخطاء، عرضها وإيقاف الإرسال
  if (Object.keys(errors).length > 0) {
    setFieldErrors(errors);
    setSuccessMessage('يرجى ملء جميع الحقول المطلوبة');
    setShowSuccess(true);
    return;
  }
  
  if (!onUpdateMenuItem) return;
  
  setSubmitting(true);
  
  try {
    await onUpdateMenuItem(editingItem.id, editingItem);
    setMenuItems(menuItems.map(item => 
      item.id === editingItem.id ? editingItem : item
    ));
    setEditingItem(null);
    setShowAddModal(false);
    setFieldErrors({});
    
    setSuccessMessage('تم تحديث الوجبة بنجاح!');
    setShowSuccess(true);
  } catch (error) {
    console.error('خطأ:', error);
    setSuccessMessage('حدث خطأ في تحديث الوجبة');
    setShowSuccess(true);
  } finally {
    setSubmitting(false);
  }
};

  // نفاذ الكمية
const handleOutOfStock = async (id: string) => {
  if (!onUpdateMenuItem) return;
  
  setLoadingItemId(id); // ✅ بدء التحميل
  try {
    await onUpdateMenuItem(id, { isActive: false });
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, isActive: false } : item
    ));
    setSuccessMessage('تم تحديث حالة الوجبة');
    setShowSuccess(true);
  } catch (error) {
    console.error('خطأ:', error);
    setSuccessMessage('حدث خطأ');
    setShowSuccess(true);
  } finally {
    setLoadingItemId(null); // ✅ إنهاء التحميل
  }
};

  // تفعيل الوجبة
const handleActivateItem = async (id: string) => {
  if (!onUpdateMenuItem) return;
  
  setLoadingItemId(id); // ✅ بدء التحميل
  try {
    await onUpdateMenuItem(id, { isActive: true });
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, isActive: true } : item
    ));
    setSuccessMessage('تم تفعيل الوجبة');
    setShowSuccess(true);
  } catch (error) {
    console.error('خطأ:', error);
    setSuccessMessage('حدث خطأ');
    setShowSuccess(true);
  } finally {
    setLoadingItemId(null); // ✅ إنهاء التحميل
  }
};

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* رسالة النجاح */}
<AnimatePresence>
  {showSuccess && (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-24 left-0 right-0 z-50 flex justify-center px-4"
    >
      <div className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-full shadow-lg max-w-[90vw]">
        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-medium text-center break-words">
          {successMessage}
        </span>
      </div>
    </motion.div>
  )}
</AnimatePresence>

      {/* التبويبات */}
      <div className="flex justify-center mb-2">
        <div className="bg-gray-100 rounded-2xl p-1 inline-flex gap-1">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'info' 
                ? 'text-white shadow-lg' 
                : 'text-gray-700 hover:text-gray-900'
            }`}
            style={activeTab === 'info' ? { backgroundColor: primaryColor } : {}}
          >
            <Building2 className="w-4 h-4" />
            معلومات المطعم
          </button>
          
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'menu' 
                ? 'text-white shadow-lg' 
                : 'text-gray-700 hover:text-gray-900'
            }`}
            style={activeTab === 'menu' ? { backgroundColor: primaryColor } : {}}
          >
            <UtensilsCrossed className="w-4 h-4" />
            قائمة الوجبات
          </button>
        </div>
      </div>

      {/* محتوى التبويبات */}
      <AnimatePresence mode="wait">
        {activeTab === 'info' ? (
          <motion.div
            key="info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* رأس الصفحة */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">بيانات المطعم</h2>
                <p className="text-gray-500 text-sm mt-1">إدارة معلومات مطعمك الأساسية</p>
              </div>
              <button
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                disabled={saving}
                className="px-5 py-2 rounded-xl font-medium text-white transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : isEditing ? (
                  <>
                    <Save className="w-4 h-4" />
                    حفظ التغييرات
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4" />
                    تعديل
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* العمود الأيمن */}
              <div className="space-y-5">
                {/* الشعار */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">شعار المطعم</label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {formData.logo ? (
                          // تم تعديل الكلاسز هنا لتطابق الإطار الثاني
                          <div 
                            className="relative w-20 h-20 md:w-24 md:h-24 bg-white rounded-full shadow-2xl overflow-hidden flex items-center justify-center p-2"
                            style={{ boxShadow: `0 0 20px ${primaryColor}` }}
                          >
                            <img 
                              src={formData.logo} 
                              alt={formData.name} 
                              className="w-full h-full object-contain" // تم تغيير object-cover إلى object-contain
                            />
                          </div>
                        ) : (
                          // حالة عدم وجود صورة (الاحرف الأولى) - تم تعديلها أيضاً لتكون دائرية
                          <div 
                            className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-2xl"
                            style={{ backgroundColor: primaryColor, boxShadow: `0 0 20px ${primaryColor}` }}
                          >
                            {formData.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      {isEditing && (
                        <label className="cursor-pointer">
                          <div className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-green-200 rounded-lg transition-colors flex items-center gap-2 block text-sm font-semibold text-gray-900 mb-3">
                            <Upload className="w-3.5 h-3.5" />
                            {uploading ? 'جاري الرفع...' : 'تغيير الشعار'}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file, 'logo');
                            }}
                          />
                        </label>
                      )}
                    </div>
                </div>

                {/* اسم المطعم */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">اسم المطعم</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                      style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    />
                  ) : (
                    <p className="text-gray-900">{formData.name}</p>
                  )}
                </div>

                {/* رقم الهاتف */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">رقم الهاتف</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                      style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    />
                  ) : (
                    <p className="text-gray-900">{formData.phone || 'غير مضاف'}</p>
                  )}
                </div>

                {/* العنوان */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">العنوان</label>
                  {isEditing ? (
                    <textarea
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                      style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    />
                  ) : (
                    <p className="text-gray-900">{formData.address || 'غير مضاف'}</p>
                  )}
                </div>
              </div>

              {/* العمود الأيسر */}
              <div className="space-y-5">
                {/* العملة */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">العملة</label>
                  {isEditing ? (
                    <select
                      value={formData.currency}
                      onChange={(e) => handleCurrencyChange(e.target.value as Currency)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                      style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    >
                      <option value="SYP">ليرة سورية (ل.س)</option>
                      <option value="TRY">ليرة تركية (₺)</option>
                      <option value="USD">دولار أمريكي ($)</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                        {getCurrencySymbol(formData.currency)}
                      </span>
                      <span className="text-gray-600">
                        {formData.currency === 'SYP' ? 'ليرة سورية' : formData.currency === 'TRY' ? 'ليرة تركية' : 'دولار أمريكي'}
                      </span>
                    </div>
                  )}
                </div>

                {/* رسوم الخدمة */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">رسوم الخدمة</label>
                  {isEditing ? (
                <input
                  type="text"
                  inputMode="decimal"
                  value={formData.serviceFee}
                  onChange={(e) => {
                    let value = e.target.value;
                    value = value.replace(/[^0-9.]/g, '');
                    const parts = value.split('.');
                    if (parts.length > 2) {
                      value = parts[0] + '.' + parts.slice(1).join('');
                    }
                    setFormData({ ...formData, serviceFee: value as any }); // as any هنا
                  }}
                  onBlur={() => {
                    let value = formData.serviceFee.toString();
                    let num = parseFloat(value);
                    if (isNaN(num)) num = 0;
                    if (num < 0) num = 0;
                    setFormData({ ...formData, serviceFee: num });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                  placeholder="مثال: 2.5"
                />
                  ) : (
                    <p className="text-gray-900">{formData.serviceFee} {formData.currency === 'SYP' ? 'ليرة سورية' : formData.currency === 'TRY' ? 'ليرة تركية' : 'دولار أمريكي'}</p>
                  )}
                </div>

                {/* اللون الأساسي */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">اللون الأساسي</label>
                  {isEditing ? (
                    <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">يجب عدم اختيار الوان كاشفة او داكنة( ابيض اسود فضي ...) لانها تتعارض مع الوان خطوط الكتابة </label>
                    <input
                      type="color"
                      value={formData.primaryColor || '#f97316'}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg border" style={{ backgroundColor: formData.primaryColor }} />
                      <span className="text-gray-600 font-mono text-sm">{formData.primaryColor}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* قسم الفئات */}
            <div className="mt-8 bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900">فئات الوجبات</label>
                  <p className="text-xs text-gray-500 mt-0.5">أضف فئات لتنظيم وجباتك</p>
                </div>
                {isEditing && (
                  <button
                    onClick={() => setShowCategoryInput(true)}
                    className="px-4 py-2 text-sm rounded-lg flex items-center gap-2 font-medium transition-all duration-200 hover:shadow-md active:scale-95"
                    style={{ 
                      backgroundColor: primaryColor,
                      color: 'white'
                    }}
                  >
                    <FolderPlus className="w-4 h-4" />
                    إضافة فئة جديدة
                  </button>
                )}
              </div>

              {showCategoryInput && isEditing && (
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="اسم الفئة..."
                    className="w-full sm:flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddCategory}
                      className="flex-1 sm:flex-none px-4 py-2 text-white rounded-lg"
                      style={{ backgroundColor: primaryColor }}
                    >
                      إضافة
                    </button>
                    <button
                      onClick={() => {
                        setShowCategoryInput(false);
                        setNewCategory('');
                      }}
                      className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <div
                    key={category}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg"
                  >
                    <Tag className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-sm text-gray-700">{category}</span>
                    {isEditing && (
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="text-sm text-gray-400">لا توجد فئات مضاف بعد</p>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* رأس صفحة الوجبات */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">قائمة الوجبات</h2>
                <p className="text-gray-500 text-sm mt-1">إضافة وتعديل وجبات مطعمك</p>
              </div>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setFieldErrors({});
                  setShowAddModal(true);
                }}
                className="px-5 py-2 rounded-xl font-medium text-white transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                <Plus className="w-4 h-4" />
                إضافة وجبة
              </button>
            </div>

            {/* قائمة الوجبات */}
            {/* قائمة الوجبات */}
{menuItems.length === 0 ? (
  <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
    <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <p className="text-gray-500">لا توجد وجبات بعد</p>
    <button
      onClick={() => setShowAddModal(true)}
      className="mt-4 px-5 py-2 rounded-lg text-white"
      style={{ backgroundColor: primaryColor }}
    >
      أضف أول وجبة
    </button>
  </div>
) : (
  <div className="w-full">
    {/* ========== قسم الفلاتر في الأعلى ========== */}
    <div className="mb-8 w-full">
      {/* عنوان القسم */}
      <div className="flex items-center justify-between mb-4">
        {selectedCategory !== 'all' && (
          <button
            onClick={() => setSelectedCategory('all')}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            إلغاء التصفية
          </button>
        )}
      </div>

      {/* أزرار التصنيفات */}
      <div className="flex flex-wrap gap-2">
        {/* زر الكل */}
        <button
          onClick={() => setSelectedCategory('all')}
          className={`
            px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
            ${selectedCategory === 'all' 
              ? 'text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
          style={selectedCategory === 'all' ? { backgroundColor: primaryColor } : {}}
        >
          <div className="flex items-center gap-2">
            <span>جميع الوجبات</span>
            <span className={`
              px-1.5 py-0.5 rounded-full text-xs font-medium
              ${selectedCategory === 'all' ? 'bg-white/20' : 'bg-gray-200 text-gray-600'}
            `}>
              {menuItems.length}
            </span>
          </div>
        </button>
        
        {/* أزرار التصنيفات */}
        {categories.map((category) => {
          const count = menuItems.filter(item => item.category === category).length;
          if (count === 0) return null;
          
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${selectedCategory === category 
                  ? 'text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
              style={selectedCategory === category ? { backgroundColor: primaryColor } : {}}
            >
              <div className="flex items-center gap-2">
                <span>{category}</span>
                <span className={`
                  px-0.5 py-0.2 rounded-full text-xs font-medium
                  ${selectedCategory === category ? 'bg-white/20' : 'bg-gray-200 text-gray-600'}
                `}>
                  {count}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* رسالة عدم وجود وجبات في التصنيف */}
      {menuItems.filter(item => selectedCategory === 'all' || item.category === selectedCategory).length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl mt-6 border border-gray-100">
          <PackageX className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">لا توجد وجبات في هذا التصنيف</p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="mt-3 text-sm hover:underline"
            style={{ color: primaryColor }}
          >
            عرض جميع الوجبات
          </button>
        </div>
      )}
    </div>

    {/* ========== قسم الوجبات في الأسفل - 3 في كل صف ========== */}
    {menuItems.filter(item => selectedCategory === 'all' || item.category === selectedCategory).length > 0 && (
      <>
        {/* شبكة الوجبات - متمركزة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
          {menuItems
            .filter(item => selectedCategory === 'all' || item.category === selectedCategory)
            .map((item) => (
              <div
                key={item.id}
                className={`group bg-white rounded-xl border overflow-hidden transition-all duration-300 w-full ${
                  !item.isActive ? 'opacity-60' : 'hover:shadow-lg hover:-translate-y-1'
                }`}
              >
                {/* صورة الوجبة */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  {!item.isActive && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">غير متوفرة</span>
                    </div>
                  )}
                  {/* السعر على الصورة */}
                  <div 
                    className="absolute bottom-2 right-2 px-2 py-1 rounded-lg text-white text-sm font-bold shadow-lg"
                    style={{ backgroundColor: `${primaryColor}cc` }}
                  >
                    {getCurrencySymbol(restaurant.currency)} {item.price}
                  </div>
                </div>

                {/* معلومات الوجبة */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 line-clamp-1 text-base">{item.name}</h3>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[40px]">
                    {item.description || "لا يوجد وصف"}
                  </p>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                    {item.category && (
                      <span 
                        className="px-2 py-1 rounded-full text-xs"
                        style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                      >
                        {item.category}
                      </span>
                    )}
                    {item.preparationTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.preparationTime} دقيقة</span>
                      </div>
                    )}
                  </div>


                  {/* الأزرار */}
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => handleEditMenuItem(item)}
                      className="flex-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      تعديل
                    </button>
                    
                    <button
                      onClick={() => openDeleteModal(item)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center group relative"
                      title="حذف الوجبة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                    {/* الأزرار الخاصة بتغيير الحالة (نفذت/تفعيل) */}
                  <div className="flex gap-2">
                    {item.isActive ? (
                      <motion.button
                        onClick={() => handleOutOfStock(item.id)}
                        disabled={loadingItemId === item.id}
                        className="flex-1 px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-900 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileTap={loadingItemId !== item.id ? { scale: 0.95 } : {}}
                      >
                        {loadingItemId === item.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            يتم الغاء عرض الوجبة لدى الزبائن . . .
                          </>
                        ) : (
                          <>
                            <PackageX className="w-3.5 h-3.5" />
                            نفذت
                          </>
                        )}
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={() => handleActivateItem(item.id)}
                        disabled={loadingItemId === item.id}
                        className="flex-1 px-2 py-1.5 bg-green-50 hover:bg-green-100 text-green-900 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileTap={loadingItemId !== item.id ? { scale: 0.95 } : {}}
                      >
                        {loadingItemId === item.id ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            يتم تفعيل عرض الوجبة لدى الزبائن . . .
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            تفعيل
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* عداد النتائج */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            عرض {menuItems.filter(item => selectedCategory === 'all' || item.category === selectedCategory).length} من أصل {menuItems.length} وجبة
          </p>
        </div>
      </>
    )}
  </div>
)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* مودال إضافة/تعديل وجبة */}

{(showAddModal) && (
  <div 
    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onClick={(e) => {
      // إغلاق المودال عند النقر خارج المحتوى
      if (e.target === e.currentTarget) {
        setShowAddModal(false);
        setEditingItem(null);
        setFieldErrors({});
      }
    }}
  >
    {/* محتوى المودال */}
    <div 
      className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()} // ← أضف هذا
      style={{ 
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-bold text-gray-900">
            {editingItem ? 'تعديل الوجبة' : 'إضافة وجبة جديدة'}
          </h3>
          <button
            onClick={() => {
              setShowAddModal(false);
              setFieldErrors({});
              setEditingItem(null);
            }}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  {/* الجانب الأيسر: نموذج الإدخال */}
  <div className="space-y-4">
    {/* صورة الوجبة */}
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-1">صورة الوجبة</label>
      <div className="flex items-center gap-3">
        {(editingItem?.image || newItem.image) ? (
          <img 
            src={editingItem?.image || newItem.image} 
            alt="Preview" 
            className="w-16 h-16 rounded-lg object-cover border"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center border">
            <ImageIcon className="w-6 h-6 text-gray-400" />
          </div>
        )}
        <label className="cursor-pointer">
          <div className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-green-200 rounded-lg transition-colors flex items-center gap-2">
            <Upload className="w-3.5 h-3.5" />
            {uploading ? 'جاري الرفع...' : 'رفع صورة'}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file, 'menu');
            }}
          />
        </label>
      </div>
    </div>

    {/* اسم الوجبة */}
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-1">
        اسم الوجبة <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        value={editingItem ? editingItem.name : newItem.name}
        onChange={(e) => {
          const value = e.target.value;
          editingItem 
            ? setEditingItem({ ...editingItem, name: value })
            : setNewItem({ ...newItem, name: value });
          // مسح الخطأ عند الكتابة
          if (fieldErrors.name) {
            setFieldErrors({ ...fieldErrors, name: false });
          }
        }}
        className={`w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 ${
          fieldErrors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
        }`}
        style={!fieldErrors.name ? { '--tw-ring-color': primaryColor } as React.CSSProperties : {}}
      />
      {fieldErrors.name && (
        <p className="text-red-500 text-xs mt-1">هذا الحقل مطلوب</p>
      )}
    </div>

    {/* الوصف */}
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-1">
        الوصف <span className="text-red-500">*</span>
      </label>
      <textarea
        value={editingItem ? editingItem.description : newItem.description}
        onChange={(e) => {
          const value = e.target.value;
          editingItem
            ? setEditingItem({ ...editingItem, description: value })
            : setNewItem({ ...newItem, description: value });
          // مسح الخطأ عند الكتابة
          if (fieldErrors.description) {
            setFieldErrors({ ...fieldErrors, description: false });
          }
        }}
        rows={3}
        className={`w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 ${
          fieldErrors.description ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
        }`}
        style={!fieldErrors.description ? { '--tw-ring-color': primaryColor } as React.CSSProperties : {}}
      />
      {fieldErrors.description && (
        <p className="text-red-500 text-xs mt-1">هذا الحقل مطلوب</p>
      )}
    </div>
    
    {/* السعر */}
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-1">
        السعر <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        inputMode="decimal"
        value={editingItem ? editingItem.price : (newItem.price ?? '')}
        onChange={(e) => {
          let value = e.target.value;
          value = value.replace(/[^0-9.]/g, '');
          const parts = value.split('.');
          if (parts.length > 2) {
            value = parts[0] + '.' + parts.slice(1).join('');
          }
          
          if (editingItem) {
            setEditingItem({ ...editingItem, price: value as any });
          } else {
            setNewItem({ ...newItem, price: value as any });
          }
          
          // مسح الخطأ عند الكتابة
          if (fieldErrors.price) {
            setFieldErrors({ ...fieldErrors, price: false });
          }
        }}
        onBlur={() => {
          let value = editingItem 
            ? editingItem.price.toString() 
            : (newItem.price?.toString() ?? '0');
          
          let num = parseFloat(value);
          if (isNaN(num)) num = 0;
          if (num < 0) num = 0;
          
          if (editingItem) {
            setEditingItem({ ...editingItem, price: num });
          } else {
            setNewItem({ ...newItem, price: num });
          }
        }}
        className={`w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 ${
          fieldErrors.price ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
        }`}
        style={!fieldErrors.price ? { '--tw-ring-color': primaryColor } as React.CSSProperties : {}}
        placeholder="مثال: 15.5"
      />
      {fieldErrors.price && (
        <p className="text-red-500 text-xs mt-1">السعر يجب أن يكون أكبر من 0</p>
      )}
    </div>

    {/* الفئة */}
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-1">
        الفئة <span className="text-red-500">*</span>
      </label>
      <select
        value={editingItem ? editingItem.category : newItem.category}
        onChange={(e) => {
          const value = e.target.value;
          editingItem
            ? setEditingItem({ ...editingItem, category: value })
            : setNewItem({ ...newItem, category: value });
          // مسح الخطأ عند الاختيار
          if (fieldErrors.category) {
            setFieldErrors({ ...fieldErrors, category: false });
          }
        }}
        className={`w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 ${
          fieldErrors.category ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
        }`}
        style={!fieldErrors.category ? { '--tw-ring-color': primaryColor } as React.CSSProperties : {}}
      >
        <option value="">اختر الفئة</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      {fieldErrors.category && (
        <p className="text-red-500 text-xs mt-1">هذا الحقل مطلوب</p>
      )}
    </div>

    {/* وقت التحضير */}
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-1">
        وقت التحضير (دقيقة) <span className="text-red-500">*</span>
      </label>
      <input
        type="number"
        value={editingItem ? editingItem.preparationTime : newItem.preparationTime}
        onChange={(e) => {
          const value = parseInt(e.target.value) || 0;
          editingItem
            ? setEditingItem({ ...editingItem, preparationTime: value })
            : setNewItem({ ...newItem, preparationTime: value });
          // مسح الخطأ عند الكتابة
          if (fieldErrors.preparationTime) {
            setFieldErrors({ ...fieldErrors, preparationTime: false });
          }
        }}
        className={`w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 ${
          fieldErrors.preparationTime ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300'
        }`}
        style={!fieldErrors.preparationTime ? { '--tw-ring-color': primaryColor } as React.CSSProperties : {}}
      />
      {fieldErrors.preparationTime && (
        <p className="text-red-500 text-xs mt-1">وقت التحضير يجب أن يكون أكبر من 0</p>
      )}
    </div>
  </div>

          {/* الجانب الأيمن: معاينة الوجبة */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center">معاينة شكل الوجبة اللذي يظهر للعملاء</h4>
            <div className="flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col
                  max-w-full w-full md:max-w-[280px] lg:max-w-[260px] xl:max-w-[280px] mx-auto"
              >
                <div className="relative w-full overflow-hidden flex-shrink-0 
                  aspect-[4/3] md:aspect-[1/1] lg:aspect-[1/1] 
                  md:max-h-[200px] lg:max-h-[180px] xl:max-h-[200px]"
                >
                  {(editingItem?.image || newItem.image) ? (
                    <>
                      <img
                        src={editingItem?.image || newItem.image}
                        alt={editingItem?.name || newItem.name || 'الوجبة'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  
                  <div 
                    className="absolute bottom-2 right-2 px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-lg text-white font-bold text-xs sm:text-sm md:text-xs lg:text-xs"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {(editingItem?.price || newItem.price || 0)} {getCurrencySymbol(restaurant.currency)}
                  </div>
                </div>
                
                <div className="p-2 sm:p-3 md:p-2.5 lg:p-2 flex-1 flex flex-col">
                  <h3 className="text-sm sm:text-base md:text-sm lg:text-sm font-bold text-gray-800 mb-1 line-clamp-2">
                    {editingItem?.name || newItem.name || 'اسم الوجبة'}
                  </h3>
                  
                  <p className="text-gray-500 text-xs sm:text-sm md:text-xs lg:text-xs mb-1 line-clamp-2 md:line-clamp-2">
                    {editingItem?.description || newItem.description || 'وصف الوجبة'}
                  </p>
                  
                  <div className="flex-1" />
                  
                  <div className="flex items-center justify-between gap-2 mt-auto pt-1">
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 flex-shrink-0">
                      <button
                        className="p-1 sm:p-1.5 md:p-1 rounded-lg hover:bg-gray-200 transition-colors cursor-default"
                        aria-label="إنقاص الكمية"
                        disabled
                      >
                        <Minus size={12} className="text-gray-400" />
                      </button>
                      <span className="w-5 sm:w-6 md:w-5 text-center font-bold text-gray-800 text-xs sm:text-sm md:text-xs">
                        0
                      </span>
                      <button
                        className="p-1 sm:p-1.5 md:p-1 rounded-lg hover:bg-gray-200 transition-colors cursor-default"
                        aria-label="زيادة الكمية"
                        disabled
                      >
                        <Plus size={12} className="text-gray-400" />
                      </button>
                    </div>
                  </div>

                  <button
                    className="flex items-center justify-center gap-1 px-2 mt-2 py-1.5 rounded-lg text-white font-semibold transition-all duration-300 text-xs opacity-70 cursor-default"
                    style={{ backgroundColor: primaryColor }}
                    disabled
                    aria-label="إضافة إلى السلة"
                  >
                    <ShoppingBag size={12} />
                    <span className="xs:inline text-xs">أضف للطلب</span>
                  </button>
                </div>
              </motion.div>
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">* هذه معاينة توضيحية فقط</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
            {/* زر الإلغاء */}
            <button
              onClick={() => {
                setShowAddModal(false);
                setEditingItem(null);
                setFieldErrors({});
              }}
              disabled={submitting} // تعطيل أثناء التحميل
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إلغاء
            </button>
            
            {/* زر الإضافة/التحديث مع أنيميشن */}
            <motion.button
              onClick={() => editingItem ? handleUpdateMenuItem() : handleAddMenuItem()}
              disabled={submitting}
              className="flex-1 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: primaryColor }}
              // أنيميشن الضغط
              whileTap={!submitting ? { scale: 0.97 } : {}}
              // أنيميشن التمرير
              whileHover={!submitting ? { scale: 1.02 } : {}}
              // أنيميشن النبض المستمر (فقط عندما لا يكون في حالة تحميل)
              animate={!submitting ? { 
                boxShadow: [
                  `0 0 0 0 ${primaryColor}40`,
                  `0 0 0 4px ${primaryColor}30`,
                  `0 0 0 0 ${primaryColor}40`
                ]
              } : {}}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                repeatDelay: 1,
                ease: "easeInOut"
              }}
            >
              {submitting ? (
                <>
                  {/* أيقونة التحميل */}
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{editingItem ? 'جاري التحديث...' : 'جاري الإضافة...'}</span>
                </>
              ) : (
                <span>{editingItem ? 'تحديث' : 'إضافة'}</span>
              )}
            </motion.button>
          </div>
      </div>
    </div>
  </div>
)}

{/* نافذة تأكيد تغيير العملة */}
{showCurrencyModal && (
  <div 
    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
    onClick={(e) => {
      // إغلاق النافذة عند النقر خارج المحتوى
      if (e.target === e.currentTarget) {
        setShowCurrencyModal(false);
        setNewCurrency(null);
      }
    }}
  >
    <div 
      className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* رأس التنبيه */}
      <div className="bg-red-50 p-4 border-b border-red-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">تحذير: تغيير العملة</h3>
        </div>
      </div>
      
      {/* محتوى التنبيه */}
      <div className="p-6">
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            <span className="font-semibold text-red-600">تنبيه مهم:</span> تغيير العملة سيؤدي إلى عرض قائمة الوجبات للعملاء برمز العملة الجديد.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800 text-sm">
              ⚠️ <span className="font-semibold">ملاحظة:</span> سيتوجب عليك تحديث أسعار جميع الوجبات يدوياً لتتوافق مع سعر الصرف الجديد.
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
            <p>العملة الحالية: <span className="font-semibold">{formData.currency === 'SYP' ? 'ليرة سورية' : formData.currency === 'TRY' ? 'ليرة تركية' : 'دولار أمريكي'}</span></p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            <p>العملة الجديدة: <span className="font-semibold text-green-600">{newCurrency === 'SYP' ? 'ليرة سورية' : newCurrency === 'TRY' ? 'ليرة تركية' : 'دولار أمريكي'}</span></p>
          </div>
        </div>
      </div>
      
      {/* أزرار التحكم */}
      <div className="flex gap-3 p-6 pt-0">
        <button
          onClick={() => {
            setShowCurrencyModal(false);
            setNewCurrency(null);
          }}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
        >
          إلغاء
        </button>
        <button
          onClick={confirmCurrencyChange}
          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          تأكيد التغيير
        </button>
      </div>
    </div>
  </div>
)}

{/* نافذة تأكيد حذف الوجبة */}
{showDeleteModal && itemToDelete && (
  <div 
    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        setShowDeleteModal(false);
        setItemToDelete(null);
      }
    }}
  >
    <div 
      className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* رأس التنبيه */}
      <div className="bg-red-50 p-4 border-b border-red-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">تأكيد الحذف</h3>
        </div>
      </div>
      
      {/* محتوى التنبيه */}
      <div className="p-6">
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            هل أنت متأكد من حذف وجبة <span className="font-semibold text-red-600">"{itemToDelete.name}"</span>؟
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800 text-sm">
              ⚠️ <span className="font-semibold">تنبيه:</span> هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الوجبة نهائياً من القائمة.
            </p>
          </div>
        </div>
      </div>
      
      {/* أزرار التحكم */}
      <div className="flex gap-3 p-6 pt-0">
        <button
          onClick={() => {
            setShowDeleteModal(false);
            setItemToDelete(null);
          }}
          disabled={deleting}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          إلغاء
        </button>
        <button
          onClick={handleDeleteMenuItem}
          disabled={deleting}
          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deleting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري الحذف...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              تأكيد الحذف
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

// ==============================================
// 🔌 تكامل الباك إند ودالة رفع الصور
// ==============================================

/*
 * دوال API المطلوبة:
 * 
 * 1. رفع الصور:
 *    POST /api/upload
 *    Body: FormData مع ملف الصورة
 *    Returns: { url: string }
 * 
 * 2. تحديث بيانات المطعم:
 *    PATCH /api/restaurants/:id
 * 
 * 3. إضافة وجبة:
 *    POST /api/restaurants/:id/menu
 * 
 * 4. تحديث وجبة:
 *    PATCH /api/restaurants/:id/menu/:itemId
 * 
 * مثال دالة رفع الصور:
 * 
 * const handleUploadImage = async (file: File) => {
 *   const formData = new FormData();
 *   formData.append('image', file);
 *   const res = await fetch('/api/upload', { method: 'POST', body: formData });
 *   const data = await res.json();
 *   return data.url;
 * };
 */