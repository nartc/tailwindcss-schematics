import { normalize } from '@angular-devkit/core';
import { apply, applyTemplates, chain, mergeWith, move, Rule, url } from '@angular-devkit/schematics';
import { getProjectFromWorkspace, getProjectStyleFile, getTargetsByBuilderName } from '@angular/cdk/schematics';
import { InsertChange } from '@schematics/angular/utility/change';
import { getWorkspace, updateWorkspace } from '@schematics/angular/utility/config';
import { Builders } from '@schematics/angular/utility/workspace-models';
import { Schema } from './schema';

function addConfigFiles(options: Schema): Rule {
  return (tree, context) => {
    const templateSource = apply(url('./files'), [
      applyTemplates({
        cssFlavor: options.cssFlavor,
      }),
      move(normalize('./'))
    ]);

    return mergeWith(templateSource)(tree, context);
  };
}

function updateAngularJson(options: Schema): Rule {
  return (tree, context) => {
    const workspace = getWorkspace(tree);
    const project = getProjectFromWorkspace(workspace, options.project);
    const browserTargets = getTargetsByBuilderName(project, Builders.Browser);
    const devServerTargets = getTargetsByBuilderName(project, Builders.DevServer);

    for (const devServerTarget of devServerTargets) {
      devServerTarget.builder = '@angular-builders/custom-webpack:dev-server';
    }

    for (const browserTarget of browserTargets) {
      browserTarget.builder = '@angular-builders/custom-webpack:browser';
      browserTarget.options = {
        customWebpackConfig: {
          path: './webpack.config.js'
        },
        ...browserTarget.options as any
      };
    }

    return updateWorkspace(workspace)(tree, context);
  };
}

function updateProjectStylesFile(options: Schema): Rule {
  return (tree, context) => {
    const workspace = getWorkspace(tree);
    const project = getProjectFromWorkspace(workspace, options.project);
    const stylePath = getProjectStyleFile(project, options.cssFlavor);

    if (!stylePath) {
      context.logger.error(`Cannot update project styles file: Style path not found`);
      return tree;
    }

    const insertion = new InsertChange(stylePath!, 0, getTailwindImports());
    const recorder = tree.beginUpdate(stylePath!);
    recorder.insertLeft(insertion.pos, insertion.toAdd);
    tree.commitUpdate(recorder);

    return tree;
  };
}

function getTailwindImports(): string {
  return `
@import 'tailwindcss/base';
@import 'tailwindcss/utilities';

`;
}

export default function (options: Schema): Rule {
  return (tree, context) => {
    return chain([
      addConfigFiles(options),
      updateAngularJson(options),
      updateProjectStylesFile(options)
    ])(tree, context);
  };
}
