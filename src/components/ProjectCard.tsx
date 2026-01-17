import { Link } from "react-router-dom";
import { useMemo } from "react";
import { formatEther } from "viem";
import { Campaign } from "@/types";
import {
  CAMPAIGN_STATE_TEXT,
  CAMPAIGN_STATE_COLORS,
  ROUTES,
} from "@/config/constants";
import { Badge } from "@/components/ui/badge";
import {
  ProjectCard as ProjectCardUI,
  ProjectCardContent,
} from "@/components/ui/project-card";
import {
  ethereumIcon,
  optimismIcon,
  polygonIcon,
  arbitrumIcon,
  baseIcon,
} from "@/config/chainIcons";
import { ProjectIcon } from "@/components/IpfsImage";

interface ProjectCardProps {
  campaign: Campaign;
}

export default function ProjectCard({ campaign }: ProjectCardProps) {
  // campaign.icon = "https://euc.li/gogoga.eth";

  const { randomPercentage, supportedIcons } = useMemo(() => {
    const hashCode = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash);
    };

    const hash = hashCode(campaign.address || "0x0");

    const normalizedHash = (hash % 10000) / 10000;
    const percentage = (normalizedHash * (1 - 0.01) + 0.01).toFixed(2);

    const allIcons = [optimismIcon, polygonIcon, arbitrumIcon, baseIcon];

    const hash2 = hashCode((campaign.address || "0x0") + "icons");
    const isMajority = hash2 % 100 < 80; // 80%
    const additionalIconCount = isMajority ? 1 : hash2 % 2 === 0 ? 1 : 2;

    const selectedIcons: string[] = [];
    for (let i = 0; i < additionalIconCount; i++) {
      const iconHash = hashCode((campaign.address || "0x0") + i);
      const iconIndex = iconHash % allIcons.length;
      const icon = allIcons[iconIndex];
      if (icon && !selectedIcons.includes(icon)) {
        selectedIcons.push(icon);
      } else {
        const nextIcon = allIcons[(iconIndex + 1) % allIcons.length];
        if (nextIcon && !selectedIcons.includes(nextIcon)) {
          selectedIcons.push(nextIcon);
        }
      }
    }

    const icons = [ethereumIcon, ...selectedIcons];

    return {
      randomPercentage: percentage,
      supportedIcons: icons,
    };
  }, [campaign.address]);

  return (
    <Link
      to={`${ROUTES.PROJECT_DETAIL}/${campaign.address}`}
      className="no-underline"
    >
      <ProjectCardUI hover className="relative">
        <ProjectCardContent className="flex items-center gap-4">
          <Badge
            className={`absolute top-2 right-2 ${
              CAMPAIGN_STATE_COLORS[campaign.state]
            }`}
          >
            {CAMPAIGN_STATE_TEXT[campaign.state]}
          </Badge>
          <div className="mr-5">
            <ProjectIcon src={campaign.icon} alt={campaign.name} size="md" />
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="m-0 flex items-center gap-2 leading-8 text-lg">
              {campaign.name}
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-primary">
                Ξ{formatEther(campaign.balance)}
              </span>
              <span className="text-muted-foreground">last 7 days</span>
              <span className="text-[#f5a312]">+{randomPercentage}%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">
                {(campaign.backerCount + campaign.customBackerCount).toString()}{" "}
                payments
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {supportedIcons.map((icon, index) => (
                <img key={index} src={icon} className="w-5 h-5" alt="" />
              ))}
            </div>
          </div>
        </ProjectCardContent>
      </ProjectCardUI>
    </Link>
  );
}
