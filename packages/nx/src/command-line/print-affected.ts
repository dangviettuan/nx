import { getCommandAsString, getOutputs } from '../tasks-runner/utils';
import * as yargs from 'yargs';
import type { NxArgs } from '../utils/command-line-utils';
import { ProjectGraph, ProjectGraphProjectNode } from '../config/project-graph';
import { Task } from '../config/task-graph';
import { ProcessTasks } from '../tasks-runner/create-task-graph';
import { NxJsonConfiguration } from '../config/nx-json';
import { Workspaces } from '../config/workspaces';
import { Hasher } from '../hasher/hasher';
import { hashTask } from '../hasher/hash-task';
import { workspaceRoot } from '../utils/workspace-root';

export async function printAffected(
  affectedProjectsWithTargetAndConfig: ProjectGraphProjectNode[],
  affectedProjects: ProjectGraphProjectNode[],
  projectGraph: ProjectGraph,
  { nxJson }: { nxJson: NxJsonConfiguration },
  nxArgs: NxArgs,
  overrides: yargs.Arguments
) {
  const projectNames = affectedProjects
    .filter((p) => (nxArgs.type ? p.type === nxArgs.type : true))
    .map((p) => p.name);
  const tasksJson = await createTasks(
    affectedProjectsWithTargetAndConfig.filter((p) =>
      nxArgs.type ? p.type === nxArgs.type : true
    ),
    projectGraph,
    nxArgs,
    nxJson,
    overrides
  );
  const result = {
    tasks: tasksJson,
    projects: projectNames,
    projectGraph: serializeProjectGraph(projectGraph),
  };
  if (nxArgs.select) {
    console.log(selectPrintAffected(result, nxArgs.select));
  } else {
    console.log(JSON.stringify(selectPrintAffected(result, null), null, 2));
  }
}

async function createTasks(
  affectedProjectsWithTargetAndConfig: ProjectGraphProjectNode[],
  projectGraph: ProjectGraph,
  nxArgs: NxArgs,
  nxJson: NxJsonConfiguration,
  overrides: yargs.Arguments
) {
  const workspaces = new Workspaces(workspaceRoot);
  const hasher = new Hasher(projectGraph, nxJson, {});

  const tasks: Task[] = affectedProjectsWithTargetAndConfig.map(
    (affectedProject) => {
      const p = new ProcessTasks({}, projectGraph);
      const resolvedConfiguration = p.resolveConfiguration(
        affectedProject,
        nxArgs.target,
        nxArgs.configuration
      );
      return p.createTask(
        p.getId(affectedProject.name, nxArgs.target, resolvedConfiguration),
        affectedProject,
        nxArgs.target,
        resolvedConfiguration,
        overrides
      );
    }
  );

  await Promise.all(
    tasks.map((t) => hashTask(workspaces, hasher, projectGraph, {} as any, t))
  );

  return tasks.map((task, index) => ({
    id: task.id,
    overrides,
    target: task.target,
    hash: task.hash,
    command: getCommandAsString(task),
    outputs: getOutputs(projectGraph.nodes, task),
  }));
}

function serializeProjectGraph(projectGraph: ProjectGraph) {
  const nodes = Object.values(projectGraph.nodes).map((n) => n.name);
  return { nodes, dependencies: projectGraph.dependencies };
}

export function selectPrintAffected(wholeJson: any, wholeSelect: string) {
  if (!wholeSelect) return wholeJson;
  return _select(wholeJson, wholeSelect);

  function _select(json: any, select: string) {
    if (select.indexOf('.') > -1) {
      const [firstKey, ...restKeys] = select.split('.');
      const first = json[firstKey];
      throwIfEmpty(wholeSelect, first);
      const rest = restKeys.join('.');

      if (Array.isArray(first)) {
        return first.map((q) => _select(q, rest)).join(', ');
      } else {
        return _select(first, rest);
      }
    } else {
      const res = json[select];
      throwIfEmpty(wholeSelect, res);
      if (Array.isArray(res)) {
        return res.join(', ');
      } else {
        return res;
      }
    }
  }
}

function throwIfEmpty(select: string, value: any) {
  if (value === undefined) {
    throw new Error(
      `Cannot select '${select}' in the results of print-affected.`
    );
  }
}
