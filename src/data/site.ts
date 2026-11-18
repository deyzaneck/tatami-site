import type { ImageMetadata } from 'astro';
import zakotenko from '../assets/trainer-zakotenko.webp';
import shibchenko from '../../Тренера/Шибченко/jYtDfk4dYE_1gXvxNF_8vvsuvVyc5CrvR75Dlt_V9aN7vjdfyrRo24CnSB40sJ0urukt6pNKSOsSureUoIL0ostm.jpg';
import tyokina from '../../Тренера/Тёкина/Oe2V2cNfLjCKyc_vCJPhDxg7aUO5Zeowiwk5jFwhHx9lSwUhXc9I8XbSHXlYzyDkRffhJ1L4JxISpKJAjQ5B1Zuy.jpg';
export interface NavItem {
  label: string;
  href: string;
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'mat' | 'heart';
}

export type DirectionId = 'judo' | 'muay-thai' | 'stretching';

export interface DirectionInfo {
  id: DirectionId;
  title: string;
  subtitle: string;
  highlights: string[];
}

export interface TrainerCard {
  id: string;
  name: string;
  photo: ImageMetadata;
  role: string;
  directionId: DirectionId;
  bookingLabel: string;
  achievements: string[];
}

export interface Review {
  id: string;
  date?: string;
  text: string;
  excerpt: string;
}

export interface PricingPlan {
  id: string;
  title: string;
  price: string;
  period: string;
  description: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export function createExcerpt(text: string, maxLength = 150): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  const sliced = normalized.slice(0, maxLength);
  const lastSpace = sliced.lastIndexOf(' ');
  const safeSlice = lastSpace > maxLength - 35 ? sliced.slice(0, lastSpace) : sliced;
  return `${safeSlice.replace(/[.,!?;:—-]+$/, '')}…`;
}

export const CLUB = {
  name: 'Спортивный клуб «Татами»',
  shortName: 'ТАТАМИ',
  subtitle: 'Спортивный клуб',
  city: 'г. Жуковский',
  cityShort: 'Жуковский',
  streetAddress: 'ул. Гагарина, 85',
  addressShort: 'ул. Гагарина, 85, Жуковский',
  addressFull: 'ул. Гагарина, 85, Жуковский, Московская область',
  phoneDisplay: '+7 (995) 788-14-61',
  telegramAdmin: 'https://t.me/tatamiadmin',
  mapCoords: {
    lat: 55.610072,
    lng: 38.073791,
  },
  mapUrl: 'https://yandex.ru/maps/?pt=38.073791,55.610072&z=17&l=map',
  mapEmbedUrl: 'https://yandex.ru/map-widget/v1/?ll=38.073791%2C55.610072&z=17&pt=38.073791%2C55.610072%2Cpm2rdm',
  yandexReviewsUrl: 'https://yandex.ru/maps/org/tatami/84010828701/reviews/',
  socials: {
    instagram: 'https://www.instagram.com/sc.tatami/',
    vk: 'https://vk.ru/sctatami',
    telegram: 'https://t.me/sctatami',
  },
} as const;

export const NAV_ITEMS: NavItem[] = [
  { label: 'Направления', href: '#directions' },
  { label: 'Тренеры', href: '#trainers' },
  { label: 'Фото', href: '#gallery' },
  { label: 'Цены', href: '#pricing' },
  { label: 'Вопросы', href: '#faq' },
  { label: 'Контакты', href: '#contacts' },
];

export const BENEFITS: Benefit[] = [
  {
    id: 'coaches',
    title: 'Опытные тренеры',
    description:
      'Наставники находят индивидуальный подход к каждому ребенку и взрослому, уделяют внимание технике и поддерживают дисциплину.',
    icon: 'trophy',
  },
  {
    id: 'halls',
    title: 'Два просторных зала с новыми матами',
    description:
      'Современное покрытие, стеновые протекторы, зеркала в основном зале и комфортные раздевалки для учеников и родителей.',
    icon: 'mat',
  },
  {
    id: 'approach',
    title: 'Занятия для детей и взрослых',
    description:
      'Поможем выбрать направление и подходящее время. Подробности первого занятия обсудим с вами в Telegram.',
    icon: 'heart',
  },
];

