import { Helmet } from 'react-helmet';
import shortformLogo from '@/assets/icons/shortform-logo.svg';

export function Favicon() {
  return (
    <Helmet>
      <link rel="icon" type="image/svg+xml" href={shortformLogo} />
      <link rel="apple-touch-icon" href={shortformLogo} />
      <meta name="theme-color" content="#FF2E94" />
    </Helmet>
  );
}
