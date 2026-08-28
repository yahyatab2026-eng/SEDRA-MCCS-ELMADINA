import { LocationItem, TechnicianItem, GovernanceRecord, AdminDecision, SettingItem } from '../types';

export const SEED_SETTINGS: SettingItem[] = [
  { key: 'ORG_NAME', value: 'مجموعة سيدرا والمدينة المنورة (Sedra & El Madina Group)', description: 'اسم المؤسسة الرسمي' },
  { key: 'DIRECTOR_ENG', value: 'المهندس يحيى طارق فرج (مدير الإدارة الهندسية للمجموعة)', description: 'مدير الإدارة الهندسية' },
  { key: 'SLA_HOURS', value: '24', description: 'زمن الاستجابة القياسي بالساعات للأعطال العادية' },
  { key: 'SLA_URGENT_HOURS', value: '4', description: 'زمن الاستجابة القياسي للبلاغات العاجلة' },
  { key: 'DEFAULT_MODEL', value: 'gemini-2.5-flash', description: 'نموذج الذكاء الاصطناعي لـ Gemini API' },
  { key: 'TIMEZONE', value: 'Africa/Cairo', description: 'المنطقة الزمنية المعتمدة' }
];

export const COMPANY_LOCATIONS: LocationItem[] = [
  // Factories
  {
    id: 'FAC-001',
    name: 'مصنع الألبان (Dairy Plant) — العبور',
    type: 'مصنع',
    org: 'El Madina El Monawara (المدينة المنورة)',
    region: 'القليوبية / العبور',
    scope: 'إنتاج الألبان ومشتقاتها (جبن، زبادي، بسترة)',
    lat: 30.2245,
    lng: 31.4890,
    address: 'المنطقة الصناعية الأولى، مدينة العبور',
    active: true
  },
  {
    id: 'FAC-002',
    name: 'مصنع الجنان (El Genan Plant) — العبور',
    type: 'مصنع',
    org: 'El Madina El Monawara (المدينة المنورة)',
    region: 'القليوبية / العبور',
    scope: 'إنتاج الشوكولاتة، صوصات الشوكولاتة، زبدة المكسرات، الآيس كريم، والوافل',
    lat: 30.2280,
    lng: 31.4920,
    address: 'المنطقة الصناعية، مدينة العبور',
    active: true
  },
  {
    id: 'FAC-003',
    name: 'مصنع الغربي (Pastry & Catering Plant) — التجمع',
    type: 'مصنع',
    org: 'Sidera Confectionery (سيدرا)',
    region: 'القاهرة الجديدة / التجمع',
    scope: 'الحلويات الشرقية والغربية ومنتجات الحفلات والكاترنج والمناسبات الخاصة',
    lat: 30.0150,
    lng: 31.4650,
    address: 'المنطقة الصناعية، التجمع الخامس، القاهرة الجديدة',
    active: true
  },
  {
    id: 'FAC-004',
    name: 'مصنع المخبوزات (Bakery Plant) — التجمع',
    type: 'مصنع',
    org: 'Sidera Confectionery (سيدرا)',
    region: 'القاهرة الجديدة / التجمع',
    scope: 'إنتاج جميع أنواع المخبوزات والعيش والحلويات',
    lat: 30.0170,
    lng: 31.4670,
    address: 'المنطقة الصناعية، التجمع الخامس، القاهرة الجديدة',
    active: true
  },

  // Central Warehouses
  {
    id: 'WH-001',
    name: 'المخزن الرئيسي المركزي — التجمع',
    type: 'مخزن',
    org: 'Sidera Confectionery (سيدرا)',
    region: 'القاهرة الجديدة / التجمع',
    scope: 'التخزين والإمداد المركزي للخامات والمنتجات',
    lat: 30.0140,
    lng: 31.4640,
    address: 'بدروم مجمع مصانع سيدرا، التجمع الخامس',
    active: true
  },
  {
    id: 'WH-002',
    name: 'مخزن قطع الغيار والصيانة الهندسية — التجمع',
    type: 'مخزن',
    org: 'Sidera Confectionery (سيدرا)',
    region: 'القاهرة الجديدة / التجمع',
    scope: 'قطع الغيار ومعدات الصيانة الهندسية ومهمات الورش',
    lat: 30.0145,
    lng: 31.4645,
    address: 'مجمع مصانع سيدرا، التجمع الخامس (أمين المخزن: أ. أيمن إبراهيم)',
    active: true
  },

  // Branches (16 Locations)
  {
    id: 'BRN-001',
    name: 'فرع المعادي — المدينة المنورة',
    type: 'منفذ بيع',
    org: 'El Madina El Monawara (المدينة المنورة)',
    region: 'جنوب القاهرة',
    scope: 'منفذ بيع ألبان ومثلجات وحلويات',
    lat: 29.9610,
    lng: 31.2650,
    address: 'المعادي، القاهرة',
    active: true
  },
  {
    id: 'BRN-002',
    name: 'فرع الشروق — المدينة المنورة',
    type: 'منفذ بيع',
    org: 'El Madina El Monawara (المدينة المنورة)',
    region: 'شرق القاهرة',
    scope: 'منفذ بيع ألبان وحلواني',
    lat: 30.1380,
    lng: 31.6120,
    address: 'مدينة الشروق، القاهرة (مدير الفرع: محمد حسانين)',
    active: true
  },
  {
    id: 'BRN-003',
    name: 'فرع مدينتي — المدينة المنورة',
    type: 'منفذ بيع',
    org: 'El Madina El Monawara (المدينة المنورة)',
    region: 'شرق القاهرة',
    scope: 'منفذ بيع ألبان وآيس كريم وكريب',
    lat: 30.0950,
    lng: 31.6390,
    address: 'مدينتي، القاهرة (مدير الفرع: أحمد الصعيدي)',
    active: true
  },
  {
    id: 'BRN-004',
    name: 'فرع روكسي — المدينة المنورة',
    type: 'منفذ بيع',
    org: 'El Madina El Monawara (المدينة المنورة)',
    region: 'شرق القاهرة',
    scope: 'منفذ بيع ألبان وحلويات ومخبوزات',
    lat: 30.0920,
    lng: 31.3210,
    address: 'ميدان روكسي، مصر الجديدة، القاهرة',
    active: true
  },
  {
    id: 'BRN-005',
    name: 'فرع ومقر الشيراتون — المدينة المنورة',
    type: 'مقر إداري',
    org: 'El Madina El Monawara (المدينة المنورة)',
    region: 'شرق القاهرة',
    scope: 'منفذ بيع + مقر الإدارة الهندسية العامة',
    lat: 30.1080,
    lng: 31.3780,
    address: 'مساكن شيراتون، مصر الجديدة، القاهرة',
    active: true
  },
  {
    id: 'BRN-006',
    name: 'فرع الرحاب — المدينة المنورة',
    type: 'منفذ بيع',
    org: 'El Madina El Monawara (المدينة المنورة)',
    region: 'القاهرة الجديدة',
    scope: 'منفذ بيع ألبان ومخبوزات وحلواني',
    lat: 30.0620,
    lng: 31.4920,
    address: 'السوق التجاري، مدينة الرحاب، القاهرة',
    active: true
  },
  {
    id: 'BRN-007',
    name: 'فرع الفردوس — المدينة المنورة',
    type: 'منفذ بيع',
    org: 'El Madina El Monawara (المدينة المنورة)',
    region: 'الجيزة / 6 أكتوبر',
    scope: 'منفذ بيع ألبان وحلواني ومثلجات',
    lat: 29.9540,
    lng: 30.9980,
    address: 'حي الفردوس، 6 أكتوبر، الجيزة',
    active: true
  },
  {
    id: 'BRN-008',
    name: 'فرع الحصري — المدينة المنورة',
    type: 'منفذ بيع',
    org: 'El Madina El Monawara (المدينة المنورة)',
    region: 'الجيزة / 6 أكتوبر',
    scope: 'منفذ بيع ألبان وحلواني وفرن أم علي',
    lat: 29.9730,
    lng: 30.9470,
    address: 'ميدان الحصري، المحور المركزي، 6 أكتوبر، الجيزة',
    active: true
  },
  {
    id: 'BRN-009',
    name: 'فرع مدينة نصر — المدينة المنورة',
    type: 'منفذ بيع',
    org: 'El Madina El Monawara (المدينة المنورة)',
    region: 'شرق القاهرة',
    scope: 'منفذ بيع رئيسي',
    lat: 30.0610,
    lng: 31.3450,
    address: 'شارع عباس العقاد، مدينة نصر، القاهرة',
    active: true
  },
  {
    id: 'BRN-010',
    name: 'فرع الحديقة الدولية — المدينة المنورة',
    type: 'منفذ بيع',
    org: 'El Madina El Monawara (المدينة المنورة)',
    region: 'شرق القاهرة',
    scope: 'منفذ بيع وكافيه',
    lat: 30.0490,
    lng: 31.3360,
    address: 'بجوار الحديقة الدولية، مدينة نصر، القاهرة',
    active: true
  },
  {
    id: 'BRN-011',
    name: 'فرع نادي الصيد — المدينة المنورة',
    type: 'منفذ بيع',
    org: 'El Madina El Monawara (المدينة المنورة)',
    region: 'الجيزة / الدقي',
    scope: 'منفذ بيع داخل نادي الصيد',
    lat: 30.0410,
    lng: 31.2030,
    address: 'نادي الصيد المصري، الدقي، الجيزة',
    active: true
  },
  {
    id: 'BRN-012',
    name: 'فرع مراسي — المدينة المنورة',
    type: 'منفذ بيع',
    org: 'El Madina El Monawara (المدينة المنورة)',
    region: 'الساحل الشمالي',
    scope: 'منفذ موسمي وخدمة مصطافين',
    lat: 30.9850,
    lng: 28.7980,
    address: 'منتجع مراسي، سيدي عبد الرحمن، الساحل الشمالي',
    active: true
  },
  {
    id: 'BRN-013',
    name: 'فرع مارينا 2 — المدينة المنورة',
    type: 'منفذ بيع',
    org: 'El Madina El Monawara (المدينة المنورة)',
    region: 'الساحل الشمالي',
    scope: 'منفذ موسمي (كريب وحلواني ومثلجات)',
    lat: 30.8250,
    lng: 29.0120,
    address: 'بوابة 2، قرية مارينا العلمين، الساحل الشمالي',
    active: true
  },
  {
    id: 'BRN-014',
    name: 'فرع الجولف — سيدرا',
    type: 'منفذ بيع',
    org: 'Sidera Confectionery (سيدرا)',
    region: 'شرق القاهرة',
    scope: 'حلواني وكافيه ومعرض منتجات غربية وشرقية',
    lat: 30.0980,
    lng: 31.3460,
    address: 'أرض الجولف، مصر الجديدة، القاهرة',
    active: true
  },
  {
    id: 'BRN-015',
    name: 'فرع ومطعم التسعين — سيدرا',
    type: 'منفذ بيع',
    org: 'Sidera Confectionery (سيدرا)',
    region: 'القاهرة الجديدة',
    scope: 'مطعم، كافيه، ومعرض حلويات ومخبوزات',
    lat: 30.0240,
    lng: 31.4780,
    address: 'شارع التسعين الشمالي، التجمع الخامس (مسؤول الفرع: أ. أحمد زارع)',
    active: true
  },
  {
    id: 'BRN-016',
    name: 'فرع الدقي — سيدرا',
    type: 'منفذ بيع',
    org: 'Sidera Confectionery (سيدرا)',
    region: 'الجيزة / الدقي',
    scope: 'معرض حلويات غربية ومطعم ومطبخ',
    lat: 30.0390,
    lng: 31.2110,
    address: 'شارع مصدق تقاطع محيي الدين أبو العز، الدقي، الجيزة',
    active: true
  }
];

