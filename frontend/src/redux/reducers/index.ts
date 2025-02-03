import { combineReducers } from '@reduxjs/toolkit';



import sidePageReducer from './sidepage.reducer';


const rootReducer = combineReducers({

  sidePageReducer,

});

export default rootReducer;