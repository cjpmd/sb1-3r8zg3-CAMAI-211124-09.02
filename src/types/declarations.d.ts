// Type declarations for external modules

declare module 'facebook-nodejs-business-sdk' {
  export class FacebookAdsApi {
    static init(accessToken: string): void;
  }
  export class Page {
    constructor(id: string);
    createPhoto(fields: string[], params: any): Promise<any>;
    createVideo(fields: string[], params: any): Promise<any>;
  }
}

declare module 'react-router-dom' {
  export function useNavigate(): (path: string) => void;
  export function useSearchParams(): [URLSearchParams, (params: URLSearchParams) => void];
  export function Navigate(props: { to: string; replace?: boolean }): JSX.Element;
}

declare module '@hookform/resolvers/zod' {
  export function zodResolver(schema: any): any;
}

declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '@radix-ui/react-checkbox';
declare module '@radix-ui/react-label';
declare module '@radix-ui/react-popover';
declare module '@radix-ui/react-scroll-area';
declare module '@radix-ui/react-select';
declare module '@radix-ui/react-slider';
declare module '@radix-ui/react-tabs';
declare module '@radix-ui/react-toast';

declare interface Window {
  api?: {
    send: (channel: string, data: any) => void;
    receive: (channel: string, func: Function) => void;
    invoke: (channel: string, data: any) => Promise<any>;
  };
}
