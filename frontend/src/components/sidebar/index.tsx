/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState } from 'react';
import { BiLogOut } from 'react-icons/bi';
import { BsFillPersonFill } from 'react-icons/bs';
import { IoChevronForwardSharp } from 'react-icons/io5';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { IoMdRefreshCircle } from "react-icons/io";
import Sidebutton from './Sidebutton';
import { Sidebar } from './styles';
import "./styles.css"



export function SidebarComponent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();




  return (
    <Sidebar>
   <div className="top">
   <img src="/logoItu.jpg" alt="Logo" className="top-image" />
</div>


      <section className="admin-buttons">

        <div className="buttons">



          <Sidebutton tittle="Dashboard" onClick={() => navigate('/')} />

          <Sidebutton tittle="Hóspedes" onClick={() => navigate('/guests')} />

          <Sidebutton tittle="Estoque" onClick={() => navigate('/inventory')} />

          <Sidebutton tittle="Quartos" onClick={() => navigate('/rooms')} />

          <Sidebutton tittle="Reservas" onClick={() => navigate('/reservations')} />

          <Sidebutton tittle="Relatórios" onClick={() => navigate('/relatory')} />

        





        </div>
      </section>
    </Sidebar>
  );
}
