---
title: 'affected:libs - CLI command'
description: 'Print libraries affected by changes'
---

# affected:libs

    **Deprecated:** Use `nx print-affected --type=lib --select=projects` instead. This command will be removed in v15.

    Print libraries affected by changes

## Usage

```shell
nx affected:libs
```

Install `nx` globally to invoke the command directly using `nx`, or use `npx nx`, `yarn nx`, or `pnpm nx`.

### Examples

Print the names of all the libs affected by changing the index.ts file:

```shell
 nx affected:libs --files=libs/mylib/src/index.ts
```

Print the names of all the libs affected by the changes between main and HEAD (e.g., PR):

```shell
 nx affected:libs --base=main --head=HEAD
```

Print the names of all the libs affected by the last commit on main:

```shell
 nx affected:libs --base=main~1 --head=main
```

## Options

### all

Type: `boolean`

All projects

### base

Type: `string`

Base of the current branch (usually main)

### exclude

Type: `string`

Exclude certain projects from being processed

### files

Type: `string`

Change the way Nx is calculating the affected command by providing directly changed files, list of files delimited by commas or spaces

### head

Type: `string`

Latest commit of the current branch (usually HEAD)

### help

Type: `boolean`

Show help

### plain

Produces a plain output for affected:apps and affected:libs

### uncommitted

Type: `boolean`

Uncommitted changes

### untracked

Type: `boolean`

Untracked changes

### version

Type: `boolean`

Show version number