export const DIRECTIONS: DirectionInfo[] = [
  {
    id: 'judo',
    title: 'Дзюдо',
    subtitle: 'Техника, координация и дисциплина',
    highlights: [
      'Учимся безопасно падать, держать равновесие и выполнять приёмы',
      'Развиваем силу и уверенность на татами',
    ],
  },
  {
    id: 'muay-thai',
    title: 'Тайский бокс',
    subtitle: 'Ударная техника и выносливость',
    highlights: [
      'Отрабатываем удары руками и ногами, занимаемся на лапах',
      'Развиваем реакцию, выносливость и контроль движений',
    ],
  },
  {
    id: 'stretching',
    title: 'Стретчинг',
    subtitle: 'Гибкость и подвижность',
    highlights: [
      'Работаем над гибкостью и свободой движений',
      'Подбираем нагрузку с учётом вашей подготовки',
    ],
  },
];


export const TRAINERS: TrainerCard[] = [
  {
    id: 'zakotenko',
    name: 'Иван Сергеевич Закотенко',
    photo: zakotenko,
    role: 'Тренер по дзюдо',
    directionId: 'judo',
    bookingLabel: 'Записаться на дзюдо',
    achievements: ['Призёр Первенства Москвы до 21 года', 'Член сборной команды Москвы по дзюдо', 'Студент Московской государственной академии физической культуры'],
  },
  {
    id: 'shibchenko',
    name: 'Максим Русланович Шибченко',
    photo: shibchenko,
    role: 'Тренер по тайскому боксу',
    directionId: 'muay-thai',
    bookingLabel: 'Записаться на тайский бокс',
    achievements: [],
  },
  {
    id: 'tyokina',
    name: 'Ольга Константиновна Тёкина',
    photo: tyokina,
    role: 'Стретчинг и гимнастическая база',
    directionId: 'stretching',
    bookingLabel: 'Записаться на стретчинг',
    achievements: ['Мастер спорта России по эстетической гимнастике', 'Двукратная победительница Первенства мира 2023 года', 'Бронзовый призёр Чемпионата России 2024 года'],
  },
];

