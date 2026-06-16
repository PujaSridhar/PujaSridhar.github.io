import { portfolioData } from '../../portfolio-data.js';
import { CALENDLY_URL, EMAIL_HREF } from '../constants/terminal.js';
import { formatBreaks } from '../utils/terminalHelpers.js';

export function GuiView({ activeTab, onTabChange, footerHtml }) {
  const tabs = ['About', 'Experience', 'Projects', 'Skills', 'Education', 'Languages', 'Leadership', 'Certifications', 'Talks', 'Contact'];

  return (
    <div id="gui-mode" className="w-full rounded-lg shadow-2xl shadow-stone-500/20 p-8 overflow-y-auto">
      <div className="gui-tabs-nav">
        {tabs.map((tab) => (
          <button key={tab} type="button" className={`tab-button ${activeTab === tab ? 'active' : ''}`} onClick={() => onTabChange(tab)}>
            {tab}
          </button>
        ))}
      </div>

      <div className="gui-tabs-content">
        {activeTab === 'About' && (
          <div className="tab-content active">
            <p dangerouslySetInnerHTML={{ __html: formatBreaks(portfolioData.about) }} />
          </div>
        )}

        {activeTab === 'Experience' && (
          <div className="tab-content active">
            {portfolioData.experience.map((experience) => (
              <div key={`${experience.role}-${experience.company}`} className="gui-item">
                <div className="gui-item-title">
                  {experience.role} @ {experience.company} ({experience.period})
                </div>
                <ul>
                  {experience.desc.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
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
                  <ul>
                    {project.desc.map((point, index) => (
                      <li key={`${project.name}-${index}`} dangerouslySetInnerHTML={{ __html: point }} />
                    ))}
                  </ul>
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
                  <ul>
                    {project.desc.map((point, index) => (
                      <li key={`${project.name}-${index}`} dangerouslySetInnerHTML={{ __html: point }} />
                    ))}
                  </ul>
                  <a href={project.url} target="_blank" rel="noreferrer" className="link">
                    View on GitHub -&gt;
                  </a>
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
                    <div key={skill} className="skill-box">
                      {skill}
                    </div>
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