export const COMPANY_TECHNICIANS: TechnicianItem[] = [
  {
    id: 'TEC-022',
    code: '18106',
    name: 'المهندس يحيى طارق فرج عبد الغني محمود',
    phone: '+201000000000',
    specialty: 'مدير الإدارة الهندسية للمجموعة (Director of Engineering)',
    location: 'إدارة شيراتون / مجمع المصانع',
    joinDate: '23/08/2026',
    active: true,
    color: '#0f766e',
    employmentType: 'إدارة هندسية'
  },
  {
    id: 'TEC-001',
    code: '18002',
    name: 'محمد ماهر عبد الرازق عابد',
    phone: '01004266976',
    specialty: 'مشرف صيانة / سباك وشبكات مياه',
    location: 'مصنع التجمع',
    joinDate: '14/11/2007',
    active: true,
    color: '#059669',
    employmentType: 'ثابت'
  },
  {
    id: 'TEC-002',
    code: '18004',
    name: 'أحمد فاروق أحمد عبد المنعم',
    phone: '01003616577',
    specialty: 'فني تبريد وتكييف وثلاجات عرض',
    location: 'فرع الجولف / الفروع',
    joinDate: '16/04/2008',
    active: true,
    color: '#0284c7',
    employmentType: 'ثابت'
  },
  {
    id: 'TEC-003',
    code: '18015',
    name: 'كرم عليمي محمد عليمي',
    phone: '01159290175',
    specialty: 'فني معدات مخابز وحدادة',
    location: 'مصنع التجمع',
    joinDate: '21/03/2022',
    active: true,
    color: '#b45309',
    employmentType: 'ثابت'
  },
  {
    id: 'TEC-004',
    code: '18019',
    name: 'مصطفى فايد مصطفى صالح',
    phone: '01068532450',
    specialty: 'فني معدات غاز وشعلات وأفران',
    location: 'مصنع التجمع',
    joinDate: '15/05/2011',
    active: true,
    color: '#dc2626',
    employmentType: 'ثابت'
  },
  {
    id: 'TEC-005',
    code: '18091',
    name: 'حسن عبد العزيز عبد الحفيظ محمد',
    phone: '01007762515',
    specialty: 'فني معدات غاز',
    location: 'مصنع التجمع',
    joinDate: '13/08/2022',
    active: true,
    color: '#dc2626',
    employmentType: 'ثابت'
  },
  {
    id: 'TEC-006',
    code: '18030',
    name: 'عبد الغفار عبد الله السيد',
    phone: '01003070491',
    specialty: 'عمالة موسمية / مسؤول صيانة معدات',
    location: 'مصنع التجمع',
    joinDate: '21/05/2017',
    active: true,
    color: '#64748b',
    employmentType: 'موسمي'
  },
  {
    id: 'TEC-007',
    code: '18040',
    name: 'محمود فوزي صادق إبراهيم',
    phone: '01015151383',
    specialty: 'فني تبريد وتكييف وفروع',
    location: 'فرع الجولف / الفروع',
    joinDate: '03/05/2026',
    active: true,
    color: '#0284c7',
    employmentType: 'ثابت'
  },
  {
    id: 'TEC-008',
    code: '18044',
    name: 'أحمد خالد خليل أحمد',
    phone: '01069006933',
    specialty: 'فني كهرباء قوى وأفران وسخانات',
    location: 'فرع الجولف / الفروع',
    joinDate: '04/06/2016',
    active: true,
    color: '#d97706',
    employmentType: 'ثابت'
  },
  {
    id: 'TEC-009',
    code: '18053',
    name: 'عامر كمال حمدي رزق',
    phone: '01128542318',
    specialty: 'فني كهرباء ومرافق',
    location: 'سيدرا التسعين',
    joinDate: '24/08/2017',
    active: true,
    color: '#d97706',
    employmentType: 'ثابت'
  },
  {
    id: 'TEC-010',
    code: '18057',
    name: 'عماد محمود أحمد هريدي',
    phone: '01030579291',
    specialty: 'فني نجارة وتجهيزات خشبية وأبواب',
    location: 'فرع الجولف / الفروع والمصانع',
    joinDate: '19/02/2018',
    active: true,
    color: '#78350f',
    employmentType: 'ثابت'
  },
  {
    id: 'TEC-011',
    code: '18073',
    name: 'إسلام السيد أحمد السيد موسى',
    phone: '01212141422',
    specialty: 'فني تبريد وتكييف وطوارئ الساحل',
    location: 'سيدرا التسعين / مراسي',
    joinDate: '14/12/2019',
    active: true,
    color: '#0891b2',
    employmentType: 'ثابت'
  },
  {
    id: 'TEC-012',
    code: '18074',
    name: 'هاني محمود شندي أحمد البغدي',
    phone: '01062446307',
    specialty: 'فني حدادة ولحام وأبواب أسانسير',
    location: 'مصنع التجمع 2',
    joinDate: '08/09/2020',
    active: true,
    color: '#475569',
    employmentType: 'ثابت'
  },
  {
    id: 'TEC-013',
    code: '18077',
    name: 'محمد إبراهيم علي حسين',
    phone: '01061723011',
    specialty: 'فني تبريد وتكييف ودرين',
    location: 'سيدرا التسعين / الفروع',
    joinDate: '13/10/2020',
    active: true,
    color: '#0284c7',
    employmentType: 'ثابت'
  },
  {
    id: 'TEC-014',
    code: '18084',
    name: 'أحمد إبراهيم محمد إمام',
    phone: '01116241362',
    specialty: 'فني حدادة ولحام استانلس',
    location: 'مصنع التجمع',
    joinDate: '18/09/2021',
    active: true,
    color: '#475569',
    employmentType: 'ثابت'
  },
  {
    id: 'TEC-015',
    code: '18085',
    name: 'محمد إبراهيم متولي مرسي كيلاني',
    phone: '01080263934',
    specialty: 'فني تبريد وتكييف مصانع ألبان',
    location: 'مصنع العبور 2',
    joinDate: '24/10/2021',
    active: true,
    color: '#0891b2',
    employmentType: 'ثابت'
  },
  {
    id: 'TEC-016',
    code: '18086',
    name: 'محمود محمد محمد عبد الغفار (محمود الجوكر)',
    phone: '01149400485',
    specialty: 'فني تبريد وتكييف وغرف تجميد مركزية',
    location: 'مصنع التجمع',
    joinDate: '15/03/2022',
    active: true,
    color: '#0891b2',
    employmentType: 'ثابت'
  },
  {
    id: 'TEC-017',
    code: '18087',
    name: 'محسن ربيع فضل حسن',
    phone: '01091112192',
    specialty: 'فني متابعة وصيانة مولدات الديزل (كمنز)',
    location: 'مصنع التجمع',
    joinDate: '12/04/2022',
    active: true,
    color: '#ea580c',
    employmentType: 'ثابت'
  },
  {
    id: 'TEC-018',
    code: '18088',
    name: 'خالد محمد شعبان محمد',
    phone: '01025318785',
    specialty: 'فني كهرباء كنترول ولوحات PLC',
    location: 'مصنع التجمع',
    joinDate: '14/05/2022',
    active: true,
    color: '#d97706',
    employmentType: 'ثابت'
  },
  {
    id: 'TEC-019',
    code: '18090',
    name: 'إبراهيم سيد حنفي محمد',
    phone: '01551389203',
    specialty: 'مساعد فني معدات مخابز وماكينات',
    location: 'مصنع التجمع',
    joinDate: '04/08/2022',
    active: true,
    color: '#b45309',
    employmentType: 'ثابت'
  },
  {
    id: 'TEC-020',
    code: '18101',
    name: 'محمد عبد المؤمن رياض حنفي (محمد مؤمن)',
    phone: '01068145502',
    specialty: 'فني تبريد وتكييف مصنع الألبان (وردية مبكرة 06:00 ص)',
    location: 'مصنع العبور (الألبان)',
    joinDate: '07/09/2025',
    active: true,
    color: '#0891b2',
    employmentType: 'ثابت'
  },
  {
    id: 'TEC-021',
    code: '18104',
    name: 'حسين عزت خضر عبد الله',
    phone: '01143094068',
    specialty: 'سباك صحي وشبكات طلمبات وفواصل',
    location: 'مصنع العبور 2 / الفروع',
    joinDate: '17/09/2025',
    active: true,
    color: '#059669',
    employmentType: 'ثابت'
  }
];

