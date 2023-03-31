import type { ProjectConfiguration, Tree } from '@nrwl/devkit';
import {
  formatFiles,
  generateFiles,
  getProjects,
  joinPathFragments,
  names,
  readNxJson,
  readProjectConfiguration,
} from '@nrwl/devkit';
import type { Schema } from './schema';
import { checkPathUnderProjectRoot } from '../utils/path';
import { addToNgModule, findModule } from '../utils';

let tsModule: typeof import('typescript');

export async function directiveGenerator(tree: Tree, schema: Schema) {
  const projects = getProjects(tree);
  if (!projects.has(schema.project)) {
    throw new Error(`Project "${schema.project}" does not exist!`);
  }

  checkPathUnderProjectRoot(tree, schema.project, schema.path);

  const project = readProjectConfiguration(
    tree,
    schema.project
  ) as ProjectConfiguration & { prefix?: string };

  const path = schema.path ?? `${project.sourceRoot}`;
  const directiveNames = names(schema.name);
  const selector =
    schema.selector ??
    buildSelector(tree, schema.name, schema.prefix ?? project.prefix);

  const pathToGenerateFiles = schema.flat
    ? './files/__directiveFileName__'
    : './files';
  await generateFiles(
    tree,
    joinPathFragments(__dirname, pathToGenerateFiles),
    path,
    {
      selector,
      directiveClassName: directiveNames.className,
      directiveFileName: directiveNames.fileName,
      standalone: schema.standalone,
      tpl: '',
    }
  );

  if (schema.skipTests) {
    const pathToSpecFile = joinPathFragments(
      path,
      `${!schema.flat ? `${directiveNames.fileName}/` : ``}${
        directiveNames.fileName
      }.directive.spec.ts`
    );

    tree.delete(pathToSpecFile);
  }

  if (!schema.skipImport && !schema.standalone) {
    const modulePath = findModule(tree, path, schema.module);
    addToNgModule(
      tree,
      path,
      modulePath,
      directiveNames.fileName,
      `${directiveNames.className}Directive`,
      `${directiveNames.fileName}.directive`,
      'declarations',
      schema.flat,
      schema.export
    );
  }

  if (!schema.skipFormat) {
    await formatFiles(tree);
  }
}

function buildSelector(tree: Tree, name: string, prefix: string) {
  let selector = names(name).fileName;
  const selectorPrefix = names(prefix ?? readNxJson(tree).npmScope).fileName;

  return names(`${selectorPrefix}-${selector}`).propertyName;
}

export default directiveGenerator;
