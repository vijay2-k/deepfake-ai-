import { createRoot } from 'react-dom/client';
import App, { App as AppNamed } from './App';
import './index.css';

const MainApp = App || AppNamed;

createRoot(document.getElementById('root')!).render(<MainApp />);
