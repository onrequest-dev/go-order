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
  Minus
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


  // منع التمرير في الخلفية عند فتح المودال
useEffect(() => {
  if (showAddModal) {
    // حفظ قيمة overflow الحالية
    const originalOverflow = document.body.style.overflow;
    // منع التمرير
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.top = `-${window.scrollY}px`;
    
    // استرجاع التمرير عند الإغلاق
    return () => {
      const scrollY = document.body.style.top;
      document.body.style.overflow = originalOverflow;
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    };
  }
}, [showAddModal]);
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

// تأكيد تغيير العملة وتحديث الأسعار
const confirmCurrencyChange = async () => {
  if (!newCurrency) return;
  
  setSaving(true);
  try {
    // تحديث عملة المطعم
    await onUpdateRestaurant?.({ currency: newCurrency });
    
    // تحديث أسعار جميع الوجبات (اختياري: يمكنك تحويل الأسعار أو تركها كما هي)
    // هنا نقوم بتحديث الـ state المحلي
    setFormData({ ...formData, currency: newCurrency });
    
    // إذا أردت تحويل الأسعار تلقائياً (مثال: من دولار إلى ليرة)
    // يمكنك إضافة منطق التحويل هنا
    
    setSuccessMessage('تم تغيير العملة بنجاح');
    setShowSuccess(true);
  } catch (error) {
    console.error('خطأ:', error);
    setSuccessMessage('حدث خطأ في تغيير العملة');
    setShowSuccess(true);
  } finally {
    setSaving(false);
    setShowCurrencyModal(false);
    setNewCurrency(null);
  }
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

  // إضافة وجبة جديدة
const handleAddMenuItem = async () => {
  // التحقق من صحة البيانات
  if (!onAddMenuItem || !newItem.name || !newItem.price) return;
  
  // تفعيل حالة التحميل وتعطيل الزر
  setSubmitting(true);
  
  try {
    const added = await onAddMenuItem(newItem as Omit<MenuItem, 'id'>);
    setMenuItems([...menuItems, added]);
    setShowAddModal(false);
    
    // إعادة تعيين النموذج
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
    // إلغاء حالة التحميل بغض النظر عن نجاح أو فشل العملية
    setSubmitting(false);
  }
};

  // تحديث الوجبة
const handleUpdateMenuItem = async () => {
  if (!onUpdateMenuItem || !editingItem) return;
  
  // تفعيل حالة التحميل
  setSubmitting(true);
  
  try {
    await onUpdateMenuItem(editingItem.id, editingItem);
    setMenuItems(menuItems.map(item => 
      item.id === editingItem.id ? editingItem : item
    ));
    setEditingItem(null);
    setShowAddModal(false);
    
    setSuccessMessage('تم تحديث الوجبة بنجاح!');
    setShowSuccess(true);
  } catch (error) {
    console.error('خطأ:', error);
    setSuccessMessage('حدث خطأ في تحديث الوجبة');
    setShowSuccess(true);
  } finally {
    // إلغاء حالة التحميل
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
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-full shadow-lg">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">{successMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* التبويبات */}
      <div className="flex justify-center mb-8">
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
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                      style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    >
                      <option value="SYP">ليرة سورية (ل.س)</option>
                      <option value="TRY">ليرة تركية (₺)</option>
                      <option value="USD">دولار أمريكي ($)</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold" style={{ color: primaryColor }}>{getCurrencySymbol(formData.currency)}</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white rounded-xl border overflow-hidden transition-all ${
                      !item.isActive ? 'opacity-60' : 'hover:shadow-lg'
                    }`}
                  >
                    <div className="relative h-40 bg-gray-100">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
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
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        <span className="text-lg font-bold" style={{ color: primaryColor }}>
                          {getCurrencySymbol(restaurant.currency)} {item.price}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                        {item.category && (
                          <span className="px-2 py-1 bg-gray-100 rounded-full">{item.category}</span>
                        )}
                        {item.preparationTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{item.preparationTime} دقيقة</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                          {item.isActive ? (
                            <motion.button
                              onClick={() => handleOutOfStock(item.id)}
                              disabled={loadingItemId === item.id}
                              className="flex-1 px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              whileTap={loadingItemId !== item.id ? { scale: 0.95 } : {}}
                            >
                              {loadingItemId === item.id ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  يتم الغاء عرض الوجبة لدى العملاء
                                </>
                              ) : (
                                <>
                                  <PackageX className="w-3.5 h-3.5" />
                                  نفذت الكمية
                                </>
                              )}
                            </motion.button>
                          ) : (
                            <motion.button
                              onClick={() => handleActivateItem(item.id)}
                              disabled={loadingItemId === item.id}
                              className="flex-1 px-2 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              whileTap={loadingItemId !== item.id ? { scale: 0.95 } : {}}
                            >
                              {loadingItemId === item.id ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  يتم تفعيل عرض الوجبة لدى العملاء
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  توفرت الكمية
                                </>
                              )}
                            </motion.button>
                          )}
                        <button
                          onClick={() => handleEditMenuItem(item)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          تعديل
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
                  <div className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-green-200 rounded-lg transition-colors flex items-center gap-2 block text-sm font-semibold text-gray-900 mb-3">
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

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">اسم الوجبة *</label>
              <input
                type="text"
                value={editingItem ? editingItem.name : newItem.name}
                onChange={(e) => editingItem 
                  ? setEditingItem({ ...editingItem, name: e.target.value })
                  : setNewItem({ ...newItem, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">الوصف</label>
              <textarea
                value={editingItem ? editingItem.description : newItem.description}
                onChange={(e) => editingItem
                  ? setEditingItem({ ...editingItem, description: e.target.value })
                  : setNewItem({ ...newItem, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">السعر *</label>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                placeholder="مثال: 15.5"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">الفئة</label>
              <select
                value={editingItem ? editingItem.category : newItem.category}
                onChange={(e) => editingItem
                  ? setEditingItem({ ...editingItem, category: e.target.value })
                  : setNewItem({ ...newItem, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
              >
                <option value="">بدون فئة</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">وقت التحضير (دقيقة)</label>
              <input
                type="number"
                value={editingItem ? editingItem.preparationTime : newItem.preparationTime}
                onChange={(e) => editingItem
                  ? setEditingItem({ ...editingItem, preparationTime: parseInt(e.target.value) || 0 })
                  : setNewItem({ ...newItem, preparationTime: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
              />
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