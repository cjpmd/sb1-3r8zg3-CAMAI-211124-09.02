export const isMobile = () => {
  const userAgent = navigator.userAgent || navigator.vendor;
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
};

export const isIOS = () => {
  const userAgent = navigator.userAgent || navigator.vendor;
  return /iphone|ipad|ipod/i.test(userAgent.toLowerCase());
};
