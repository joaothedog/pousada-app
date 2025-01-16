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
        {tittle === 'Chamados' && (
          <div
            style={{
              width: '20px',
              height: '20px',
              background: 'red',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '5px',
              boxShadow: '0px 0px 6px 3px rgba(0, 0, 0, 0.33)',
              marginLeft: '1rem',
            }}
          >
          
          </div>
        )}
      </div>

      <IoChevronForwardSharp />
    </button>
  );
}
