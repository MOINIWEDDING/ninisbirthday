/* Fotos de Nini de niña: recortadas, con borde de sticker y sombrerito de fiesta. */
export const NINI_PHOTOS = {
  "2002": { w: 525, h: 543, alt: "Nini bebé con su chupete", hat: "stripes", hatX: 0.6, hatY: 0.12, hatW: 0.4, hatRot: 16 },
  "2004": { w: 441, h: 565, alt: "Nini de pequeña, sonriendo", hat: "glitter", hatX: 0.6, hatY: 0.17, hatW: 0.46, hatRot: 16 },
  "2006": { w: 539, h: 431, alt: "Nini de niña posando con el brazo arriba", hat: "stars", hatX: 0.53, hatY: 0.19, hatW: 0.33, hatRot: 22 },
  "2008": { w: 434, h: 567, alt: "Nini de niña con sus coletas", hat: "stars", hatX: 0.56, hatY: 0.13, hatW: 0.36, hatRot: 14 },
  "2009": { w: 448, h: 526, alt: "Nini de niña sonriendo con vestido blanco", hat: "glitter", hatX: 0.55, hatY: 0.12, hatW: 0.36, hatRot: 16 },
  "2010": { w: 252, h: 702, alt: "Nini de niña posando en la calle", hat: "glitter", hatX: 0.42, hatY: 0.075, hatW: 0.46, hatRot: 14 },
  "2011": { w: 511, h: 490, alt: "Nini de niña sonriendo en el carro", hat: "stripes", hatX: 0.57, hatY: 0.16, hatW: 0.34, hatRot: 14 },
} as const;

export type NiniPhotoId = keyof typeof NINI_PHOTOS;

export const HAT_SIZE = { glitter: [216, 264], stripes: [216, 260], stars: [216, 262] } as const;
