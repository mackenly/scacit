import fs from 'fs-extra';
import path from 'path';

async function readTemplate(filePath: string, template: string = 'default'): Promise<string> {
    const templatePath = path.join(__dirname, '..', 'templates', template, filePath);
    return fs.readFile(templatePath, 'utf-8');
}

export async function init(template: string = 'default') {
    const projectStructure = {
        'content': {
            'hello-world.md': await readTemplate('content/hello-world.md', template),
            'index.md': await readTemplate('content/index.md', template)
        },
        'components': {
            'header.html': await readTemplate('components/header.html', template),
            'footer.html': await readTemplate('components/footer.html', template)
        },
        'assets': {
            'styles.css': await readTemplate('assets/styles.css', template),
            'scripts.ts': await readTemplate('assets/scripts.ts', template)
        },
        'layout.html': await readTemplate('layout.html', template),
        'scacit.config.ts': await readTemplate('scacit.config.ts', template)
    };

    for (const [name, content] of Object.entries(projectStructure)) {
        if (typeof content === 'string') {
            await fs.outputFile(name, content);
        } else {
            await Promise.all(
                Object.entries(content).map(([subName, subContent]) =>
                    fs.outputFile(path.join(name, subName), subContent)
                )
            );
        }
    }

    console.log('✨ Scacit project initialized successfully!');
}