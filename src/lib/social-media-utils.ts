export const getPlatformIcon = (title: string): string => {
    switch (title) {
      case "Instagram":
        return "/icons/instagram.svg";
      case "Twitter":
        return "/icons/twitter-x.svg";
      case "Facebook":
        return "/icons/facebook.svg";
      case "LinkedIn":
        return "/icons/linkedin.svg";
      case "TikTok":
        return "/icons/tiktok.svg";
      default:
        return "/icons/default.svg"; // A default placeholder icon if no match
    }
  };