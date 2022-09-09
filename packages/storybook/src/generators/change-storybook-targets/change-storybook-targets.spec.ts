import { readWorkspaceConfiguration, Tree, writeJson } from '@nrwl/devkit';
import { createTreeWithEmptyV1Workspace } from '@nrwl/devkit/testing';
import changeStorybookTargetsGenerator from './change-storybook-targets';
import * as defaultConfig from './test-configs/default-config.json';
import * as customNames from './test-configs/custom-names-config.json';
import * as nonAngular from './test-configs/non-angular.json';
import * as extraOptions from './test-configs/extra-options-for-storybook.json';
import * as noStorybookBuildTarget from './test-configs/no-build-storybook-target.json';
import * as noStorybook from './test-configs/no-storybook-targets.json';

describe('Change the Storybook targets for Angular projects to use native Storybooke executor', () => {
  let tree: Tree;

  describe('for all types of angular projects - non-buildable and buildable libs/apps', () => {
    beforeEach(async () => {
      tree = createTreeWithEmptyV1Workspace();
    });

    it(`should set the browserTarget correctly in the Storybook config according to the type of project`, async () => {
      writeJson(tree, 'workspace.json', defaultConfig);
      await changeStorybookTargetsGenerator(tree);
      expect(readWorkspaceConfiguration(tree)).toMatchSnapshot();
    });

    it(`should set the browserTarget correctly even if target names are not the default`, async () => {
      writeJson(tree, 'workspace.json', customNames);
      await changeStorybookTargetsGenerator(tree);
      expect(readWorkspaceConfiguration(tree)).toMatchSnapshot();
    });

    it(`should keep any extra options added in the target`, async () => {
      writeJson(tree, 'workspace.json', extraOptions);
      await changeStorybookTargetsGenerator(tree);
      expect(readWorkspaceConfiguration(tree)).toMatchSnapshot();
    });
    it(`should work even if build-storybook does not exist`, async () => {
      writeJson(tree, 'workspace.json', noStorybookBuildTarget);
      await changeStorybookTargetsGenerator(tree);
      expect(readWorkspaceConfiguration(tree)).toMatchSnapshot();
    });

    it(`should not throw an error if no Storybook exists`, async () => {
      writeJson(tree, 'workspace.json', noStorybook);
      await changeStorybookTargetsGenerator(tree);
      expect(readWorkspaceConfiguration(tree)).toMatchSnapshot();
    });
  });

  describe('for non-angular projects', () => {
    beforeEach(async () => {
      tree = createTreeWithEmptyV1Workspace();
      writeJson(tree, 'workspace.json', nonAngular);
    });

    it(`should not change their Storybook targets`, async () => {
      await changeStorybookTargetsGenerator(tree);
      expect(readWorkspaceConfiguration(tree)).toMatchSnapshot();
    });
  });
});
