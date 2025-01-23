import styled from '@emotion/styled';



export const Sidebar = styled.div`




  width: 12%;
  height: 96%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  overflow: none;
  background-color: #fff;


 

  .top {
    width: 100%;
    height: 15%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    margin-left: -10% ;
  }

  
  .admin-buttons {
    width: 100%;
    height: 60%;
    margin-top: -10%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    border-bottom: 1px solid #e6e6e6;
  }

  .admin-buttons .buttons {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
  }

  .admin-buttons .buttons .sideButton {
    width: 100%;
    height: 20%;
    display: flex;
    font-size: 1rem;
    justify-content: space-between;
    align-items: center;
    border-radius: 5%;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    padding: 0 1rem;
    border: none;
    background-color: #fff;
    &:hover {
      background-color: #e6e6e6;
      transform: scale(1.04);
    }
  }



  

  .user-container .user-container-2 {
    width: 100%;
    height: 4rem;
    display: flex;
    border-radius: 5%;
    justify-content: space-evenly;
    align-items: center;
    cursor: pointer;
  }

  .user-container .user-container-2 .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid #111;
    display: flex;
    justify-content: center;
    align-items: center;

    font-size: 1.5rem;
  }

  .user-container .side-logout {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 24%;
    cursor: pointer;
    transition: 0.2s;

    &:hover {
      transform: scale(1.04);
      font-weight: bold;
    }
  }
`;
