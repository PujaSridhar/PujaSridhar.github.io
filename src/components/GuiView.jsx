import { portfolioData } from '../../portfolio-data.js';
import { CALENDLY_URL, EMAIL_HREF } from '../constants/terminal.js';
import { formatBreaks } from '../utils/terminalHelpers.js';

const PRIMARY_TABS = ['About', 'Experience', 'Projects', 'Hackathons', 'Skills', 'Contact'];
const SECONDARY_TABS = ['Education', 'Languages', 'Leadership', 'Certifications', 'Talks'];

export function GuiView({ activeTab, onTabChange, footerHtml }) {
  return (
    <div id="gui-mode" className="w-full rounded-lg shadow-2xl shadow-stone-500/20 p-8 overflow-y-auto">
      <div className="gui-tabs-nav">
        {PRIMARY_TABS.map((tab) => (
          <button key={tab} type="button" className={`tab-button ${activeTab === tab ? 'active' : ''}`} onClick={() => onTabChange(tab)}>
            {tab}
          </button>
        ))}
        <div className="gui-tabs-divider" />
        {SECONDARY_TABS.map((tab) => (
          <button key={tab} type="button" className={`tab-button tab-button-secondary ${activeTab === tab ? 'active' : ''}`} onClick={() => onTabChange(tab)}>
            {tab}
          </button>
        ))}
      </div>

      <div className="gui-tabs-content">
        {activeTab === 'About' && (
          <div className="tab-content active">
            <div className="gui-identity">
              <div className="gui-identity-name">Puja Sridhar</div>
              <div className="gui-identity-title">Software & AI Engineer</div>
            </div>
            <p dangerouslySetInnerHTML={{ __html: formatBreaks(portfolioData.about) }} />
          </div>
        )}

        {activeTab === 'Experience' && (
          <div className="tab-content active">
            {portfolioData.experience.map((experience, i) => (
              <div key={`${experience.role}-${experience.company}`} className={`gui-item gui-item-ruled ${i === 0 ? 'gui-item-first' : ''}`}>
                <div className="gui-item-title">
                  <span style={{ color: 'var(--color-accent)' }}>{experience.role}</span> @ {experience.company}
                </div>
                <div style={{ opacity: 0.65, fontSize: '0.85em', marginBottom: '0.75rem' }}>{experience.period}</div>
                {experience.desc.map((point, index) => (
                  <p key={index} style={{ marginBottom: '0.6rem' }}>{point}</p>
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Projects' && (
          <div className="tab-content active">
            <div className="skills-category-title">Featured</div>
            {portfolioData.projects
              .filter((project) => project.featured)
              .map((project) => (
                <div key={project.name} className="gui-item">
                  <div className="gui-item-title">
                    {project.name} <span className="text-sm">({project.tech})</span>
                  </div>
                  {project.desc.map((point, index) => (
                    <p key={`${project.name}-${index}`} style={{ marginBottom: '0.5rem' }} dangerouslySetInnerHTML={{ __html: point }} />
                  ))}
                  {project.screenshots?.length > 0 && (
                    <div className="project-screenshots-gui">
                      {project.screenshots.map((src, index) => (
                        <img key={index} src={src} alt={`${project.name} screenshot`} className="project-screenshot-gui" loading="lazy" />
                      ))}
                    </div>
                  )}
                  <div className="gui-project-links">
                    <a href={project.url} target="_blank" rel="noreferrer" className="link">GitHub</a>
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noreferrer" className="link">Live Demo →</a>
                    )}
                  </div>
                </div>
              ))}

            <div className="skills-category-title">Other Work</div>
            {portfolioData.projects
              .filter((project) => !project.featured)
              .map((project) => (
                <div key={project.name} className="gui-item">
                  <div className="gui-item-title">
                    {project.name} <span className="text-sm">({project.tech})</span>
                  </div>
                  {project.desc.map((point, index) => (
                    <p key={`${project.name}-${index}`} style={{ marginBottom: '0.5rem' }} dangerouslySetInnerHTML={{ __html: point }} />
                  ))}
                  <a href={project.url} target="_blank" rel="noreferrer" className="link">
                    View on GitHub →
                  </a>
                </div>
              ))}
          </div>
        )}

        {activeTab === 'Hackathons' && (
          <div className="tab-content active">
            {portfolioData.hackathons.map((h) => (
              <div key={h.name} className="gui-item">
                <div className="gui-item-title">{h.name} <span className="text-sm">({h.date})</span></div>
                <div className="text-sm" style={{ opacity: 0.7, marginBottom: '0.4rem' }}>{h.team}</div>
                <p>{h.desc}</p>
                <a href={h.url} target="_blank" rel="noreferrer" className="link">GitHub →</a>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Skills' && (
          <div className="tab-content active">
            {Object.entries(portfolioData.skills).map(([category, skills]) => (
              <div key={category}>
                <div className="skills-subcategory-title">{category}</div>
                <div className="skills-grid">
                  {skills.map((skill) => (
                    <div key={skill} className="skill-box">{skill}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Education' && (
          <div className="tab-content active">
            {portfolioData.education.map((education) => (
              <div key={education.school} className="gui-item">
                <div className="gui-item-title">{education.school}</div>
                <div>{education.degree}</div>
                <i>{education.details}</i>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Languages' && (
          <div className="tab-content active">
            {portfolioData.languages.map((language) => (
              <div key={language.lang} className="gui-item">
                <div className="gui-item-title">{language.lang}</div>
                <div>{language.proficiency}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Leadership' && (
          <div className="tab-content active">
            {portfolioData.leadership.map((role) => (
              <div key={`${role.role}-${role.org}`} className="gui-item">
                <div className="gui-item-title">
                  {role.role} | {role.org} ({role.period})
                </div>
                <ul>
                  {role.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Talks' && (
          <div className="tab-content active">
            {portfolioData.talks.map((talk) => (
              <div key={`${talk.title}-${talk.venue}`} className="gui-item">
                <div className="gui-item-title">{talk.title}</div>
                <div>{talk.venue}</div>
                <i>{talk.date}</i>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Certifications' && (
          <div className="tab-content active">
            {portfolioData.certifications.map((certification) => (
              <div key={certification.name} className="gui-item">
                {certification.url ? (
                  <a href={certification.url} className="link">
                    <span className="gui-item-title">{certification.name}</span>
                  </a>
                ) : (
                  <span className="gui-item-title">{certification.name}</span>
                )}
                <span> - {certification.issuer}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Contact' && (
          <div className="tab-content active">
            <div className="gui-item">
              <div className="gui-item-title">Email</div>
              <a href={EMAIL_HREF} className="link">{portfolioData.contact.email}</a>
            </div>
            <div className="gui-item">
              <div className="gui-item-title">LinkedIn</div>
              <a href={portfolioData.contact.linkedin} target="_blank" rel="noreferrer" className="link">{portfolioData.contact.linkedin}</a>
            </div>
            <div className="gui-item">
              <div className="gui-item-title">GitHub</div>
              <a href={portfolioData.contact.github} target="_blank" rel="noreferrer" className="link">{portfolioData.contact.github}</a>
            </div>
            <div className="gui-item">
              <div className="gui-item-title">Schedule a call</div>
              <a href={CALENDLY_URL} target="_blank" rel="noreferrer" className="link">{CALENDLY_URL}</a>
            </div>
            <div className="gui-item">
              <div className="gui-item-title">GitHub Activity</div>
              <a href={portfolioData.contact.github} target="_blank" rel="noreferrer">
                <img
                  src="https://ghchart.rshah.org/5A6050/pujasridhar"
                  alt="Puja Sridhar's GitHub contribution graph"
                  className="github-contribution-graph"
                />
              </a>
            </div>
          </div>
        )}
      </div>

      <div id="gui-footer" dangerouslySetInnerHTML={{ __html: footerHtml }} />
    </div>
  );
}
