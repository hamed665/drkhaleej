# Taxonomy و Policyهای Entity

## Launch Boundary

در Launch فقط `pharmacy`، `hospital` و `doctor` اجازه‌ی index promotion دارند. تمام familyهای دیگر تا تکمیل mapping، policy، representative canary، content completeness و promotion مستقل `disabled` یا `public/noindex` باقی می‌مانند.

## اصل طراحی

نام بازاری یک مرکز نباید lifecycle فنی جدا بسازد. Entityها با Archetype و Policy مشترک مدیریت می‌شوند.

Archetypeهای این سند vocabulary محصول هستند، نه enum دیتابیس. تا زمان P10/Gate C، قراردادها باید دقیقاً vocabulary فعلی `ImportEntityType` روی main را مصرف کنند؛ برای نمونه `lab`، `pet_clinic` و `medical_beauty_clinic`. نام‌هایی مانند `laboratory`، `veterinary_clinic` یا `medical_beauty` بدون alias/migration مصوب نباید authority موازی بسازند.

## Archetypeها

### 1. Human Healthcare Facility

نمونه‌ها:

- Hospital
- General Clinic
- Specialty Clinic
- Dental Clinic
- Imaging/Radiology Center
- Laboratory
- IVF/Fertility Center
- Physiotherapy/Rehabilitation
- Mental Health Center
- Home Healthcare Provider
- Ambulance/Emergency Provider

فیلدهای مشترک:

- official bilingual name؛
- licence/registration؛
- address و canonical geo؛
- phones و emergency contacts؛
- opening hours و special hours؛
- services؛
- operator type؛
- official site/social؛
- accessibility و service area؛
- evidence per field.

### 2. Human Professional

نمونه‌ها:

- Doctor
- Dentist
- Psychologist/Therapist
- Physiotherapist
- سایر متخصصان ثبت‌شده

تفاوت اصلی:

- licence شخصی؛
- specialty؛
- verified employment/affiliation؛
- زبان‌ها؛
- appointment capability؛
- رابطه با مرکز فقط با Evidence.

### 3. Medical Retail

نمونه‌ها:

- Pharmacy
- Optical
- Medical Equipment Supplier

Policy مستقل برای شعبه، زنجیره، licence، ساعات و خدمات Retail.

### 4. Veterinary Medical

نمونه‌ها:

- Veterinary Hospital
- Veterinary Clinic
- Veterinarian

این خانواده Medical است ولی با Human Healthcare مخلوط نمی‌شود.

### 5. Pet Non-medical

نمونه‌ها:

- Pet Shop
- Grooming
- Boarding
- Pet Services

هیچ Medical Claim یا relation پزشکی به‌صورت پیش‌فرض ندارد.

### 6. Fitness & Wellness

نمونه‌ها:

- Gym
- Fitness Center
- Personal Training Studio

Policy غیرپزشکی دارد. Physiotherapy در این خانواده قرار نمی‌گیرد.

### 7. Beauty

دو Policy کاملاً جدا:

```text
Medical Beauty
Non-medical Beauty
```

Medical Beauty نیازمند Medical Review و licence policy است. Salon/Spa غیرپزشکی نباید Structured Data یا Claim پزشکی بگیرد.

## Operator و Ownership

Charity یک Entity Family نیست:

```text
operator_type:
  private
  government
  charity
  nonprofit
  public_private
  unknown
```

نمونه:

```text
family = hospital
operator_type = charity
```

## Relation Policy

Relation state:

```text
candidate
verified
rejected
expired
```

فقط `verified` می‌تواند Public Internal Link ایجاد کند.

تغییر `candidate` به `verified` نیازمند reviewer identity، evidence references، reason، timestamp و policy version است. Agent فقط candidate می‌سازد.

این موارد Relation سازمانی را اثبات نمی‌کنند:

- فاصله جغرافیایی؛
- نام مشابه؛
- قرارگرفتن در یک ساختمان؛
- ذکر در سایت ثالث بدون Evidence معتبر.

## Source Trust

| سطح | نمونه | کاربرد |
|---|---|---|
| T1 | Regulator/licensing authority | licence، وضعیت فعالیت، نام رسمی |
| T2 | Official center/doctor website | تماس، ساعات، خدمات |
| T3 | Approved maps/business API | candidate، geo، ساعات با Review |
| T4 | Social page/directory | discovery و candidate فقط |
| T5 | Unknown/user-generated | نیازمند بررسی کامل |

Conflict حذف نمی‌شود؛ ذخیره و برای Admin نمایش داده می‌شود.

## Registry Mapping موردنیاز

برای هر family باید این نگاشت تکمیل شود:

```text
ImportEntityType
→ PublicEntityFamily
→ PublicProviderRouteFamily
→ DatabaseStorageFamily
→ SEOProfile
→ SchemaProjection
→ RelationPolicy
→ SitemapFamily
```

Status مجاز:

```text
supported | planned | disabled | unsupported
```
