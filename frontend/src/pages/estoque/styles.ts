import styled from '@emotion/styled';

type ContainerrProps = {
  darkMode: boolean;  
};
type MainProps = {
  darkMode: boolean;  
};

type ModalProps = {
  darkMode: boolean;  
};



export const Modal = styled.div<ModalProps>`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    padding: 10px;

    .modal-content {
    background-color: ${({ darkMode }) => (darkMode ? '#333' : '#fff')}; 

    .baixas-list{
      background-color: ${({ darkMode }) => (darkMode ? '#333' : '#fff')};
    }
     .reduction-item{
      color: ${({ darkMode }) => (darkMode ? '#fff' : '#333')};
     }
    }

    input {
    color:${({ darkMode }) => (darkMode ? '#fff' : '#333')};
    background-color: ${({ darkMode }) => (darkMode ? '#333' : '#fff')}; 
      border-color: ${({ darkMode }) => (darkMode ? 'gray' : '#333')}; 
      height:110%;
    }

     select {
    color:${({ darkMode }) => (darkMode ? '#fff' : '#333')};
    background-color: ${({ darkMode }) => (darkMode ? '#333' : '#fff')}; 
      border-color: ${({ darkMode }) => (darkMode ? 'gray' : '#333')}; 
      height:110%;
    }
      
      
    .divider-vertical{
     background-color: ${({ darkMode }) => (darkMode ? 'gray' : 'ccc')}; 
    }
      .divider-horizontal{
     background-color: ${({ darkMode }) => (darkMode ? 'gray' : 'ccc')}; 
    }
    
   
 
    
`;



export const Main = styled.div<MainProps>`
    width: 100%;
    height: 90%;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    padding: 10px;

    input {
    color:${({ darkMode }) => (darkMode ? '#fff' : '#333')};
    background-color: ${({ darkMode }) => (darkMode ? '#333' : '#fff')}; 
      border-color: ${({ darkMode }) => (darkMode ? 'gray' : '#333')}; 
      height:110%;
    }

     select {
    color:${({ darkMode }) => (darkMode ? '#fff' : '#333')};
    background-color: ${({ darkMode }) => (darkMode ? '#333' : '#fff')}; 
      border-color: ${({ darkMode }) => (darkMode ? 'gray' : '#333')}; 
      height:110%;
    }


      
      
    
   
 
    
`;

export const Container = styled.div`


  width: 100%;
  height: 90%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;

  > *:hover {
    transform: scale(1.1);
    transition: 0.5s;
  }
`;

export const Containerr = styled.div<ContainerrProps>`
 
  display: flex;
  border-radius:3px;
  flex-direction: row;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
  margin-top: 20px;
  .image {
    
    width: 20%;
    height: 100%;
    img {
      width: 100%;
      height: 100%;
      margin-top: -7%;
    }
  }

    .lixeira-inv{
  color: ${({ darkMode }) => (darkMode ? '#fff' : '#333')}; 
   &:hover{
      color: #800000;
      cursor:pointer;
    }
  }

    .edit-inv {
  color: ${({ darkMode }) => (darkMode ? '#fff' : '#333')}; 
   &:hover{
      color:#007bff ;
      cursor:pointer;
    }
  }
  
  
    
  .row {
    padding: 0 10px;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    .status {
      height: 50%;
      border-radius: 5px;
      width: 20%;
      display: flex;
      align-items: center;
      justify-content: center;
     
      color: #fff;

      
      
    }
    
  }
   }
`;
