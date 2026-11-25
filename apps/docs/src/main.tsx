import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@desk/ui';
import './docs.css';
import { App } from './App';
import { LocaleProvider } from './site/LocaleProvider';
import { docsMessages } from './site/locale';
import { pickMessages } from '@desk/ui';

const root = document.getElementById('root');
if (!root) throw new Error(pickMessages(docsMessages, navigator.language).docs.mountRootMissing);
createRoot(root).render(
  <StrictMode>
    <LocaleProvider>
      <App />
    </LocaleProvider>
  </StrictMode>,
);
