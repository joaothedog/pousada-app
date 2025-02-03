import React from 'react';
import { IoChevronForwardSharp } from 'react-icons/io5';
import { useSelector } from 'react-redux';



interface SidebuttonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tittle: string;
}

export default function Sidebutton({ tittle, onClick }: SidebuttonProps) {


  return (
    <button type="button" className="sideButton" onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {tittle}
      </div>

      <IoChevronForwardSharp />
    </button>
  );
}
