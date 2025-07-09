const About = () => {
    return (
        <section
            id="about"
            data-umami-event="/#about"
            role="region"
            aria-labelledby="about-heading"
            className="min-h-screen px-4 pt-8 pb-20 flex flex-col items-center justify-center text-center"
            style={{ backgroundColor: 'var(--color-surface)' }}>
            <h2
                id="about-heading"
                className="text-3xl md:text-4xl font-bold mb-6"
                style={{ color: 'var(--color-primary)' }}>
                About Me
            </h2>
            <p className="max-w-2xl text-lg leading-relaxed" style={{ color: 'var(--color-text)' }}>
                I’m a software engineer focusing in backend systems with Kotlin and Spring Boot, working across AWS, Terraform, and Docker, through to CI/CD pipelines, and supporting React UI's where needed.</p>
        </section>
    );
};

export default About;