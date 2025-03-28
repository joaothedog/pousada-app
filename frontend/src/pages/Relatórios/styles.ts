import styled from '@emotion/styled';
type RelatoryProps = {
    darkMode: boolean;  
  };


export const Relatory = styled.div<RelatoryProps>`
    width: 100%;
    height: 90%;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    padding: 10px;
   
    .cadastro-1-relatory{
     background-color: ${({ darkMode }) => (darkMode ? '#333' : '#fff')}; 
    
    }

    .reservation-list{
     background-color: ${({ darkMode }) => (darkMode ? '#333' : '#fff')}; 
      .reservation-item{
       color:${({ darkMode }) => (darkMode ? '#fff' : '#333')};
      }
    }

    input {
    color:${({ darkMode }) => (darkMode ? '#fff' : '#333')};
    background-color: ${({ darkMode }) => (darkMode ? '#333' : '#fff')}; 
      border-color: ${({ darkMode }) => (darkMode ? 'gray' : '#333')}; 
      height:110%;
    }
      
    
      
    
   
 
    
`;