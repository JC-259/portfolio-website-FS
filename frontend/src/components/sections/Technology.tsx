import { SiKotlin, SiSpringboot, SiTerraform, SiDocker, SiReact, SiTypescript } from 'react-icons/si';
import { FaAws } from 'react-icons/fa';
import { TbArrowsShuffle } from 'react-icons/tb';

const tech = [
  { name: 'Kotlin', icon: SiKotlin },
  { name: 'Spring Boot', icon: SiSpringboot },
  { name: 'AWS', icon: FaAws },
  { name: 'Terraform', icon: SiTerraform },
  { name: 'Docker', icon: SiDocker },
  { name: 'CI/CD', icon: TbArrowsShuffle },
  { name: 'React JS', icon: SiReact },
  { name: 'JS & TS', icon: SiTypescript }
];

const Technology = () => {
    return (
        <section
            id="technology"
            data-umami-event="/#technology"
            aria-labelledby="technology-heading"
            className="min-h-screen px-4 pt-32 pb-20 flex flex-col items-center justify-center bg-[var(--color-surface)] text-[var(--color-text)] text-center"
        >
            <h2 id="technology-heading" className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-10">
                Technology
            </h2>
            <div className="max-w-4xl mx-auto px-4 sm:px-8">
                <div
                    className="mt-2 flex flex-wrap justify-center gap-x-0 gap-y-6 text-[var(--color-primary)] dark:text-white font-semibold tracking-wide max-w-[26rem] sm:max-w-[36rem] md:max-w-[48rem] lg:max-w-[64rem] mx-auto">
                    {tech.map(({name, icon}) => (
                        <div
                            key={name}
                            aria-label={name}
                            className="flex flex-col items-center w-1/2 p-4 sm:w-52 transition-transform duration-200 hover:scale-110 hover:z-20 border border-transparent hover:border-[var(--color-primary)] hover:bg-[var(--color-hover)] bg-[var(--color-box)] dark:bg-[var(--color-box-dark)] backdrop-blur-md rounded-2xl"
                        >
                            <span className="text-4xl" aria-label={name}>
                              {icon({ className: 'text-4xl', 'aria-label': name })}
                            </span>
                            <span className="mt-1 text-center">{name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Technology;