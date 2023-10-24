import { ReactElement } from "react";
import Navbar from "../Navbar";
import Toolbar from "../Toolbar";

interface Props {
  children: ReactElement;
}

const Layout: React.FC<Props> = ({ children }) => {
  return (
    <>
      <Navbar />
      <div className="w-navbar text-white">
        <Toolbar />
        <div className="h-full overflow-auto">
          <div className="mt-30">{children}</div>
        </div>
      </div>
    </>
  );
};

export default Layout;