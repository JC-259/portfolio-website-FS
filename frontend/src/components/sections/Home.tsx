const Home = () => {
    return (
        <section
            id="home"
            data-umami-event="/#home"
            role="region"
            aria-labelledby="home-heading"
            className="min-h-screen flex flex-col items-center justify-center text-center px-4"
            style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
            }}
        >
            <h1 id="home-heading" className="text-5xl md:text-6xl font-bold mb-4">
                Hey, I'm <span style={{ color: 'var(--color-primary)' }}>James</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed">
                A Software Engineer with Kotlin & Spring Boot experience: building clean, scalable, and efficient real-world applications.
            </p>
        </section>
    );
};

export default Home;