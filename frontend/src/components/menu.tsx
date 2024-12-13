import { NavLink } from "react-router-dom";
import iRobot from '../assets/iRobot.png';

interface NavItemProps {
  to: string;
  label: string;
  icon: JSX.Element;
}

// Componente Logo
const Logo = () => {
  return (
    <div className="flex items-center justify-center pt-6">
        <img src={iRobot} alt="Logo" width={150} height={150}/>
    
    </div>
  );
};

const NavItem = ({ to, label, icon }: NavItemProps) => {
    return (
      <NavLink
        to={to}
        className={({ isActive }) =>
          isActive
            ? 'flex items-center justify-start w-full p-4 my-2 font-thin text-green-500 uppercase transition-colors duration-200 bg-gradient-to-r from-white to-green-100 dark:from-gray-700 dark:to-gray-800 border-r-4 border-green-500'
            : 'flex items-center justify-start w-full p-4 my-2 font-thin text-gray-500 uppercase transition-colors duration-200 hover:text-green-500 dark:hover:bg-gray-800'
        }
      >
        {icon}
        <span className="mx-4 text-sm font-normal">{label}</span>
      </NavLink>
    );
  };
  
// Componente principal do menu
export default function Menu() {
  return (

      <div className="relative hidden h-screen my-4 ml-4 shadow-lg lg:block w-80">
        <div className="h-full bg-white rounded-2xl dark:bg-gray-700">
          <Logo />
          <nav className="mt-6">
            <div>
              <NavItem
                to="/"
                label="Inicio"
                icon={
                  <svg
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 2048 1792"
                  >
                    <path d="M1070 1178l306-564h-654l-306 564h654zm722-282q0 182-71 348t-191 286-286 191-348 71-348-71-286-191-191-286-71-348 71-348 191-286 286-191 348-71 348 71 286 191 191 286 71 348z"></path>
                  </svg>
                }
              />
              <NavItem
                to="/datasets"
                label="Dataset"
                icon={
                  <svg
                    width="20"
                    height="20"
                    fill="currentColor"
                    viewBox="0 0 2048 1792"
                  >
                    <path d="M1024 1131q0-64-9-117.5t-29.5-103-60.5-78-97-28.5q-6 4-30 18t-37.5 21.5-35.5 17.5-43 14.5-42 4.5-42-4.5-43-14.5-35.5-17.5-37.5-21.5-30-18q-57 0-97 28.5t-60.5 78-29.5 103-9 117.5 37 106.5 91 42.5h512q54 0 91-42.5t37-106.5zm-157-520q0-94-66.5-160.5t-160.5-66.5-160.5 66.5-66.5 160.5 66.5 160.5 160.5 66.5 160.5-66.5 66.5-160.5zm925 509v-64q0-14-9-23t-23-9h-576q-14 0-23 9t-9 23v64q0 14 9 23t23 9h576q14 0 23-9t9-23zm0-260v-56q0-15-10.5-25.5t-25.5-10.5h-568q-15 0-25.5 10.5t-10.5 25.5v56q0 15 10.5 25.5t25.5 10.5h568q15 0 25.5-10.5t10.5-25.5zm0-252v-64q0-14-9-23t-23-9h-576q-14 0-23 9t-9 23v64q0 14 9 23t23 9h576q14 0 23-9t9-23zm256-320v1216q0 66-47 113t-113 47h-352v-96q0-14-9-23t-23-9h-64q-14 0-23 9t-9 23v96h-768v-96q0-14-9-23t-23-9h-64q-14 0-23 9t-9 23v96h-352q-66 0-113-47t-47-113v-1216q0-66 47-113t113-47h1728q66 0 113 47t47 113z"></path>
                  </svg>
                }
              />
            </div>
          </nav>
        </div>
      </div>

  );
}
