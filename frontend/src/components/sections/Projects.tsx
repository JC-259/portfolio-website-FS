import { useState, useEffect } from 'react';

type Project = {
  name: string;
  description: string;
  url: string;
  tech: string[];
};

const defaultProjects: Project[] = [
  {
    name: 'Portfolio Website',
    description: 'My personal portfolio website',
    tech: ['React', 'TypeScript', 'AWS', 'TailwindCSS', 'Full Stack'],
    url: "https://github.com/JC-259/portfolio-website-FS"
  },
];

const Projects = () => {
    const [projects, setProjects] = useState<Project[]>(defaultProjects);

    useEffect(() => {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/projects`, {
          method: 'GET',
          headers: {
              'x-api-key': import.meta.env.VITE_API_KEY || '',
          }
      })
          .then(res => res.json())
          .then((data: Project[]) => {
          if (Array.isArray(data) && data.length > 0) {
            setProjects(data);
          }
          })
          .catch(() => {
              setProjects(defaultProjects);
          });
    }, []);

    return (
        <section
            id="projects"
            data-umami-event="/#projects"
            aria-labelledby="projects-heading"
            className="min-h-screen px-4 pt-32 pb-20 flex flex-col justify-center items-center bg-[var(--color-surface)] text-center"
        >
            <h2
                id="projects-heading"
                className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-10"
            >
                Projects
            </h2>

            <div className={`grid gap-8 max-w-6xl mx-auto justify-items-center ${projects.length === 1 ? 'grid-cols-1' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
                {projects.map((project) => (
                    <div
                        key={project.name}
                        aria-label={`Project: ${project.name}`}
                        className="bg-[var(--color-surface)] shadow-md rounded-2xl p-6 flex flex-col justify-between h-full border border-transparent hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition duration-300"
                    >
                        <div>
                            <h3 className="text-xl font-semibold text-[var(--color-primary)]">
                                {project.name}
                            </h3>
                            <p className="text-[var(--color-text)] mt-2">{project.description}</p>
                          <div className="mt-4 flex flex-wrap justify-center w-full text-sm text-[var(--color-primary)] font-medium text-center">
                                {project.tech.map((t) => (
                                    <span
                                        key={t}
                                        className="bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-full px-2 py-1"
                                    >
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <a
                            href={project.url}
                            data-umami-event={`Project Button: ${project.name}`}
                            data-umami-event-url={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-6 inline-block text-[var(--color-primary)] font-semibold hover:underline"
                        >
                            View on GitHub →
                        </a>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Projects;