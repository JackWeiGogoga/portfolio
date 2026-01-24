import React from "react";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

interface ISkill {
  type: string;
  name: string;
  icon: React.ReactNode;
  url?: string;
  level: number;
}

interface SkillProps {
  skills: ISkill[];
  typeLabels?: Record<string, string>;
  emptyText?: string;
}

const renderStars = (level: number) => {
  const stars = [];
  const fullStars = Math.floor(level);
  const hasHalfStar = level % 1 !== 0;
  const emptyStars = 5 - Math.ceil(level);

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(<FaStar key={`full-${i}`} />);
  }

  // Add half star if needed
  if (hasHalfStar) {
    stars.push(<FaStarHalfAlt key="half" />);
  }

  // Add empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<FaRegStar key={`empty-${i}`} />);
  }

  return stars;
};

const Skill: React.FC<SkillProps> = ({ skills, typeLabels, emptyText }) => {
  if (skills.length === 0) {
    return <div>{emptyText ?? "No skills found."}</div>;
  }
  const skillsByType = skills.reduce<Record<string, ISkill[]>>((acc, skill) => {
    const { type } = skill;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(skill);
    return acc;
  }, {});
  return (
    <div className="flex flex-col">
      {Object.entries(skillsByType).map(([type, skillsOfType]) => (
        <div
          key={type}
          className="grid grid-cols-[1fr_2fr] border-b border-gray-300"
        >
          <div className="flex items-center pl-4">
            <h6 className="text-sm text-graytext font-mono">
              {typeLabels?.[type] ?? type}
            </h6>
          </div>
          <div>
            <div className="flex flex-col text-sm gap-3 py-3">
              {skillsOfType.map((skill) => (
                <div key={skill.name} className="grid grid-cols-2">
                  {skill.url && (
                    <a
                      href={skill.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-fit hover:text-graytext"
                    >
                      {skill.icon}
                      {skill.name}
                    </a>
                  )}
                  {!skill.url && (
                    <div className="flex items-center gap-2">
                      {skill.icon}
                      {skill.name}
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-1">
                    {renderStars(skill.level)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Skill;
