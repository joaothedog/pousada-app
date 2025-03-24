import React from 'react';
import AppRouter from './routes/AppRouter';
import './App.css';
import { Provider } from 'react-redux';
import stores from './stores/stores'; // Importa a store configurada
import { ThemeProvider } from "./components/ThemeContext/ThemeContext"

const App: React.FC = () => (


<ThemeProvider>
   {/* Envolvendo o app inteiro com o ThemeProvider */}
    <Provider store={stores}>
    <div className="App">
        <AppRouter />
    </div>
  </Provider>
  </ThemeProvider>
  

  
);

export default App;