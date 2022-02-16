import { sidebarState } from "@/atoms/sidebarState";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useRecoilValue } from "recoil";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const sidebar = useRecoilValue(sidebarState);

  return (
    <div>
      <main>
        <Sidebar />
        <div
          className={`${
            sidebar.isOpen ? "md:ml-52" : "md:ml-20"
          } ml-0 transition-all  duration-200`}
        >
          <Header />
          <div className="bg-theme mb-8">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
