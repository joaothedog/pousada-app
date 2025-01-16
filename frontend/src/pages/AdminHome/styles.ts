import styled from '@emotion/styled';

export const TopContainer = styled.div`
  width: 100%;
  height: 0.4%;
  display: flex;
  justify-content: end;
  padding: 3rem;
  border-bottom: 0.1rem solid #ccc;

  .right {
    display: flex;
    align-items: center;


    .search {
      width: 20rem;
      height: 3rem;
      background-color: #fff;
      display: flex;
      align-items: center;
      border: 1px solid #ccc;
      position: relative;

      input {
        height: 100%;
        width: 100%;
        padding: 0 1rem;
      }

      svg {
        position: absolute;
        top: 50%;
        right: 10px;
        transform: translateY(-50%);
        font-size: 20px;
        color: #ccc;
        pointer-events: none;
        font-size: 1.5rem;
      }
    }

    .notification {
      margin-left: 2rem;
      background-color: #fff;
      width: 3rem;
      height: 3rem;
      border: 1px solid #ccc;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      transition: 0.4s;
      cursor: pointer;

      &:hover {
        color: #111;
        transform: scale(1.04);
      }

      &:hover svg {
        fill: #111;
      }

      svg {
        font-size: 1.5rem;
        fill: #ccc;
        transition: 0.4s;
      }

      .badge {
        position: absolute;
        top: -8px;
        right: -8px;
        background-color: red;
        color: white;
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 50%;
      }
    }
  }
`;



export const CardContainer = styled.div`
  width: 20%;
  height: 10vh;
  margin: 0.5rem;
  background-color: #fff;
  border-radius: 0.5rem;
  display: flex;
  box-shadow: 0 0 0.5rem 0.1rem rgba(0, 0, 0, 0.1);
  transition: all 0.4s ease-in-out;
  &:hover {
    transform: scale(1.02);
  }
  .icon {
    width: 30%;
    height: 100%;
    background-color:#4682B4;
    font-size: 3rem;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
  }


  

  .desc {
    padding: 0.5rem;
  }
`;

export const Content = styled.div`
  width: 100%;
  height: 75vh;
  padding: 1rem;
  display: flex;
`;
