import 'dotenv/config';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI } from '@google/genai';
import { portfolioData } from './portfolio-data.js';

// Initialize clients
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.index('portfolio-rag');

const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });

function splitText(text, maxLength = 500) {
	if (!text) return [];
	if (text.length <= maxLength) return [text.trim()];

	const chunks = [];
	const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);

	for (const paragraph of paragraphs) {
		if (paragraph.length <= maxLength) {
			chunks.push(paragraph);
		} else {
			const sentences = paragraph.match(/[^.!?]+[.!?]*|/g) || [];
			let currentChunk = '';
			for (const sentence of sentences) {
				if ((currentChunk + ' ' + sentence).length > maxLength && currentChunk) {
					chunks.push(currentChunk.trim());
					currentChunk = sentence;
				} else {
					currentChunk += ' ' + sentence;
				}
			}
			if (currentChunk) chunks.push(currentChunk.trim());
		}
	}
	return chunks.filter(c => c.length > 0);
}

async function main() {
	console.log('Starting the indexing process with robust chunking...');
	const chunks = [];

	// 'About' section
	splitText(portfolioData.about).forEach(paragraph => {
		chunks.push({
			text: `About Puja Sridhar: ${paragraph}`,
			source: 'About Me'
		});
	});

	// 'Education' section
	portfolioData.education.forEach(edu => {
		chunks.push({
			text: `Puja's education includes a ${edu.degree} from ${edu.school}, with details: ${edu.details}.`,
			source: 'Education'
		});
	});

	// 'Experience' section
	portfolioData.experience.forEach(exp => {
		const description = `Regarding the role of ${exp.role} at ${exp.company}, key responsibilities and achievements include: ${exp.desc.join(' ')}`;
		splitText(description).forEach(chunk => {
			chunks.push({
				text: chunk,
				source: `Experience: ${exp.role} at ${exp.company}`
			});
		});
	});

	// 'Projects' section
	portfolioData.projects.forEach(proj => {
		const cleanDescription = proj.desc.map(d => d.replace(/<[^>]*>/g, '')).join(' ');
		const text = `Regarding the project "${proj.name}", which uses technologies like ${proj.tech}, the details are: ${cleanDescription}`;
		splitText(text).forEach(chunk => {
			chunks.push({
				text: chunk,
				source: `Project: ${proj.name}`
			});
		});
	});

	// 'Hackathons' section
	portfolioData.hackathons.forEach(h => {
		chunks.push({
			text: `Puja participated in the ${h.name} (${h.date}), ${h.team}. What was built: ${h.desc}`,
			source: `Hackathon: ${h.name}`
		});
	});

	// 'Leadership' section
	portfolioData.leadership.forEach(lead => {
		const points = lead.points.join(' ');
		const text = `In the leadership role of ${lead.role} at ${lead.org}, key accomplishments include: ${points}`;
		splitText(text).forEach(chunk => {
			chunks.push({
				text: chunk,
				source: `Leadership: ${lead.role}`
			});
		});
	});

	// 'Certifications' section
	portfolioData.certifications.forEach(cert => {
		chunks.push({
			text: `Puja holds the certification: "${cert.name}" from ${cert.issuer}.`,
			source: 'Certifications'
		});
	});

	// 'Talks' section
	portfolioData.talks.forEach(talk => {
		chunks.push({
			text: `Puja gave a talk titled "${talk.title}" at ${talk.venue}.`,
			source: 'Talks & Lectures'
		});
	});

	// 'Skills' section
	for (const category in portfolioData.skills) {
		const text = `In the category "${category}", Puja has the following skills: ${portfolioData.skills[category].join(', ')}.`;
		chunks.push({ text: text, source: 'Skills' });
	}

	// 'Languages' section
	const languageString = portfolioData.languages.map(l => `${l.lang} (${l.proficiency})`).join(', ');
	chunks.push({
		text: `Puja speaks the following languages: ${languageString}.`,
		source: 'Languages'
	});

	// 'Contact' section
	const contactInfo = portfolioData.contact;
	chunks.push({
		text: `Contact information for Puja Sridhar: Email is ${contactInfo.email}, LinkedIn profile is at ${contactInfo.linkedin}, and GitHub is ${contactInfo.github}.`,
		source: 'Contact Information'
	});

	const validChunks = chunks.filter(chunk => chunk.text && chunk.text.trim() !== '');
	console.log(`Successfully created ${validChunks.length} valid data chunks.`);

	if (validChunks.length === 0) {
		console.log("No data to index. Exiting.");
		return;
	}

	console.log('\n--- Generating Embeddings One by One ---');
	const allVectors = [];
	for (let i = 0; i < validChunks.length; i++) {
		const chunk = validChunks[i];
		try {
			console.log(`Embedding chunk ${i + 1}/${validChunks.length}: "${chunk.text.substring(0, 70)}..."`);
			const result = await genAI.models.embedContent({
				model: "gemini-embedding-001",
				contents: chunk.text,
				config: { taskType: "RETRIEVAL_DOCUMENT", outputDimensionality: 768 }
			});

			allVectors.push({
				id: `doc-${i}`,
				values: result.embeddings[0].values,
				metadata: { text: chunk.text, source: chunk.source },
			});

		} catch (err) {
			console.error(`Fatal error on chunk #${i}`);
			console.error(`Source: ${chunk.source}`);
			console.error(`Problematic text (len ${chunk.text.length}): ${chunk.text}`);
			console.error("Original error:", err);
			throw new Error("Indexing failed on the chunk logged above.");
		}
	}

	console.log('\nAll embeddings generated successfully. Storing vectors in Pinecone...');

	// Upsert vectors to Pinecone in batches
	for (let i = 0; i < allVectors.length; i += 100) {
		const batch = allVectors.slice(i, i + 100);
		await index.upsert(batch);
		console.log(`Upserted batch ${Math.floor(i / 100) + 1} to Pinecone.`);
	}

	console.log('✅ Successfully indexed all portfolio data!');
}

main().catch(err => {
	console.error("\nAn error occurred during the indexing process:", err.message);
});