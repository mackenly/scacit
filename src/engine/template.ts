import fs from 'fs-extra';
import path from 'path';
import type { ScacitContext } from '../types/config';

export class TemplateEngine {
    private static componentCache = new Map<string, string>();

    static async render(template: string, context: ScacitContext): Promise<string> {
        try {
            template = await this.processComponents(template, context);
            template = this.processConditionals(template, context);
            template = this.processVariables(template, context);
            template = template.replace(/^\s*[\r\n]/gm, '');
            return template;
        } catch (error) {
            return this.handleError(error as Error, template, context);
        }
    }

    private static async processComponents(template: string, context: ScacitContext): Promise<string> {
        const componentRegex = /\{\{\s*component\s+"([^"]+)"(?:\s+([^}]+))?\s*\}\}/g;

        return template.replace(componentRegex, (match, componentName, props) => {
            try {
                // Validate component name
                if (!componentName) {
                    console.warn('Component name is required');
                    return match;
                }

                const componentPath = path.join(process.cwd(), 'components', `${componentName}.html`);

                // Check if component file exists
                if (!fs.existsSync(componentPath)) {
                    console.warn(`Component file not found: ${componentPath}`);
                    return match;
                }

                // Get or cache component content
                if (!this.componentCache.has(componentPath)) {
                    this.componentCache.set(componentPath, fs.readFileSync(componentPath, 'utf-8'));
                }

                const componentContent = this.componentCache.get(componentPath)!;
                const componentContext = { ...context };

                // Process props if they exist
                if (props) {
                    const propsObj = props.split(' ').reduce((acc: any, prop: string) => {
                        try {
                            // Skip empty props
                            if (!prop.trim()) return acc;

                            const [key, ...valueParts] = prop.split('=');
                            if (!key) return acc;

                            // Handle cases where value might contain '=' characters
                            const value = valueParts.join('=');
                            if (!value) return acc;

                            // Clean the key and value
                            const cleanKey = key.trim();
                            const cleanValue = value.trim().replace(/^["']|["']$/g, '');

                            if (cleanKey) {
                                acc[cleanKey] = cleanValue;
                            }

                            return acc;
                        } catch (err) {
                            console.warn(`Error processing prop: ${prop}`, err);
                            return acc;
                        }
                    }, {});

                    Object.assign(componentContext, propsObj);
                }

                return this.processVariables(componentContent, componentContext);
            } catch (error) {
                console.error(`Error processing component ${componentName}:`, error);
                return match; // Return original content on error
            }
        });
    }

    private static processConditionals(template: string, context: ScacitContext): string {
        // Process if-else blocks
        const elseRegex = /{{\s*if\s+([^}]+)\s*}}([\s\S]*?){{\s*else\s*}}([\s\S]*?){{\s*endif\s*}}/g;
        template = template.replace(elseRegex, (match, condition, ifContent, elseContent) => {
            const result = this.evaluateExpression(condition, context);
            return result ? ifContent : elseContent;
        });

        // Process regular if blocks
        const ifRegex = /{{\s*if\s+([^}]+)\s*}}([\s\S]*?){{\s*endif\s*}}/g;
        template = template.replace(ifRegex, (_, condition, content) => {
            const result = this.evaluateExpression(condition, context);
            return result ? content : '';
        });

        return template;
    }

    private static processVariables(template: string, context: ScacitContext): string {
        const variableRegex = /\{\{\s*([^\}]+)\s*\}\}/g;

        return template.replace(variableRegex, (match, path) => {
            try {
                const value = this.evaluateExpression(path.trim(), context);
                return value !== undefined && value !== null ? String(value) : '';
            } catch (error) {
                console.error(`Error processing variable ${path}:`, error);
                return '';
            }
        });
    }

    private static evaluateExpression(expression: string, context: ScacitContext): any {
        // Handle literal values
        if (expression.startsWith('"') && expression.endsWith('"')) {
            return expression.slice(1, -1);
        }
        if (!isNaN(Number(expression))) {
            return Number(expression);
        }
        if (expression === 'true') return true;
        if (expression === 'True') return true;
        if (expression === 'false') return false;
        if (expression === 'False') return false;

        // Handle comparison operators
        if (expression.includes(' == ')) {
            const [left, right] = expression.split(' == ').map(e => this.evaluateExpression(e.trim(), context));
            return left == right;
        }
        if (expression.includes(' != ')) {
            const [left, right] = expression.split(' != ').map(e => this.evaluateExpression(e.trim(), context));
            return left != right;
        }
        if (expression.includes(' > ')) {
            const [left, right] = expression.split(' > ').map(e => this.evaluateExpression(e.trim(), context));
            return left > right;
        }
        if (expression.includes(' < ')) {
            const [left, right] = expression.split(' < ').map(e => this.evaluateExpression(e.trim(), context));
            return left < right;
        }

        // Handle logical operators
        if (expression.includes(' && ')) {
            return expression.split(' && ')
                .map(e => this.evaluateExpression(e.trim(), context))
                .every(Boolean);
        }
        if (expression.includes(' || ')) {
            return expression.split(' || ')
                .map(e => this.evaluateExpression(e.trim(), context))
                .some(Boolean);
        }

        // Handle dot notation for object access
        return expression.split('.').reduce((obj, key) => obj?.[key], context);
    }

    private static handleError(error: Error, template: string, context: ScacitContext): string {
        console.error('Template Error:', {
            message: error.message,
            template: template.slice(0, 100) + '...',
            context: JSON.stringify(context, null, 2).slice(0, 100) + '...',
            stack: error.stack
        });

        if (process.env.NODE_ENV === 'development') {
            return `<div class="template-error">
                <h3>Template Error</h3>
                <pre>${error.message}</pre>
            </div>`;
        }

        return '';
    }
}