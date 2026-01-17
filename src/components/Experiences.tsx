import neteaseImg from "@/assets/images/logos/netease.png";
import qunarImg from "@/assets/images/logos/qunar.png";
import neuImg from "@/assets/images/logos/neu.svg";

const experiences = [
  {
    company: "Netease",
    logo: neteaseImg,
    title: "Technical Expert",
    period: "2016 - Present",
    description:
      "Led the development of enterprise-scale web applications, mentored junior developers.",
  },
  {
    company: "Qunar",
    logo: qunarImg,
    title: "Java Developer",
    period: "2015 - 2016",
    description:
      "Developed and maintained multiple client projects, implemented responsive designs.",
  },
  {
    company: "NEU",
    logo: neuImg,
    title: "M.S. in Computer Technology",
    period: "2013 - 2015",
    description:
      "Developed and maintained multiple client projects, implemented responsive designs.",
  },
  {
    company: "NEU",
    logo: neuImg,
    title: "B.S. in Computer Technology",
    period: "2009 - 2013",
    description:
      "Developed and maintained multiple client projects, implemented responsive designs.",
  },
];

export default function Timeline() {
  return (
    <div className="my-6">
      <h5 className="mb-4 text-sm text-graytext font-mono">
        Educations & Experiences
      </h5>
      <div className="relative ml-1">
        <div className="absolute left-0 top-3.5 bottom-0 border-l border-muted" />

        {experiences.map(
          ({ company, logo, description, period, title }, index) => (
            <div
              key={index}
              className="group relative pl-5 pb-1 last:pb-0 py-2"
            >
              <div className="absolute h-2 w-2 -translate-x-1/2 left-px top-2 rounded-full border border-graytext bg-background group-hover:bg-accent" />

              <div className="flex flex-col gap-2 px-4 py-2 -mx-4 hover:bg-card-background hover:rounded-sm">
                <div className="flex items-center gap-2">
                  <img src={logo} width={40} height={40} alt="Logo" />
                  <div>
                    <h3>{company}</h3>
                    <div className="flex items-center text-sm text-graytext">
                      <h3>{title}</h3>
                      <span>, {period}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm">{description}</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
