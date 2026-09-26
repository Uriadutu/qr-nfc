import React from 'react';
import {
  FaWhatsapp,
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaEnvelope,
  FaGlobe,
  FaXTwitter,
  FaFacebook,
  FaLinkedin,
  FaGithub,
  FaTelegram,
  FaSpotify,
  FaDiscord,
  FaBagShopping,
} from 'react-icons/fa6';
import { SiShopee, SiGooglemaps } from 'react-icons/si';
import { IconType } from 'react-icons';

export interface PlatformInfo {
  name: string;
  color: string;
  badgeBg: string;
  hoverBorder: string;
  icon: IconType;
}

export const getPlatformInfo = (url = '', title = ''): PlatformInfo => {
  const target = `${url} ${title}`.toLowerCase();

  if (target.includes('wa.me') || target.includes('whatsapp')) {
    return {
      name: 'WhatsApp',
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
      hoverBorder: 'hover:border-emerald-500/40 hover:bg-emerald-500/5',
      icon: FaWhatsapp,
    };
  }
  if (target.includes('instagram.com') || target.includes('instagram') || target.includes('ig.me')) {
    return {
      name: 'Instagram',
      color: 'text-pink-400',
      badgeBg: 'bg-pink-500/10 border-pink-500/25 text-pink-400',
      hoverBorder: 'hover:border-pink-500/40 hover:bg-pink-500/5',
      icon: FaInstagram,
    };
  }
  if (target.includes('tiktok.com') || target.includes('tiktok')) {
    return {
      name: 'TikTok',
      color: 'text-slate-100',
      badgeBg: 'bg-slate-800/80 border-slate-700 text-slate-100',
      hoverBorder: 'hover:border-slate-500/40 hover:bg-slate-800/40',
      icon: FaTiktok,
    };
  }
  if (target.includes('youtube.com') || target.includes('youtu.be') || target.includes('youtube')) {
    return {
      name: 'YouTube',
      color: 'text-red-500',
      badgeBg: 'bg-red-500/10 border-red-500/25 text-red-500',
      hoverBorder: 'hover:border-red-500/40 hover:bg-red-500/5',
      icon: FaYoutube,
    };
  }
  if (
    target.includes('maps.google') ||
    target.includes('goo.gl/maps') ||
    target.includes('maps.app.goo.gl') ||
    target.includes('google maps') ||
    target.includes('lokasi') ||
    target.includes('maps')
  ) {
    return {
      name: 'Google Maps',
      color: 'text-blue-400',
      badgeBg: 'bg-blue-500/10 border-blue-500/25 text-blue-400',
      hoverBorder: 'hover:border-blue-500/40 hover:bg-blue-500/5',
      icon: SiGooglemaps,
    };
  }
  if (target.includes('shopee.co') || target.includes('shopee')) {
    return {
      name: 'Shopee',
      color: 'text-orange-500',
      badgeBg: 'bg-orange-500/10 border-orange-500/25 text-orange-500',
      hoverBorder: 'hover:border-orange-500/40 hover:bg-orange-500/5',
      icon: SiShopee,
    };
  }
  if (target.includes('tokopedia.com') || target.includes('tokopedia')) {
    return {
      name: 'Tokopedia',
      color: 'text-emerald-500',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-500',
      hoverBorder: 'hover:border-emerald-500/40 hover:bg-emerald-500/5',
      icon: FaBagShopping,
    };
  }
  if (target.includes('mailto:') || target.includes('email') || target.includes('@gmail') || target.includes('@yahoo')) {
    return {
      name: 'Email',
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 border-amber-500/25 text-amber-400',
      hoverBorder: 'hover:border-amber-500/40 hover:bg-amber-500/5',
      icon: FaEnvelope,
    };
  }
  if (target.includes('twitter.com') || target.includes('x.com')) {
    return {
      name: 'X / Twitter',
      color: 'text-slate-200',
      badgeBg: 'bg-slate-800/80 border-slate-700 text-slate-200',
      hoverBorder: 'hover:border-slate-500/40 hover:bg-slate-800/40',
      icon: FaXTwitter,
    };
  }
  if (target.includes('facebook.com') || target.includes('fb.com')) {
    return {
      name: 'Facebook',
      color: 'text-blue-500',
      badgeBg: 'bg-blue-600/10 border-blue-500/25 text-blue-500',
      hoverBorder: 'hover:border-blue-500/40 hover:bg-blue-500/5',
      icon: FaFacebook,
    };
  }
  if (target.includes('linkedin.com')) {
    return {
      name: 'LinkedIn',
      color: 'text-sky-400',
      badgeBg: 'bg-sky-500/10 border-sky-500/25 text-sky-400',
      hoverBorder: 'hover:border-sky-500/40 hover:bg-sky-500/5',
      icon: FaLinkedin,
    };
  }
  if (target.includes('github.com')) {
    return {
      name: 'GitHub',
      color: 'text-slate-100',
      badgeBg: 'bg-slate-800 border-slate-700 text-slate-100',
      hoverBorder: 'hover:border-slate-600/40 hover:bg-slate-800/40',
      icon: FaGithub,
    };
  }
  if (target.includes('t.me') || target.includes('telegram')) {
    return {
      name: 'Telegram',
      color: 'text-sky-400',
      badgeBg: 'bg-sky-500/10 border-sky-500/25 text-sky-400',
      hoverBorder: 'hover:border-sky-500/40 hover:bg-sky-500/5',
      icon: FaTelegram,
    };
  }
  if (target.includes('spotify.com')) {
    return {
      name: 'Spotify',
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
      hoverBorder: 'hover:border-emerald-500/40 hover:bg-emerald-500/5',
      icon: FaSpotify,
    };
  }
  if (target.includes('discord.com') || target.includes('discord.gg')) {
    return {
      name: 'Discord',
      color: 'text-indigo-400',
      badgeBg: 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400',
      hoverBorder: 'hover:border-indigo-500/40 hover:bg-indigo-500/5',
      icon: FaDiscord,
    };
  }

  return {
    name: 'Website',
    color: 'text-violet-400',
    badgeBg: 'bg-violet-500/10 border-violet-500/25 text-violet-400',
    hoverBorder: 'hover:border-violet-500/40 hover:bg-violet-500/5',
    icon: FaGlobe,
  };
};

interface LinkIconProps {
  url?: string;
  title?: string;
  className?: string;
}

export const LinkIcon: React.FC<LinkIconProps> = ({ url = '', title = '', className = 'w-4 h-4' }) => {
  const { icon: Icon, color } = getPlatformInfo(url, title);
  return <Icon className={`${color} ${className}`} />;
};
