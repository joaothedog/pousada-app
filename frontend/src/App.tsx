import React from 'react';
import AppRouter from './routes/AppRouter';
import './App.css';
import { Provider } from 'react-redux';
import stores from './stores/stores'; // Importa a store configurada

const App: React.FC = () => (

    <Provider store={stores}>
    {/* Envolvendo o app inteiro com o Provider */}
    <div className="App">
        <AppRouter />
    </div>
  </Provider>
  

  
);

export default App;