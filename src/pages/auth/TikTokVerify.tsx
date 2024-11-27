import { useEffect } from 'react';

export function TikTokVerify() {
  useEffect(() => {
    // Set content type to text/plain
    document.contentType = 'text/plain';
    
    // Remove any existing content
    document.body.innerHTML = '';
    
    // Add the verification text directly
    document.body.textContent = 'tiktok-developers-site-verification=xZxmJOZgjtam6ki6Jsi7bQfGyEUhdyLW';
  }, []);

  return null;
}
