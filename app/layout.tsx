import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "GoOrDer",
  description: "go order هو نظام طلبات متكامل للمطاعم يتيح لك إدارة طلباتك بكفاءة وسهولة. قم بإنشاء قائمة طعام جذابة، استقبل الطلبات من عملائك، وتابع حالة الطلبات في الوقت الحقيقي. مع go order، يمكنك تحسين تجربة عملائك وزيادة مبيعاتك بكل سهولة.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`$ h-full antialiased`}
    >
      <link rel="icon" type="image/x-icon" href="1775743391580.png"></link>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
