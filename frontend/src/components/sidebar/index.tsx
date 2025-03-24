/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useContext, } from 'react';
import {  BsPersonSquare } from 'react-icons/bs';
import { useDispatch} from 'react-redux';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { IoIosBed } from "react-icons/io";
import Sidebutton from './Sidebutton';
import { Sidebar } from './styles';
import "./styles.css"
import { MdOutlineEventAvailable, MdOutlineInventory, MdSpaceDashboard } from 'react-icons/md';
import { FaHome, FaMoon, FaRegMoon } from 'react-icons/fa';
import { TbReport } from 'react-icons/tb';
import { ThemeContext } from "../ThemeContext/ThemeContext";


export function SidebarComponent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const themeContext = useContext(ThemeContext);

  if (!themeContext) {
    throw new Error("useContext must be used within a ThemeProvider");
  }
  const { darkMode, setDarkMode } = themeContext;

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };


  return (
    <Sidebar darkMode={darkMode}>
   <div className="top">
   <img src="/logoItu.jpg" alt="Logo" className="top-image" />
</div>
      <section className="admin-buttons">
        <div className="buttons">
         <Sidebutton  icon={<MdSpaceDashboard />} tittle="Dashboard" onClick={() => navigate('/')}  />
          <Sidebutton icon={<BsPersonSquare />} tittle="Hóspedes" onClick={() => navigate('/guests')} />
          <Sidebutton icon={<MdOutlineInventory/>} tittle="Estoque" onClick={() => navigate('/inventory')} />
          <Sidebutton icon={<IoIosBed />} tittle="Quartos" onClick={() => navigate('/rooms')} />
          <Sidebutton icon={<MdOutlineEventAvailable />}  tittle="Reservas" onClick={() => navigate('/reservations')} />
          <Sidebutton icon={<TbReport/>}  tittle="Relatórios" onClick={() => navigate('/relatory')} />
        </div>
       </section>

       <div className='switch' onClick={toggleDarkMode}>
        {darkMode ? <FaRegMoon />:<FaMoon /> }
      </div>

    </Sidebar>
  );
}