const RAW_REVIEWS: Omit<Review, 'excerpt'>[] = [
  {
    id: 'sofia',
    text: 'была на открытии, отличное место, обязательно приведу сюда своего ребенка, тренер замечательный, очень добрый и хорошо ладит с детьми, опытный. рекомендую!',
  },
  {
    id: 'alexander',
    text: 'Очень крутой зал, был на персональной тренировке у Ивана. Очень понравилось. В зале новые маты. Иван настоящий профессионал провёл отличную тренировку, выявил мои слабые стороны над которыми будем работать. Очень рекомендую!',
  },
  {
    id: 'begemot',
    text: 'Был на открытии зала, хороший персонал, отличные тренера мастера своего дела, очень понравилась техника и подход к обучению хоть я и занимаюсь 3 года, явно есть чему поучится, обязательно запишусь буду ходить, спасибо большое',
  },
  {
    id: 'anastasia',
    date: '6 ноября',
    text: 'Вожу в спортивный клуб «Татами» младших братиков и очень рада, что мы нашли именно это место! 🥋\n\nИзначально заниматься начал только один из них, а второй пришёл просто посмотреть\n\nНо атмосфера клуба и профессионализм тренеров настолько его заинтересовали, что теперь ребята ходят на тренировки вдвоём!\n\nОтдельно хочется отметить тренеров: очень добрые, внимательные к детям, но при этом справедливые и умеющие поддерживать дисциплину\n\nВидно, что они действительно любят своё дело и с любовью относятся к каждому ребёнку\n\nОсобенно нравится, что здесь не просто учат спортивным навыкам, а с самого детства прививают любовь к спорту, объясняют, почему важно заниматься, быть активным, дисциплинированным и работать над собой\n\nСпасибо клубу «Татами» за такую атмосферу, подход и вклад в развитие детей! Очень приятно видеть, с каким желанием братики идут на тренировки❤️',
  },
  {
    id: 'sergey',
    date: '13 сентября',
    text: 'Отличное место для того, чтобы раскрыть свои возможности с помощью мастеров своего дела, которые выявят пробелы по технике, укажут и объяснят как их закрыть. Подход индивидуальный к каждому спортсмену - это огромный плюс, ведь ни в каждой секции найдешь такого',
  },
  {
    id: 'vladimir',
    date: '18 сентября',
    text: 'Был на открытии зала — всё очень понравилось! Отличный зал, классная атмосфера, а мастер-класс от тренеров был вообще 🔥 Видно, что всё сделано с душой. Успехов и больших побед ребятам!',
  },
  {
    id: 'elina',
    date: '14 сентября',
    text: 'Выбирали клуб для сына рядом с домом и не прогадали. Сходили на день открытых дверей в спортивный клуб «Татами». Сильный тренерский состав, чувствуется спортивный опыт и умение работать с детками. Рекомендую всем, кто хочет приобщить ребенка к спорту без лишнего пафоса.',
  },
  {
    id: 'aleksey',
    date: '13 сентября',
    text: 'Отличный зал, тренера мастера своего дела, находят индивидуальный подход к каждому ребенку. Присутствуют комфортные раздевалки и два просторных зала',
  },
];

export const REVIEWS: Review[] = RAW_REVIEWS.map((review) => ({
  ...review,
  excerpt: createExcerpt(review.text, 150),
}));

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'sub-3-week',
    title: 'Абонемент на месяц',
    price: '6000 ₽',
    period: 'в месяц',
    description: '3 тренировки в неделю',
  },
  {
    id: 'single',
    title: 'Разовое посещение',
    price: '1000 ₽',
    period: '1 занятие',
    description: 'Оплата одного группового занятия без оформления месячного абонемента.',
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'age',
    question: 'С какого возраста можно начать заниматься?',
    answer:
      'На тренировки принимаем детей от 6 лет и взрослых с любым уровнем подготовки. Подходящую группу по возрасту и опыту подскажет администратор в Telegram.',
  },
  {
    id: 'what-to-bring',
    question: 'Что нужно взять на первое пробное занятие?',
    answer:
      'На первую тренировку достаточно удобной спортивной одежды — футболки и шорт. На татами занимаются босиком, специальная экипировка для старта не требуется.',
  },
  {
    id: 'schedule',
    question: 'Какое расписание у направлений?',
    answer:
      'Дзюдо проходит по понедельникам, средам и пятницам (детские и подростковые группы с 17:00 до 20:00, старшие и взрослые — с 21:00 до 22:30). Тайский бокс — во вторник и четверг вечером (18:00–21:30) и в воскресенье днём (11:00–14:30). Время групп по стретчингу уточняется у администратора в Telegram.',
  },
  {
    id: 'signup',
    question: 'Как проходит запись на бесплатное пробное занятие?',
    answer:
      'Выберите направление в форме на сайте и оставьте имя и телефон — сформируется черновик заявки в Telegram администратора. Точную группу и время вы согласуете в переписке перед визитом.',
  },
  {
    id: 'location',
    question: 'Где находится клуб и какие условия внутри?',
    answer:
      'Клуб «Татами» находится в г. Жуковский по адресу ул. Гагарина, 85. В клубе два просторных зала с новыми татами, стеновыми протекторами, зеркалами в основном зале и комфортными раздевалками.',
  },
];
