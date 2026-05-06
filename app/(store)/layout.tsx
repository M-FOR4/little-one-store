import { CartProvider } from "@/components/CartProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-[#F9F9FA]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <WhatsAppButton />
        <Footer />
      </div>
    </CartProvider>
  );
}
