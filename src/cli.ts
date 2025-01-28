#!/usr/bin / env node
import { Command } from 'commander';
import { init} from './commands/init';
import { build } from './commands/build';
import { dev } from './commands/dev';

const program = new Command();

program
    .name('scacit')
    .description('A modern static site generator')
    .version('0.1.0');

program
    .command('init [template]')
    .description('Initialize a new Scacit project')
    .action((template = 'default') => init(template));

program
    .command('build')
    .description('Build the static site')
    .action(build);

program
    .command('dev')
    .description('Start development server')
    .action(async () => {
        await dev();
    });

program.parse();