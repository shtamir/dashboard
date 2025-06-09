export function detectDeviceType(): 'tv' | 'mobile' | 'desktop' {
  const ua = navigator.userAgent.toLowerCase();

  const isAndroid = ua.includes('android');
  const hasMobileToken = /mobile|mobi|touch|mini|windows ce|palm/i.test(ua);

  if (
    ua.includes('smart-tv') ||
    ua.includes('smarttv') ||
    ua.includes('appletv') ||
    ua.includes('googletv') ||
    ua.includes('hbbtv') ||
    ua.includes('netcast') ||
    ua.includes('tizen') ||
    ua.includes('webos') ||
    ua.includes('viera') ||
    ua.includes('nettv') ||
    ua.includes('roku') ||
    ua.includes('aquos') ||
    ua.includes('dtv') ||
    ua.includes('sonydtv') ||
    ua.includes('hisense') ||
    (ua.includes('tv') && !ua.includes('mobile')) ||
    (isAndroid && !hasMobileToken)
  ) {
    return 'tv';
  }

  if (hasMobileToken || (isAndroid && ua.includes('mobile'))) {
    return 'mobile';
  }

  return 'desktop';
}
