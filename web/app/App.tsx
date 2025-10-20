import { BrowserRouter } from 'react-router-dom';
import App from './root';

export default function Root() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
} 