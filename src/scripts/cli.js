import program     from 'commander';
import { compile } from './index';
import { version } from '../../package.json';

program
.version(version);

program
.command('start')
.option('--src <folder>', 'set resource folder')
.option('--dist <folder>', 'set target folder')
.option('--style <folder>', 'set style folder')
.option('--script <folder>', 'set script folder')
.option('--template <folder>', 'set tempate folder')
.option('--watch', 'listen file changed')
.action(compile.bind(null));

program.parse(process.argv);
