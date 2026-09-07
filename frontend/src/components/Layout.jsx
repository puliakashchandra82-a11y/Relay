import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-navy-950 flex">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 max-w-[1400px] mx-auto w-full">{children}</main>
    </div>
  );
}
