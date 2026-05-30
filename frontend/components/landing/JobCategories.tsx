const STACK = [
  {
    title: 'Développement Frontend',
    techs: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    color: '#3b82f6',
  },
  {
    title: 'Développement Backend',
    techs: ['Python', 'FastAPI', 'Node.js', 'Express'],
    color: '#8b5cf6',
  },
  {
    title: 'Intelligence Artificielle',
    techs: ['Scikit-Learn', 'TensorFlow', 'PyTorch', 'NLP'],
    color: '#FF6B6B',
  },
  {
    title: 'Bases de données',
    techs: ['PostgreSQL', 'MySQL', 'MongoDB'],
    color: '#10b981',
  },
  {
    title: 'Cloud & DevOps',
    techs: ['Docker', 'GitHub Actions', 'Linux', 'Nginx'],
    color: '#f59e0b',
  },
  {
    title: 'Cybersécurité',
    techs: ['JWT', 'OAuth2', 'HTTPS', 'OWASP'],
    color: '#0D3349',
  },
];

export function JobCategories() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/80" id="stack">
      <div className="max-w-7xl mx-auto">

        <div className="text-center max-w-xl mx-auto mb-4">
          <p className="text-[#FF6B6B] font-semibold text-xs uppercase tracking-widest mb-3">Notre stack technique</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Nos technologies
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Nous utilisons les technologies les plus adaptées à chaque projet afin de garantir performance, évolutivité et qualité.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          {STACK.map((s, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-8 rounded-full" style={{ backgroundColor: s.color }} />
                <h3 className="font-bold text-gray-900 text-sm">{s.title}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {s.techs.map((tech, j) => (
                  <span
                    key={j}
                    className="px-3 py-1 rounded-lg text-xs font-semibold border"
                    style={{
                      backgroundColor: `${s.color}10`,
                      borderColor:     `${s.color}25`,
                      color: s.color === '#0D3349' ? '#334155' : s.color,
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
