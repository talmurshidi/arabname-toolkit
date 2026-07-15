import type { UIStrings } from './types.js';

export const ar: UIStrings = {
  app: {
    name: 'أرابنيم',
    tagline: 'محوِّل الأسماء العربية',
    footerDesc: 'أداة مجانية ومفتوحة المصدر تعمل بالكامل في المتصفح، دون خادم أو قاعدة بيانات.',
    footerMethodology: 'المنهجية',
    footerPrivacy: 'الخصوصية',
    privacyNotice: 'كل البيانات تبقى في متصفحك (localStorage) ولا تُرسَل إلى أي خادم.',
    sourceCode: 'الشيفرة المصدرية'
  },
  nav: {
    converter: 'المحوِّل',
    batch: 'المعالجة الجماعية',
    dictionary: 'القاموس',
    methodology: 'المنهجية',
    toggleLang: 'English'
  },
  converter: {
    title: 'محوِّل الأسماء العربية',
    subtitle: 'تحويل النصوص اللاتينية (Brill) إلى العربية المشكولة وغير المشكولة',
    inputLabel: 'النص اللاتيني',
    inputPlaceholder: 'مثال: Abū Bakr al-Ṣiddīq',
    dinInputPlaceholder: 'مثال: Ǧamāl al-Dīn',
    convertBtn: 'تحويل',
    clearBtn: 'مسح',
    copyBtn: 'نسخ',
    copiedFeedback: 'تم النسخ ✓',
    withHarakatLabel: 'بالحركات',
    withoutHarakatLabel: 'بدون حركات',
    normalizedLabel: 'الاسم المُعدَّل',
    nameOrderLabel: 'ترتيب الفهرسة',
    schemeLabel: 'معيار الترجمة اللاتينية',
    schemeBrillOption: 'لاتيني (Brill)',
    schemeDinOption: 'DIN 31635',
    noInputError: 'الرجاء إدخال نص للتحويل.',
    limitNote: 'المحوِّل يقبل نص Brill أو DIN 31635 المُشكَّل (مع الحروف الدياكريتية).',
    swapDirectionBtn: 'عكس الاتجاه ⇄',
    directionLatinLabel: 'لاتيني',
    directionArabicLabel: 'عربي',
    arabicInputLabel: 'النص العربي (مُشكَّل بالكامل)',
    arabicInputPlaceholder: 'مثال: أَبُو بَكْر الصِّدِّيق',
    outputBrillLabel: 'الصيغة اللاتينية (Brill)',
    outputDinLabel: 'الصيغة اللاتينية (DIN 31635)',
    notDiacritizedWarning:
      'التحويل من العربية إلى اللاتينية يتطلب نصاً عربياً مُشكَّلاً بالكامل (بجميع الحركات). النص المُدخَل غير مُشكَّل بالكامل، والنتيجة ستكون غير موثوقة أو غامضة، لذا لن يتم التحويل.',
    schemeMismatchWarning:
      'يبدو أن النص يحتوي على حروف خاصة بمعيار DIN 31635 (مثل š أو ǧ أو ġ) غير أنك اخترت معيار Brill. معيار Brill لا يتعرف على هذه الحروف كأحرف مفردة، لذا قد تكون النتيجة غير صحيحة.',
    switchToDinBtn: 'التبديل إلى DIN 31635',
    switchToBrillBtn: 'التبديل إلى Brill',
    keyboardToggleBtn: 'لوحة المفاتيح',
    keyboardLatinTab: 'لاتيني (Brill)',
    keyboardDinTab: 'DIN 31635',
    keyboardArabicTab: 'عربي',
    advancedOptionsBtn: 'خيارات متقدمة',
    bracketFixEnabledLabel: 'إصلاح الأقواس غير المتطابقة',
    bracketFixEnabledHint:
      'يزيل الأقواس اليتيمة (بلا نظير) تلقائياً. الأقواس المتوازنة تبقى دون تغيير دائماً — فهي غالباً ملاحظات تحقيق علمي أصيلة.',
    wellFormedBracketsLabel: 'التعامل مع الأقواس المتوازنة',
    wellFormedPreserve: 'الاحتفاظ بها كما هي (موصى به)',
    wellFormedStrip: 'إزالة الأقواس مع الإبقاء على المحتوى',
    wellFormedRemove: 'إزالة الأقواس والمحتوى معاً'
  },
  comparison: {
    title: 'مقارنة المعايير',
    addSchemeBtn: 'إضافة معيار'
  },
  history: {
    title: 'السجل',
    clearAll: 'مسح السجل',
    empty: 'لا توجد تحويلات سابقة.',
    removeEntry: 'حذف'
  },
  batch: {
    title: 'المعالجة الجماعية',
    subtitle: 'ارفع ملف CSV/TSV لتحويل مئات الأسماء دفعةً واحدة',
    uploadLabel: 'ارفع ملفاً (CSV أو TSV)',
    columnLabel: 'عمود الأسماء',
    columnPlaceholder: 'اسم العمود أو رقمه (افتراضي: الأول)',
    processBtn: 'ابدأ المعالجة',
    downloadCsvBtn: 'تنزيل النتائج (CSV)',
    downloadJsonBtn: 'تنزيل النتائج (JSON)',
    progressLabel: 'جارٍ المعالجة…',
    summarySuccess: 'ناجح',
    summaryError: 'خطأ',
    summarySkipped: 'محذوف',
    noFileError: 'الرجاء اختيار ملف أولاً.'
  },
  dictionary: {
    title: 'قاموس المستخدم',
    subtitle: 'أضف ترجماتك الخاصة وستُدمج مع القاموس الأساسي',
    searchPlaceholder: 'بحث…',
    addBtn: 'إضافة مدخل',
    editBtn: 'تعديل',
    deleteBtn: 'حذف',
    exportBtn: 'تصدير JSON',
    importBtn: 'استيراد JSON',
    latinLabel: 'الصيغة اللاتينية',
    arabicHarakatLabel: 'العربية بالحركات',
    notesLabel: 'ملاحظات (اختياري)',
    saveBtn: 'حفظ',
    cancelBtn: 'إلغاء',
    emptyState: 'لا توجد مدخلات. أضف أولى ترجماتك أعلاه.',
    duplicateError: 'هذه الصيغة اللاتينية موجودة بالفعل.',
    confirmDelete: 'هل أنت متأكد من حذف هذا المدخل؟',
    importSuccess: 'تم استيراد {count} مدخل بنجاح.'
  },
  methodology: {
    title: 'المنهجية',
    subtitle: 'توثيق معايير الترجمة الصوتية والمصادر والقيود',
    navBrillStandards: 'معيار Brill',
    navDin31635: 'DIN 31635',
    navCharacterTable: 'جدول الأحرف',
    navEngineLayers: 'طبقات المحرك',
    navOrthography: 'ملاحظات إملائية',
    navLimitations: 'القيود المعروفة',
    navReferences: 'المصادر',
    tableArabic: 'الحرف العربي',
    tableLatin: 'اللاتينية (Brill)',
    tableDin: 'DIN 31635',
    tableNotes: 'ملاحظات',
    recommendedBadge: 'موصى به',
    printBtn: 'نسخة للطباعة'
  },
  common: {
    loading: 'جارٍ التحميل…',
    error: 'خطأ',
    close: 'إغلاق',
    yes: 'نعم',
    no: 'لا',
    ruleVersion: 'إصدار القواعد'
  }
};
