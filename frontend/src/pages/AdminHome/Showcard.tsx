import { ReactNode } from 'react';

import { CardContainer } from './styles';

interface ShowCardProps {
  title: string;
  icon: ReactNode;
}

export function ShowCard({ title,  icon }: ShowCardProps) {
  return (
    <CardContainer style={{ height: '80px' }}>
      <div className="icon">{icon}</div>
      <div className="desc">
        <h1>{title}</h1>
       
      </div>
    </CardContainer>
  );
}
