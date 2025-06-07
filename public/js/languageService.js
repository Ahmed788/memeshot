class LanguageService {
  constructor() {
    this.currentLanguage = localStorage.getItem('language') || 'ar';
    this.translations = {};
  }

  async loadTranslations() {
    try {
      const response = await fetch(`/locales/${this.currentLanguage}.json`);
      if (!response.ok) throw new Error('Network response was not ok');
      this.translations = await response.json();
      return this.translations;
    } catch (error) {
      console.error('Error loading translations:', error);
      // ترجمات افتراضية للطوارئ
      return this.currentLanguage === 'ar' ? {
        header: {
          title: "ميمشوت - إدارة الطلبات",
          new_request: "تقديم طلب جديد",
          manage_requests: "إدارة الطلبات",
          login: "تسجيل دخول",
          logout: "تسجيل خروج",
          language: "English"
        },
        requests_page: {
          title: "قائمة الطلبات",
          description: "إدارة طلبات النشر والمتابعين",
          filter_label: "فلترة حسب الحالة:",
          export_btn: "تصدير إلى PDF",
          status_filter: {
            all: "جميع الحالات",
            pending: "مراجعة",
            approved: "معتمد",
            receipt_added: "تم الإيصال",
            publishing: "جاري النشر",
            complete: "مكتمل",
            rejected: "مرفوض"
          },
          table_headers: {
            id: "#",
            channel: "رابط القناة",
            followers: "المتابعين",
            account: "الحساب",
            platform: "المنصة",
            price: "السعر",
            wallet: "المحفظة",
            notes: "ملاحظات",
            status: "الحالة",
            receipt: "الإيصال",
            actions: "الإجراءات",
            Market: "المندوب"
          }
        }
      } : {
        header: {
          title: "MemShot - Requests Management",
          new_request: "New Request",
          manage_requests: "Manage Requests",
          login: "Login",
          logout: "Logout",
          language: "العربية"
        },
        requests_page: {
          title: "Requests List",
          description: "Manage publishing requests",
          filter_label: "Filter by status:",
          export_btn: "Export to PDF",
          status_filter: {
            all: "All Statuses",
            pending: "Pending",
            approved: "Approved",
            receipt_added: "Receipt Added",
            publishing: "Publishing",
            complete: "Complete",
            rejected: "Rejected"
          },
          table_headers: {
            id: "#",
            channel: "Channel Link",
            followers: "Followers",
            account: "Account",
            platform: "Platform",
            price: "Price",
            wallet: "Wallet",
            notes: "Notes",
            status: "Status",
            receipt: "Receipt",
             Market: "Market",
            actions: "Actions"
          }
        }
      };
    }
  }

async applyTranslations() {
  await this.loadTranslations();
  
  // 1. ترجمة عناصر الهيدر
  const headerElements = {
    'header-title': this.translations.header?.title,
    'new-request-text': this.translations.header?.new_request,
    'manage-requests-text': this.translations.header?.manage_requests,
    'login-text': this.translations.header?.login,
    'logout-text': this.translations.header?.logout,
    'language-text': this.translations.header?.language
  };

  // 2. ترجمة عناصر صفحة الطلبات
  const requestsElements = {
    'requests-title': this.translations.requests?.title,
    'requests-description': this.translations.requests_page?.description,
    'filter-label': this.translations.requests_page?.filter_label,
    'export-btn-text': this.translations.requests_page?.export_btn,
    'status-all': this.translations.requests_page?.status_filter?.all,
    'status-pending': this.translations.requests_page?.status_filter?.pending,
    'status-approved': this.translations.requests_page?.status_filter?.approved,
    'status-receipt-added': this.translations.requests_page?.status_filter?.receipt_added,
    'status-publishing': this.translations.requests_page?.status_filter?.publishing,
    'status-complete': this.translations.requests_page?.status_filter?.complete,
    'status-rejected': this.translations.requests_page?.status_filter?.rejected,
    'th-id': this.translations.requests_page?.table_headers?.id,
    'th-channel': this.translations.requests_page?.table_headers?.channel,
    'th-followers': this.translations.requests_page?.table_headers?.followers,
    'th-account': this.translations.requests_page?.table_headers?.account,
    'th-platform': this.translations.requests_page?.table_headers?.platform,
    'th-price': this.translations.requests_page?.table_headers?.price,
    'th-wallet': this.translations.requests_page?.table_headers?.wallet,
    'th-notes': this.translations.requests_page?.table_headers?.notes,
    'th-status': this.translations.requests_page?.table_headers?.status,
    'th-receipt': this.translations.requests_page?.table_headers?.receipt,
    'th-market': this.translations.requests_page?.table_headers?.market,
     'th-actions': this.translations.requests_page?.table_headers?.actions
  };

  // تطبيق الترجمة على جميع العناصر
  const allElements = {...headerElements, ...requestsElements};
  Object.entries(allElements).forEach(([id, text]) => {
    const element = document.getElementById(id);
    if (element && text) {
      element.textContent = text;
    }
  });

  // ترجمة شارات الحالة داخل الجدول
  if (this.translations.requests_page?.statuses) {
    document.querySelectorAll('.status-badge').forEach(el => {
      const match = el.className.match(/badge-([\w-]+)/);
      const statusKey = match ? match[1].replace('_', '-') : 'pending';
      if (this.translations.requests_page.statuses[statusKey]) {
        el.textContent = this.translations.requests_page.statuses[statusKey];
      }
    });
  }

  // ترجمة أزرار الإجراءات داخل الجدول
  if (this.translations.requests_page?.actions) {
    document.querySelectorAll('button').forEach(btn => {
      // رفض
      if (btn.textContent.trim().includes('رفض') || btn.textContent.trim().includes('Reject')) {
        btn.innerHTML = `<i class="fas fa-times"></i> ${this.translations.requests_page.actions.reject}`;
      }
      // اعتماد
      if (btn.textContent.trim().includes('اعتماد') || btn.textContent.trim().includes('Approve')) {
        btn.innerHTML = `<i class="fas fa-check"></i> ${this.translations.requests_page.actions.approve}`;
      }
      // إضافة إيصال
      if (btn.textContent.trim().includes('إضافة إيصال') || btn.textContent.trim().includes('Add Receipt')) {
        btn.innerHTML = `<i class="fas fa-receipt"></i> ${this.translations.requests_page.actions.add_receipt}`;
      }
      // جاري النشر
      if (btn.textContent.trim().includes('جاري النشر') || btn.textContent.trim().includes('Publishing')) {
        btn.innerHTML = `<i class="fas fa-upload"></i> ${this.translations.requests_page.actions.publish}`;
      }
      // مكتمل
      if (btn.textContent.trim().includes('مكتمل') || btn.textContent.trim().includes('Complete')) {
        btn.innerHTML = `<i class="fas fa-check-circle"></i> ${this.translations.requests_page.actions.complete}`;
      }
    });
  }

  // تغيير اتجاه الصفحة
  document.documentElement.dir = this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = this.currentLanguage;
  
  console.log('Translations applied successfully for:', this.currentLanguage);
}

  async toggleLanguage() {
    this.currentLanguage = this.currentLanguage === 'ar' ? 'en' : 'ar';
    localStorage.setItem('language', this.currentLanguage);
    await this.applyTranslations();
  }
}

const languageService = new LanguageService();

// تهيئة اللغة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async () => {
  await languageService.applyTranslations();
  
  // إضافة حدث لزر تبديل اللغة
  document.getElementById('language-switcher').addEventListener('click', async (e) => {
    e.preventDefault();
    await languageService.toggleLanguage();
  });
});