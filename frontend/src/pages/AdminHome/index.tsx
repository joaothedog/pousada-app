import React, { useEffect, useState } from 'react';
import { AiFillBell, AiOutlinePicture, AiOutlineSearch, AiOutlineUser } from 'react-icons/ai';
import { useDispatch, useSelector } from 'react-redux';
import { PageContainer} from '../../components/PageContainer';
import   '../../services/api';
import { ShowCard } from './Showcard';
import { TopContainer } from './styles';
import './styles.css';
import { CiCircleList } from "react-icons/ci";
import { useNavigate } from 'react-router-dom';
import { SidebarComponent } from '../../components/sidebar/index';
import { Sidebar } from '../../components/sidebar/styles';
import { IoCarSportSharp } from "react-icons/io5";
import { MdSocialDistance } from "react-icons/md";
import { BsPersonSquare } from "react-icons/bs";
import { FaHome } from "react-icons/fa";
import { MdOutlineInventory } from "react-icons/md";
import { MdOutlineEventAvailable } from "react-icons/md";

export function AdminHome() {
  const [open, setOpen] = useState(false);
  const [activeCall, setActiveCall] = useState<any>({});
  const navigate = useNavigate();
  const dispatch = useDispatch();


  





  return (
    
    <PageContainer className='admin' padding="0px"   >
     
     <SidebarComponent  />
      <TopContainer>
      <div className="right">
          <div className="search">
            <input type="text" placeholder="Pesquise aqui.." />
            <AiOutlineSearch />
          </div>
        </div>
      </TopContainer>
     

      <div className='dash' >
        

        <ShowCard title="Hóspedes"  icon={<BsPersonSquare  onClick={() => navigate('/guests')} style={{ cursor: "pointer" }} />} />
        <ShowCard title="Quartos"  icon={<FaHome  onClick={() => navigate('/rooms')} style={{ cursor: "pointer" }} />} />
        <ShowCard title="Estoque"  icon={<MdOutlineInventory  onClick={() => navigate('/inventory')} style={{ cursor: "pointer" }} />} />
        <ShowCard title="Reservas"  icon={<MdOutlineEventAvailable  onClick={() => navigate('/reservations')} style={{ cursor: "pointer" }} />} />
     
      
        
        
       
      </div>

      
    </PageContainer>
  );
}
