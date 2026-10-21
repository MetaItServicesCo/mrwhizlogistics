import SvgIcon, { type SvgIconProps } from "@mui/material/SvgIcon";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import XIcon from "@mui/icons-material/X";
import YouTubeIcon from "@mui/icons-material/YouTube";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import type { SocialPlatformId } from "@/lib/socialLinks";

/** MUI has no TikTok icon. */
function TikTokIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.6 2.6 0 0 1-2.6-2.6 2.6 2.6 0 0 1 3.4-2.47V9.68a5.68 5.68 0 0 0-.8-.06A5.7 5.7 0 0 0 4.15 15.3 5.7 5.7 0 0 0 9.86 21a5.7 5.7 0 0 0 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.25-1.48Z" />
    </SvgIcon>
  );
}

const ICONS = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  linkedin: LinkedInIcon,
  x: XIcon,
  youtube: YouTubeIcon,
  tiktok: TikTokIcon,
  whatsapp: WhatsAppIcon,
} satisfies Record<SocialPlatformId, unknown>;

export default function SocialIcon({ id, ...props }: { id: SocialPlatformId } & SvgIconProps) {
  const Icon = ICONS[id];
  return <Icon {...props} />;
}
