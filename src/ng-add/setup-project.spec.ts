import { PathFragment } from '@angular-devkit/core';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../collection.json');

const workspaceOptions = {
  name: 'workspace',
  newProjectRoot: 'projects',
  version: '6.0.0',
  defaultProject: 'bar',
};

const defaultAppOptions = {
  name: 'bar',
  inlineStyle: false,
  inlineTemplate: false,
  viewEncapsulation: 'Emulated',
  routing: false,
  style: 'css',
  skipTests: false,
};

describe('setup-project', () => {
  let appTree: UnitTestTree;
  let schematicRunner: SchematicTestRunner;
  let options: Schema;

  beforeEach(async () => {
    options = {
      cssFlavor: 'css',
      project: 'bar',
      usePurgeCss: true,
      configDirectory: '.',
      tailwindConfigFileName: 'tailwind.config'
    };
    schematicRunner = new SchematicTestRunner('tailwind-schematics', collectionPath);
    appTree = await schematicRunner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'workspace',
        workspaceOptions
      )
      .toPromise();

    appTree = await schematicRunner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'application',
        defaultAppOptions,
        appTree
      )
      .toPromise();
  });

  it('should create proper config files', async () => {
    const tree = await schematicRunner.runSchematicAsync('ng-add-setup-project', options, appTree).toPromise();
    const configDir = tree.getDir(options.configDirectory);
    expect(configDir).toBeTruthy();
    const configFiles = configDir.subfiles;
    [
      `${ options.tailwindConfigFileName }.js`,
      'webpack-dev.config.js',
      'webpack-prod.config.js'
    ].forEach(configFile => {
      expect(configFiles.includes(configFile as PathFragment)).toBeTrue();
    });
  });

  it('should create proper config files without purgeCSS', async () => {
    options.usePurgeCss = false;
    const tree = await schematicRunner.runSchematicAsync('ng-add-setup-project', options, appTree).toPromise();
    const configDir = tree.getDir(options.configDirectory);
    expect(configDir).toBeTruthy();
    const configFiles = configDir.subfiles;
    [
      `${ options.tailwindConfigFileName }.js`,
      'webpack.config.js'
    ].forEach(configFile => {
      expect(configFiles.includes(configFile as PathFragment)).toBeTrue();
    });
  });

  it('should use custom webpack in angular.json', async () => {
    const tree = await schematicRunner.runSchematicAsync('ng-add-setup-project', options, appTree).toPromise();
    const angularJson = tree.readContent('/angular.json');
    expect(angularJson).toContain('customWebpackConfig');
    const configPath = options.configDirectory === '.' ? '' : (options.configDirectory.substring(2) + '/');
    expect(angularJson).toContain(`${ configPath }webpack-dev.config.js`);
    expect(angularJson).toContain(`${ configPath }webpack-prod.config.js`);
  });

  it('should use custom webpack in angular.json without purgeCSS', async () => {
    options.usePurgeCss = false;
    const tree = await schematicRunner.runSchematicAsync('ng-add-setup-project', options, appTree).toPromise();
    const angularJson = tree.readContent('/angular.json');
    expect(angularJson).toContain('customWebpackConfig');
    const configPath = options.configDirectory === '.' ? '' : (options.configDirectory.substring(2) + '/');
    expect(angularJson).toContain(`${ configPath }webpack.config.js`);
  });

  it('should include Tailwind imports in main styles', async () => {
    const tree = await schematicRunner.runSchematicAsync('ng-add-setup-project', options, appTree).toPromise();
    const styleContent = tree.readContent('/projects/bar/src/styles.css');
    [
      '@import \'tailwindcss/base\'',
      '@import \'tailwindcss/components\'',
      '@import \'tailwindcss/utilities\'',
    ].forEach(i => {
      expect(styleContent).toContain(i);
    });
  });
});
