import type { ImageMetadata } from 'astro';

import photoMain from '../../фотографии_зала/XXXL.webp';
import photo1 from '../../фотографии_зала/XXXL (1).webp';
import photo2 from '../../фотографии_зала/XXXL (2).webp';
import photo3 from '../../фотографии_зала/XXXL (3).webp';
import photo4 from '../../фотографии_зала/XXXL (4).webp';
import photo5 from '../../фотографии_зала/XXXL (5).webp';
import photo6 from '../../фотографии_зала/XXXL (6).webp';
import photo7 from '../../фотографии_зала/XXXL (7).webp';
import photo8 from '../../фотографии_зала/XXXL (8).webp';
import photo9 from '../../фотографии_зала/XXXL (9).webp';

export interface GalleryPhoto {
  id: string;
  src: ImageMetadata;
  alt: string;
  caption: string;
  category: 'Тренировки' | 'Залы' | 'Клуб';
  objectPosition: 'object-top' | 'object-center';
}

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 'photo-01',
    src: photoMain,
    alt: 'Отработка приема на красных татами под присмотром тренера в кимоно с черным поясом',
    caption: 'Отработка техники в паре с контролем тренера',
    category: 'Тренировки',
    objectPosition: 'object-top',
  },
  {
    id: 'photo-02',
    src: photo1,
    alt: 'Тренер с черным поясом помогает юным спортсменам освоить правильный захват на ковре',
    caption: 'Индивидуальный разбор техники и постановка захвата',
    category: 'Тренировки',
    objectPosition: 'object-top',
  },
  {
    id: 'photo-03',
    src: photo2,
    alt: 'Вечерний фасад спортивного клуба Татами с подсвеченной вывеской по адресу ул. Гагарина, 85',
    caption: 'Вход в клуб «Татами» — ул. Гагарина, 85',
    category: 'Клуб',
    objectPosition: 'object-center',
  },
  {
    id: 'photo-04',
    src: photo3,
    alt: 'Детская тренировка в большом зале с зеркалами и окнами под руководством тренеров',
    caption: 'Групповое занятие с тренерами на ковре',
    category: 'Тренировки',
    objectPosition: 'object-top',
  },
  {
    id: 'photo-05',
    src: photo4,
    alt: 'Борьба на татами во время открытой тренировки в присутствии родителей и тренера',
    caption: 'Практика на ковре и поддержка родителей',
    category: 'Тренировки',
    objectPosition: 'object-top',
  },
  {
    id: 'photo-06',
    src: photo5,
    alt: 'Разминка в кругу на красном татами с тренером и родителями на дне открытых дверей',
    caption: 'Общий сбор и разминка в кругу перед тренировкой',
    category: 'Тренировки',
    objectPosition: 'object-center',
  },
  {
    id: 'photo-07',
    src: photo6,
    alt: 'Первый просторный зал с новыми красными и черными татами, зеркалами и мягкими стеновыми протекторами',
    caption: 'Зал №1: новые татами, зеркала и мягкая защита стен',
    category: 'Залы',
    objectPosition: 'object-center',
  },
  {
    id: 'photo-08',
    src: photo7,
    alt: 'Аккуратный холл и вход в тренировочный зал со скамейками и комфортными раздевалками',
    caption: 'Входная зона, скамейки и путь в раздевалки',
    category: 'Клуб',
    objectPosition: 'object-center',
  },
  {
    id: 'photo-09',
    src: photo8,
    alt: 'Второй просторный тренировочный зал клуба Татами с ровным красным татами и темными стенами',
    caption: 'Зал №2: второе просторное пространство для тренировок',
    category: 'Залы',
    objectPosition: 'object-center',
  },
  {
    id: 'photo-10',
    src: photo9,
    alt: 'Дневной вид здания и вывески Спортивный клуб Татами на улице Гагарина в Жуковском',
    caption: 'Вход в клуб со стороны ул. Гагарина, 85',
    category: 'Клуб',
    objectPosition: 'object-center',
  },
];