export const COMPANY_GOVERNANCE: GovernanceRecord[] = [
  {
    id: 'GOV-001',
    role: 'Board Ownership (شريك مالك 1/3)',
    name: 'الحاج محمد دياب',
    ownership: '33.33%',
    scope: 'تصنيع المدينة المنورة (الألبان ومصنع الجنان)، محلات وفروع المدينة المنورة، ومطاعم سيدرا',
    status: 'Active'
  },
  {
    id: 'GOV-002',
    role: 'Board Ownership (شريك مالك 1/3)',
    name: 'د. عمرو دياب',
    ownership: '33.33%',
    scope: 'تصنيع سيدرا (مصانع التجمع الغربي والمخبوزات)، الكافيهات، والكاترنج والحفلات',
    status: 'Active'
  },
  {
    id: 'GOV-003',
    role: 'Board Ownership (شريك مالك 1/3)',
    name: 'المستشار أحمد خليفة (زوج د. منى دياب مالكة 1/3)',
    ownership: '33.33%',
    scope: 'الإدارات المشتركة وفرع الجولف',
    status: 'Active'
  },
  {
    id: 'GOV-004',
    role: 'General Manager (المدير العام للمجموعة)',
    name: 'أ. أحمد سلامة',
    ownership: 'Executive Management',
    scope: 'الإدارة التنفيذية العامة والتنسيق المشترك بين جميع القطاعات',
    status: 'Active'
  },
  {
    id: 'GOV-005',
    role: 'Director of Engineering (مدير الإدارة الهندسية)',
    name: 'المهندس يحيى طارق فرج',
    ownership: 'Engineering Directorate',
    scope: 'حوكمة كافة العمليات الهندسية والصيانة والمرافق والأصول وسلامة الغذاء والمخازن لـ 22 موقعاً',
    status: 'Active'
  }
];

