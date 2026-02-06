import "./globals.css";
import ReactQueryProvider from "./providers/react-query";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-theme="cupcake" className="flex flex-col w-full h-full">
      <body className="flex flex-col w-full h-full">
        <ReactQueryProvider>
          <div className="flex flex-col bg-base-300 w-full h-full">
            {children}
          </div>
        </ReactQueryProvider>
      </body>
    </html>
  );
}