import { chain, Rule, TaskId } from '@angular-devkit/schematics';
import { NodePackageInstallTask, RunSchematicTask } from '@angular-devkit/schematics/tasks';
import { addPackageJsonDependency, NodeDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';
import { of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { Schema } from './schema';
import { getLatestNodeVersion, NodePackage } from './utils';

function addPackageJsonDependencies(options: Schema): Rule {
  const deps = [
    'tailwindcss',
    'postcss-import',
    'postcss-loader',
    '@angular-builders/custom-webpack'
  ];

  if (options.cssFlavor !== 'css') {
    deps.push(`postcss-${ options.cssFlavor }`);
  }

  return (tree, _context): any => {
    return of(...deps).pipe(
      concatMap(dep => getLatestNodeVersion(dep)),
      map(({ name, version }: NodePackage) => {
        _context.logger.info(`✅️ Added ${ name }@${ version } to ${ NodeDependencyType.Dev }`);
        const nodeDependency: NodeDependency = {
          name,
          version,
          type: NodeDependencyType.Dev,
          overwrite: false
        };
        addPackageJsonDependency(tree, nodeDependency);
        return tree;
      })
    );
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
      setupProject(options),
    ])(tree, _context);
  };
}
