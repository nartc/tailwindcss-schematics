import { chain, Rule, TaskId } from '@angular-devkit/schematics';
import { NodePackageInstallTask, RunSchematicTask } from '@angular-devkit/schematics/tasks';
import {
  addPackageJsonDependency,
  NodeDependency,
  NodeDependencyType,
  removePackageJsonDependency
} from '@schematics/angular/utility/dependencies';
import { Schema } from './schema';

function addPackageJsonDependencies(options: Schema): Rule {
  const deps = [
    'tailwindcss',
    'postcss-import',
    'postcss-loader',
    '@angular-builders/custom-webpack'
  ];

  if (options.usePurgeCss) {
    deps.push('@fullhuman/postcss-purgecss');
  }

  if (options.cssFlavor !== 'css') {
    deps.push(`postcss-${ options.cssFlavor }`);
  }

  return (tree, _context) => {

    deps.forEach(dep => {
      const nodeDependency: NodeDependency = {
        name: dep,
        version: '0.0.0',
        type: NodeDependencyType.Dev,
        overwrite: false
      };
      addPackageJsonDependency(tree, nodeDependency);
      _context.logger.info(`✅️ Added ${ dep } to devDependencies`);
    });

    // Remove @nartc/tailwind-schematics from dependencies
    removePackageJsonDependency(tree, '@nartc/tailwind-schematics');

    return tree;
  };
}

let installTaskId: TaskId;

function installDependencies(): Rule {
  return (tree, context) => {
    installTaskId = context.addTask(new NodePackageInstallTask());
    context.logger.info('✅️ Installed dependencies');
    return tree;
  };
}

function setupProject(options: Schema): Rule {
  return (tree, context) => {
    context.addTask(new RunSchematicTask('ng-add-setup-project', options), [
      installTaskId
    ]);
    return tree;
  };
}

export default function (options: Schema): Rule {
  return (tree, _context) => {
    return chain([
      addPackageJsonDependencies(options),
      installDependencies(),
      setupProject(options)
    ])(tree, _context);
  };
}
