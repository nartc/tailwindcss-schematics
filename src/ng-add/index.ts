import { chain, Rule, TaskId, Tree } from '@angular-devkit/schematics';
import { NodePackageInstallTask, RunSchematicTask } from '@angular-devkit/schematics/tasks';
import { addPackageJsonDependency, NodeDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';
import { Observable, of } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { getLatestNodeVersion, NpmRegistryPackage } from '../utils/npmjs.util';
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

  // @ts-ignore
  return (tree, _context): Observable<Tree> => {
    return of(...deps).pipe(
      concatMap(getLatestNodeVersion),
      map(({ name, version }: NpmRegistryPackage) => {
        const nodeDependency: NodeDependency = {
          name,
          version,
          type: NodeDependencyType.Dev,
          overwrite: false
        };
        addPackageJsonDependency(tree, nodeDependency);
        _context.logger.info(`✅️ Added ${ name }@${ version } to devDependencies`);
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
      setupProject(options)
    ])(tree, _context);
  };
}
