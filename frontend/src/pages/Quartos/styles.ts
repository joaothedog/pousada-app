import styled from '@emotion/styled';

export const Container = styled.div`
  width: 100%;
  height: 90%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
      
 
    & :hover{
      transform: scale(1.1);
      transition:0.5s
     
    }
`;

export const Containerr = styled.div <{ isAvailable: boolean }>`
  width: 67%;
  height: 15%;
  display: flex;
  border-radius:3px;
  flex-direction: row;
   background-color: ${(props) => (props.isAvailable ? "#d4edda" : "#ffffff")};
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
