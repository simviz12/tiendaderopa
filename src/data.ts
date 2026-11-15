import type { RunwayLook } from "@/components/ui/runway-lookbook"

export const img = (id: string, w = 700, h = 1100) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&crop=faces,center&q=80`

export const WHATSAPP = "#contacto"
export const INSTAGRAM = "#contacto"

export const looks: RunwayLook[] = [
  {
    src: img("1516826957135-700dedea698c"),
    alt: "Buzo oversize y jean roto",
    products: [
      { name: "Buzo Oversize Viper", price: "$129.000", crop: { top: 0.1, bottom: 0.55 } },
      { name: "Jean Destroyed", price: "$149.000", crop: { top: 0.5, bottom: 1 } },
    ],
  },
  {
    src: img("1523398002811-999ca8dec234"),
    alt: "Chaqueta rompevientos negra",
    products: [
      { name: "Rompevientos Night", price: "$189.000", crop: { top: 0.1, bottom: 0.7 } },
      { name: "Camiseta Básica Negra", price: "$69.000", crop: { top: 0.4, bottom: 1 } },
    ],
  },
  {
    src: img("1552374196-1ab2a1c593e8"),
    alt: "Saco de punto y gafas",
    products: [
      { name: "Saco Knit Crown", price: "$139.000", crop: { top: 0.15, bottom: 0.75 } },
      { name: "Gafas Diamond", price: "$59.000", crop: { top: 0.15, bottom: 0.4 } },
    ],
  },
  {
    src: img("1520975954732-35dd22299614"),
    alt: "Chaqueta de cuero y botas",
    products: [
      { name: "Chaqueta Biker", price: "$249.000", crop: { top: 0.2, bottom: 0.6 } },
      { name: "Jogger Cargo", price: "$119.000", crop: { top: 0.5, bottom: 1 } },
    ],
  },
  {
    src: img("1503342217505-b0a15ec3261c"),
    alt: "Camiseta gráfica y jean",
    products: [
      { name: "Tee Good Vibes", price: "$79.000", crop: { top: 0.2, bottom: 0.65 } },
      { name: "Jean Mom Fit", price: "$139.000", crop: { top: 0.55, bottom: 1 } },
    ],
  },
  {
    src: img("1622519407650-3df9883f76a5"),
    alt: "Camiseta negra contraste y jean",
    products: [
      { name: "Tee Contrast Stitch", price: "$85.000", crop: { top: 0.15, bottom: 0.6 } },
      { name: "Jean Straight Azul", price: "$135.000", crop: { top: 0.5, bottom: 1 } },
    ],
  },
]

export const categories = [
  { name: "Camisetas", count: "12 refs", img: img("1618354691373-d851c5c3a990", 900, 1100) },
  { name: "Chaquetas", count: "6 refs", img: img("1611312449408-fcece27cdbb7", 900, 1100) },
  { name: "Jeans", count: "8 refs", img: img("1556905055-8f358a7a47b2", 900, 1100) },
  { name: "Tenis y más", count: "9 refs", img: img("1544441893-675973e31985", 900, 1100) },
]

export type Product = { id: string; name: string; price: string; tag?: string; img: string }

export const products: Product[] = [
  { id: "p1", name: "Tee Original Azul", price: "$89.000", tag: "Nuevo", img: img("1576566588028-4147f3842f27", 640, 800) },
  { id: "p2", name: "Rompevientos Night", price: "$189.000", tag: "Últimas", img: img("1523398002811-999ca8dec234", 640, 800) },
  { id: "p3", name: "Tee Back Print", price: "$85.000", img: img("1564859228273-274232fdb516", 640, 800) },
  { id: "p4", name: "Chaqueta Denim Crown", price: "$219.000", tag: "Nuevo", img: img("1611312449408-fcece27cdbb7", 640, 800) },
  { id: "p5", name: "Tee Good Vibes", price: "$79.000", img: img("1554568218-0f1715e72254", 640, 800) },
  { id: "p6", name: "Tee Negra Logo", price: "$75.000", img: img("1618354691373-d851c5c3a990", 640, 800) },
  { id: "p7", name: "Chaqueta Biker", price: "$249.000", tag: "Drop 01", img: img("1520975954732-35dd22299614", 640, 800) },
  { id: "p8", name: "Buzo Oversize Viper", price: "$129.000", img: img("1516826957135-700dedea698c", 640, 800) },
]
