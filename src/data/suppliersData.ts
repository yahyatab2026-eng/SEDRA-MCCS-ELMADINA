import { SupplierItem } from '../types';

export const COMPANY_SUPPLIERS: SupplierItem[] = [
  // Dairy, Boilers & Homogenizers
  {
    id: 'SUP-001',
    name: 'رامي (متخصص مجنسات جيا)',
    category: 'ألبان وتصنيع ومجنسات وغلايات',
    phone: '01009746866',
    specialty: 'مجنس جيا العبور ألبان (GEA Homogenizer Specialist)',
    contactPerson: 'رامي',
    status: 'Active',
    rating: 5,
    notes: 'صيانة مكابس وبلوك المجنس وقطع غيار GEA'
  },
  {
    id: 'SUP-002',
    name: 'مختار السبكي (العالمية للغلايات)',
    category: 'ألبان وتصنيع ومجنسات وغلايات',
    phone: '01001190853',
    specialty: 'العالمية للغلايات العبور الألبان (Boiler Service & Overhaul)',
    contactPerson: 'مختار السبكي',
    status: 'Active',
    rating: 5,
    notes: 'صيانة غلايات البخار والولاعات ومحطات المياه'
  },
  {
    id: 'SUP-003',
    name: 'أحمد حلمي',
    category: 'ألبان وتصنيع ومجنسات وغلايات',
    phone: '01001399015',
    specialty: 'لحام استانلس وغلايات وخطوط بخار مضغوطة',
    contactPerson: 'أحمد حلمي',
    status: 'Active',
    rating: 4,
    notes: 'لحام أرجون صحي لخطوط الألبان والبخار'
  },
  {
    id: 'SUP-004',
    name: 'محمود العيسوي',
    category: 'ألبان وتصنيع ومجنسات وغلايات',
    phone: '01276001096',
    specialty: 'إصلاح وضبط فرازات اللبن (Milk Separators)',
    contactPerson: 'محمود العيسوي',
    status: 'Active',
    rating: 5,
    notes: 'خراطة وتوازن ديناميكي لحلل الفرازات'
  },
  {
    id: 'SUP-005',
    name: 'إسماعيل (شركة سينرجي)',
    category: 'ألبان وتصنيع ومجنسات وغلايات',
    phone: '01123399318',
    specialty: 'صيانة وتوريد معدات ألبان متكاملة',
    contactPerson: 'إسماعيل',
    status: 'Active',
    rating: 4
  },
  {
    id: 'SUP-006',
    name: 'عرفة الخطيب',
    category: 'ألبان وتصنيع ومجنسات وغلايات',
    phone: '01222138322',
    specialty: 'تركيبات خطوط ألبان ومعدات تانكات استانلس',
    contactPerson: 'عرفة الخطيب',
    status: 'Active',
    rating: 4
  },
  {
    id: 'SUP-007',
    name: 'محمد الخامي',
    category: 'ألبان وتصنيع ومجنسات وغلايات',
    phone: '01060006660',
    specialty: 'توريدات معدات وقطع غيار مصانع الألبان',
    contactPerson: 'محمد الخامي',
    status: 'Active',
    rating: 4
  },
  {
    id: 'SUP-008',
    name: 'م/ حسام حسن',
    category: 'ألبان وتصنيع ومجنسات وغلايات',
    phone: '01280066382',
    specialty: 'صيانة معدات الجنان والألبان والعبور',
    contactPerson: 'م/ حسام حسن',
    status: 'Active',
    rating: 5
  },
  {
    id: 'SUP-009',
    name: 'حمد حسن عبد ربه (توكيل عبد ربه)',
    category: 'ألبان وتصنيع ومجنسات وغلايات',
    phone: '01003009504',
    specialty: 'إصلاح موازين ديجيتال وماكينات تقطيع وسلايزر الجبنة (ضمان)',
    contactPerson: 'حمد حسن عبد ربه',
    status: 'Active',
    rating: 5,
    notes: 'الفرع: شارع عبد الخالق ثروت - عابدين وسط البلد'
  },

  // Refrigeration, Chillers & Compressors
  {
    id: 'SUP-010',
    name: 'م/ محمد (شركة عين شمس)',
    category: 'تبريد وتكييف وتشيلرات وضواغط',
    phone: '01013331092',
    specialty: 'شركة عين شمس شيلر العبور (Chiller Overhaul & Maintenance)',
    contactPerson: 'م/ محمد',
    status: 'Active',
    rating: 5,
    notes: 'صيانة تشيلرات DRIC و Carrier بمصنع العبور'
  },
  {
    id: 'SUP-011',
    name: 'أشرف (ورشة عمرات الكباسات)',
    category: 'تبريد وتكييف وتشيلرات وضواغط',
    phone: '01024524898',
    specialty: 'عمرات كباسات تبريد (Bock, Bitzer, Copeland, Frascold)',
    contactPerson: 'أشرف',
    status: 'Active',
    rating: 5,
    notes: 'خراطة وتغيير بساتم وفالف بليت وسلندرات'
  },
  {
    id: 'SUP-012',
    name: 'م/ أسامة أحمد (فريجو ماستر)',
    category: 'تبريد وتكييف وتشيلرات وضواغط',
    phone: '01063050867',
    specialty: 'مبيعات فريجو ماستر معدات وقطع غيار تبريد ومحابس دانفوس وفريون',
    contactPerson: 'م/ أسامة أحمد',
    status: 'Active',
    rating: 5,
    notes: 'وكيل معتمد لمهمات التبريد الصناعي والزيوت'
  },
  {
    id: 'SUP-013',
    name: 'محمد أيمن أمين',
    category: 'تبريد وتكييف وتشيلرات وضواغط',
    phone: '01004026060',
    specialty: 'توريد وتركيب تكييفات كونسيلد وسبليت وفري ستايل',
    contactPerson: 'محمد أيمن',
    status: 'Active',
    rating: 4
  },
  {
    id: 'SUP-014',
    name: 'أحمد سيف',
    category: 'تبريد وتكييف وتشيلرات وضواغط',
    phone: '01282100163',
    specialty: 'مقاولة تكييفات ودكتات التسعين والتجمع',
    contactPerson: 'أحمد سيف',
    status: 'Active',
    rating: 4
  },
  {
    id: 'SUP-015',
    name: 'عوض (برج التبريد)',
    category: 'تبريد وتكييف وتشيلرات وضواغط',
    phone: '01002809003',
    specialty: 'صيانة برج تبريد الجولف ومضخات التبريد',
    contactPerson: 'عوض',
    status: 'Active',
    rating: 4
  },
  {
    id: 'SUP-016',
    name: 'أحمد عادل (P.I.S)',
    category: 'تبريد وتكييف وتشيلرات وضواغط',
    phone: '01112998189',
    specialty: 'قطع غيار أبواب ومفصلات وجوانات غرف تبريد PIS',
    contactPerson: 'أحمد عادل',
    status: 'Active',
    rating: 5,
    notes: 'مورد جوانات ومفصلات غرف التجميد'
  },
  {
    id: 'SUP-017',
    name: 'محمد خضر (شركة المني)',
    category: 'تبريد وتكييف وتشيلرات وضواغط',
    phone: '01116422021',
    specialty: 'شركة المني ثلاجات العرض ونقاط البيع',
    contactPerson: 'محمد خضر',
    status: 'Active',
    rating: 4
  },

  // Pastry, Bakery & Chocolate Equipment
  {
    id: 'SUP-018',
    name: 'إمام أبو جبل',
    category: 'حلواني، مخابز، وشوكولاتة',
    phone: '01113999612',
    specialty: 'معدات حلواني وآيس كريم ومضارب حلويات',
    contactPerson: 'إمام أبو جبل',
    status: 'Active',
    rating: 5
  },
  {
    id: 'SUP-019',
    name: 'محمد أبو بكر',
    category: 'حلواني، مخابز، وشوكولاتة',
    phone: '01098924333',
    specialty: 'معدات حلواني وآيس كريم ومعدات سخن وأفران',
    contactPerson: 'محمد أبو بكر',
    status: 'Active',
    rating: 4
  },
  {
    id: 'SUP-020',
    name: 'صالح يسري (توكيل كاربيجياني)',
    category: 'حلواني، مخابز، وشوكولاتة',
    phone: '01559355575',
    specialty: 'توكيل ماكينات كاربيجياني (Carpigiani Ice Cream Machines)',
    contactPerson: 'صالح يسري',
    status: 'Active',
    rating: 5,
    notes: 'وكيل معتمد لماكينات الآيس كريم الإيطالية'
  },
  {
    id: 'SUP-021',
    name: 'راند (شركة إنسيا)',
    category: 'حلواني، مخابز، وشوكولاتة',
    phone: '01222170800',
    specialty: 'صيانة شركة إنسيا معدات بولين (Polin Bakery Ovens)',
    contactPerson: 'راند',
    status: 'Active',
    rating: 5,
    notes: 'أفران بولين الدوارة والإيطالية'
  },
  {
    id: 'SUP-022',
    name: 'وليد (خراطة المخابز)',
    category: 'حلواني، مخابز، وشوكولاتة',
    phone: '01005162019',
    specialty: 'خراط وتصنيع تروس ودرافيل معدات مخابز وفرادات',
    contactPerson: 'وليد',
    status: 'Active',
    rating: 4
  },
  {
    id: 'SUP-023',
    name: 'محمد عبد الرازق',
    category: 'حلواني، مخابز، وشوكولاتة',
    phone: '01009375704',
    specialty: 'إصلاح كارتات إلكترونية وشاشات وماكينات الشوكولاتة والتغطيس',
    contactPerson: 'محمد عبد الرازق',
    status: 'Active',
    rating: 5
  },
  {
    id: 'SUP-024',
    name: 'عبد الرحمن (أفران الدقي)',
    category: 'حلواني، مخابز، وشوكولاتة',
    phone: '01090883622',
    specialty: 'صيانة وضبط أفران بيتزا الدقي وسيدرا التسعين',
    contactPerson: 'عبد الرحمن',
    status: 'Active',
    rating: 4
  },

  // Electrical, Motors & Generators
  {
    id: 'SUP-025',
    name: 'الوزيري (ورشة لف المواتير)',
    category: 'كهرباء، مواتير ومولدات',
    phone: '01004583704',
    specialty: 'لف مواتير AC Brush Motors و Induction Motors عزل Class H',
    contactPerson: 'الوزيري',
    status: 'Active',
    rating: 5,
    notes: 'منفذ عهدة CUSTODY-2026-002 للف مواتير التجمع'
  },
  {
    id: 'SUP-026',
    name: 'إسلام (صيانة كمنز)',
    category: 'كهرباء، مواتير ومولدات',
    phone: '01013316697',
    specialty: 'صيانة مولدات كمنز (Cummins 500kVA Diesel Generators)',
    contactPerson: 'إسلام',
    status: 'Active',
    rating: 5,
    notes: 'صيانة منظومة حقن الوقود والفلاتر والـ AVR'
  },
  {
    id: 'SUP-027',
    name: 'أحمد عمر (قطع غيار كمنز)',
    category: 'كهرباء، مواتير ومولدات',
    phone: '01001403065',
    specialty: 'قطع غيار وفلاتر وزيوت مولدات كمنز الأصلية',
    contactPerson: 'أحمد عمر',
    status: 'Active',
    rating: 5
  },
  {
    id: 'SUP-028',
    name: 'محمد عصفور (مولدات الساحل)',
    category: 'كهرباء، مواتير ومولدات',
    phone: '01000299973',
    specialty: 'تأجير وصيانة مولدات كهرباء الساحل (مراسي ومارينا)',
    contactPerson: 'محمد عصفور',
    status: 'Active',
    rating: 4
  },

  // Civil, Elevators, Stainless & Fit-out
  {
    id: 'SUP-029',
    name: 'م/ محمد رشاد (شركة البراق للمصاعد)',
    category: 'مصاعد، مدني، استانلس وخدمات عامة',
    phone: '01060111225',
    specialty: 'مصاعد التسعين ومراسي وصيانة المصاعد الهيدروليكية',
    contactPerson: 'م/ محمد رشاد',
    status: 'Active',
    rating: 5
  },
  {
    id: 'SUP-030',
    name: 'م/ رضا',
    category: 'مصاعد، مدني، استانلس وخدمات عامة',
    phone: '01030342696',
    specialty: 'إصلاح وبرمجة مصاعد الرحاب والجولف ومصانع سيدرا',
    contactPerson: 'م/ رضا',
    status: 'Active',
    rating: 4
  },
  {
    id: 'SUP-031',
    name: 'حسني محمد (المتحدة استيل)',
    category: 'مصاعد، مدني، استانلس وخدمات عامة',
    phone: '01017048884',
    specialty: 'تصنيع ترابيزات وأحواض ومعدات استانلس 304 غذائي',
    contactPerson: 'حسني محمد',
    status: 'Active',
    rating: 5
  },
  {
    id: 'SUP-032',
    name: 'عاطف سلامة (الطيب استيل)',
    category: 'مصاعد، مدني، استانلس وخدمات عامة',
    phone: '01007637140',
    specialty: 'معدات وتجهيزات استانلس فرع ومطعم الدقي',
    contactPerson: 'عاطف سلامة',
    status: 'Active',
    rating: 4
  },
  {
    id: 'SUP-033',
    name: 'عبده استانلس (القاهرة للتوريدات)',
    category: 'مصاعد، مدني، استانلس وخدمات عامة',
    phone: '01002136474',
    specialty: 'توريدات عامة ومواسير وصاج استانلس غذائي',
    contactPerson: 'عبده',
    status: 'Active',
    rating: 4
  },
  {
    id: 'SUP-034',
    name: 'محمود خليل (أعمال تشطيبات)',
    category: 'مصاعد، مدني، استانلس وخدمات عامة',
    phone: '01029985582',
    specialty: 'دهانات، جبس بورد، سيراميك وبلاط الفروع والمصانع',
    contactPerson: 'محمود خليل',
    status: 'Active',
    rating: 4
  },
  {
    id: 'SUP-035',
    name: 'أشرف يحيى (أعمال الرخام)',
    category: 'مصاعد، مدني، استانلس وخدمات عامة',
    phone: '01055360387',
    specialty: 'توريد وتركيب وجلي رخام الكاونترات والواجهات',
    contactPerson: 'أشرف يحيى',
    status: 'Active',
    rating: 5
  },
  {
    id: 'SUP-036',
    name: 'حسام طنطاوي (زجاج سيكوريت)',
    category: 'مصاعد، مدني، استانلس وخدمات عامة',
    phone: '01026333277',
    specialty: 'توريد وتركيب وصيانة زجاج سيكوريت وأبواب أوتوماتيك',
    contactPerson: 'حسام طنطاوي',
    status: 'Active',
    rating: 5
  },
  {
    id: 'SUP-037',
    name: 'إسماعيل إبراهيم (سيكوريت الساحل)',
    category: 'مصاعد، مدني، استانلس وخدمات عامة',
    phone: '01282830767',
    specialty: 'أعمال زجاج سيكوريت فروع مراسي ومارينا',
    contactPerson: 'إسماعيل إبراهيم',
    status: 'Active',
    rating: 4
  },
  {
    id: 'SUP-038',
    name: 'عمرو شلبي (تند الصديق)',
    category: 'مصاعد، مدني، استانلس وخدمات عامة',
    phone: '01002058585',
    specialty: 'تند مظلات ومتحركة وواجهات الفروع',
    contactPerson: 'عمرو شلبي',
    status: 'Active',
    rating: 4
  },
  {
    id: 'SUP-039',
    name: 'ستيفن (تند إيطالي)',
    category: 'مصاعد، مدني، استانلس وخدمات عامة',
    phone: '01155114447',
    specialty: 'تند إيطالي أوتوماتيكية فرع ومطعم التسعين',
    contactPerson: 'ستيفن',
    status: 'Active',
    rating: 5
  },
  {
    id: 'SUP-040',
    name: 'وليد (ستائر وتجهيزات)',
    category: 'مصاعد، مدني، استانلس وخدمات عامة',
    phone: '01003523500',
    specialty: 'ستائر PVC لغرف التبريد وستائر مدينتي وشيراتون',
    contactPerson: 'وليد',
    status: 'Active',
    rating: 4
  },
  {
    id: 'SUP-041',
    name: 'عاطف (سباك الساحل)',
    category: 'مصاعد، مدني، استانلس وخدمات عامة',
    phone: '01113618527',
    specialty: 'أعمال سباكة وشبكات مياه مراسي والساحل',
    contactPerson: 'عاطف',
    status: 'Active',
    rating: 4
  },
  {
    id: 'SUP-042',
    name: 'محمود كمال (فلاتر المياه)',
    category: 'مصاعد، مدني، استانلس وخدمات عامة',
    phone: '01009065607',
    specialty: 'محطات وفلاتر معالجة المياه المركزية والشمعات',
    contactPerson: 'محمود كمال',
    status: 'Active',
    rating: 5
  },
  {
    id: 'SUP-043',
    name: 'أحمد عبد العزيز (ماكينات القهوة)',
    category: 'مصاعد، مدني، استانلس وخدمات عامة',
    phone: '01220677116',
    specialty: 'صيانة ماكينات القهوة والإسبريسو الإيطالية',
    contactPerson: 'أحمد عبد العزيز',
    status: 'Active',
    rating: 5
  },
  {
    id: 'SUP-044',
    name: 'خالد (ماكينات قهوة استانلس)',
    category: 'مصاعد، مدني، استانلس وخدمات عامة',
    phone: '01004066505',
    specialty: 'صيانة ماكينات قهوة La Cimbali بسيدرا مراسي',
    contactPerson: 'خالد',
    status: 'Active',
    rating: 5,
    notes: 'متعاون مع الفني إسلام لإصلاح ماكينة مراسي'
  },
  {
    id: 'SUP-045',
    name: 'إبراهيم (مجفف غسالات)',
    category: 'مصاعد، مدني، استانلس وخدمات عامة',
    phone: '01119321026',
    specialty: 'مجففات ومعدات مغاسل يونيفورم المصانع',
    contactPerson: 'إبراهيم',
    status: 'Active',
    rating: 4
  },
  {
    id: 'SUP-046',
    name: 'وائل (غسالات ملابس وأطباق)',
    category: 'مصاعد، مدني، استانلس وخدمات عامة',
    phone: '01067771325',
    specialty: 'غسالات أطباق مطاعم ومصانع سيدرا والدقي',
    contactPerson: 'وائل',
    status: 'Active',
    rating: 4
  },
  {
    id: 'SUP-047',
    name: 'حسن (شاشات عرض)',
    category: 'مصاعد، مدني، استانلس وخدمات عامة',
    phone: '01050408084',
    specialty: 'شاشات عرض ولوحات رقمية وقوائم الأسعار',
    contactPerson: 'حسن',
    status: 'Active',
    rating: 4
  },
  {
    id: 'SUP-048',
    name: 'م/ محمد (وكالة أوسكار للدعاية)',
    category: 'مصاعد، مدني، استانلس وخدمات عامة',
    phone: '01001929160',
    specialty: 'دعاية ويافط وكلادينج الساحل والفروع',
    contactPerson: 'م/ محمد',
    status: 'Active',
    rating: 4
  },
  {
    id: 'SUP-049',
    name: 'بسام رفعت',
    category: 'مصاعد، مدني، استانلس وخدمات عامة',
    phone: '01224985745',
    specialty: 'تصاريح وتنسيقات مارينا والساحل الشمالي',
    contactPerson: 'بسام رفعت',
    status: 'Active',
    rating: 5
  },
  {
    id: 'SUP-050',
    name: 'محمد حسني (شركة سنا للتوكيلات)',
    category: 'مصاعد، مدني، استانلس وخدمات عامة',
    phone: '01026060810',
    specialty: 'توكيلات تجارية ومعدات مستوردة',
    contactPerson: 'محمد حسني',
    status: 'Active',
    rating: 4
  },
  {
    id: 'SUP-051',
    name: 'صيانة جيت',
    category: 'مصاعد، مدني، استانلس وخدمات عامة',
    phone: '01225499974',
    specialty: 'خدمات صيانة ونظافة صناعية متقدمة',
    contactPerson: 'إدارة جيت',
    status: 'Active',
    rating: 4
  },
  {
    id: 'SUP-052',
    name: 'محمد غربية (الاتحاد الغربي للزجاج)',
    category: 'مصاعد، مدني، استانلس وخدمات عامة',
    phone: '01133429800',
    specialty: 'زجاج ومرايا وتجهيزات معارض الحلواني',
    contactPerson: 'محمد غربية',
    status: 'Active',
    rating: 4
  },
  {
    id: 'SUP-053',
    name: 'محمد سيد (مكتب حسام طه)',
    category: 'مصاعد، مدني، استانلس وخدمات عامة',
    phone: '01008059327',
    specialty: 'استشارات هندسية وتصميمات معمارية وتراخيص',
    contactPerson: 'محمد سيد',
    status: 'Active',
    rating: 5
  }
];