export const COMPANY_DECISIONS: AdminDecision[] = [
  {
    id: 'DEC-2026-001',
    title: 'تعديل مواعيد وردية فني التبريد (محمد مؤمن) لحل فجوة الصيانة الصباحية بمصنع ألبان العبور',
    org: 'El Madina El Monawara Dairy Products (ORG-MAD)',
    facility: 'مصنع الألبان — العبور',
    author: 'Eng. Yahia Tarek Farag (Director of Engineering)',
    date: '2026-08-25',
    status: 'Approved & Implemented',
    effectiveDate: '2026-08-26',
    scope: 'تعديل مواعيد عمل فني التبريد والتكييف (محمد مؤمن) لتصبح من 06:00 صباحاً إلى 02:00 ظهراً بدلاً من 09:00 صباحاً إلى 05:00 مساءً لتغطية بدء تشغيل البسترة والحضان الساعة 6:00 ص.'
  },
  {
    id: 'DEC-2026-002',
    title: 'تكهين طلمبة غاطس المعادي 380V وشراء طلمبة جديدة وتأهيل طلمبة 220V للتجمع',
    org: 'Group Engineering Directorate',
    facility: 'فرع المعادي + مصنع الغربي التجمع',
    author: 'Eng. Yahia Tarek Farag',
    date: '2026-08-27',
    status: 'Approved & Under Execution',
    effectiveDate: '2026-08-27',
    scope: 'تكهين طلمبة غاطس المعادي 380V المحروقة وإصدار طلب شراء عاجل لطلمبة كالبيدا Calpeda مفرمة جديدة، مع صيانة طلمبة 220V وتخصيصها للطوارئ بمصنع التجمع.'
  },
  {
    id: 'DOC-ENG-POL-001',
    title: 'الدليل الإجرائي الموحد لحوكمة العمليات الهندسية والصيانة والسلامة والمشتريات (ENG-POL-MASTER-2026)',
    org: 'Sedra & El Madina Group',
    facility: 'كافة المصانع والفروع (22 موقعاً)',
    author: 'المهندس يحيى طارق فرج',
    date: '2026-08-28',
    status: 'Active Master SOP',
    effectiveDate: '2026-08-28',
    scope: 'يتضمن: (1) ENG-SOP-001 الصيانة الوقائية والاعتمادية وحظر قطع الغيار المستعملة، (2) ENG-SOP-002 السلامة وتصاريح العمل الساخن وLOTO وتأمين الأسطح، (3) ENG-SOP-003 حوكمة المخازن والعهد النقدية، (4) ENG-SOP-004 إدارة الطاقة وخفض الديزل.'
  }
];
