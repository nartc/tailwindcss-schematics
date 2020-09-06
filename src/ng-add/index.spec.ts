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


const defaultPackages = ['@angular-builders/custom-webpack', 'postcss-import', 'postcss-loader', 'tailwindcss'];

describe('ng add function', () => {
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

  function assertDefaultPackages(packageJson: string) {
    defaultPackages.forEach(pkg => {
      expect(packageJson).toContain(pkg);
    });
  }

  it('should add proper packages to devDependencies with default options', async () => {
    const tree = await schematicRunner.runSchematicAsync('ng-add', options, appTree).toPromise();
    const packageJson = tree.readContent('/package.json');
    expect(packageJson).toBeTruthy();
    assertDefaultPackages(packageJson);
  });

  it('should add proper packages to devDependencies without purgeCSS', async () => {
    options.usePurgeCss = false;
    const tree = await schematicRunner.runSchematicAsync('ng-add', options, appTree).toPromise();
    const packageJson = tree.readContent('/package.json');
    expect(packageJson).toBeTruthy();
    assertDefaultPackages(packageJson);
  });

  it('should add proper packages to devDependencies with each cssFlavor', async () => {
    for (let flavor of ['scss', 'less', 'sass', 'styl']) {
      options.cssFlavor = flavor;
      const tree = await schematicRunner.runSchematicAsync('ng-add', options, appTree).toPromise();
      const packageJson = tree.readContent('/package.json');
      expect(packageJson).toBeTruthy();
      assertDefaultPackages(packageJson);
      expect(packageJson).toContain(`postcss-${ flavor }`);
    }
  });
});
