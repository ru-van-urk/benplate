# Git and GitHub

GitHub doesn't copy settings or rulesets from a template, so a project created with **Use this template** starts with none of this. Set it up once, right after creating the repository.

## The flow

- **`develop`** is the working branch and the default branch. Small fixes can go straight onto it; anything bigger gets its own branch.
- **Feature branches** start from `develop` and come back through a pull request, which is **squashed**: one commit per pull request, titled after it.
- **`main`** is the released state. A release is a pull request from `develop` into `main`, merged with a **merge commit**.

```
*   Merge pull request #12 from <owner>/develop     ← release
|\
| * feat: moons (#11)                               ← squashed pull request
| * fix: planet list spacing                        ← direct commit on develop
|/
* feat: people (#10)
```

`main` keeps `develop`'s commits exactly as they are, with the same SHAs, so the two branches never drift apart and nothing has to be synced after a release. `git log --first-parent --oneline main` lists only the releases.

Rebase merging `develop` into `main` doesn't work for this: GitHub recreates every commit with a new SHA, so `develop` would have to be reset onto `main` after each release, or the next release pull request shows the previous one's commits again.

## Branches and pull requests

- **Branch names**: `<type>/<description>`, lowercase, such as `feat/moons` or `fix/planet-list-spacing`. Avoid parentheses: zsh needs them quoted.
- **Pull request titles** are conventional commits (`feat: moons`), because the title becomes the squash commit. GitHub fills in the title from the commit when the branch has one, and from the branch name when it has more, so check it before merging.
- **Keep a branch up to date** by rebasing it onto `develop`, never by merging `develop` into it.

## Set up a new repository

1. Create `develop` from `main` and push it:

   ```bash
   git switch -c develop && git push -u origin develop
   ```

2. **Settings → General → Pull Requests**:
   - ☑ **Allow merge commits**, default message: _Default message_ (`Merge pull request #n from …`)
   - ☑ **Allow squash merging**, default message: _Pull request title_
   - ☐ **Allow rebase merging**
   - ☑ **Automatically delete head branches**

3. **Settings → Rules → Rulesets → New branch ruleset** named `protect main`:
   - **Enforcement status**: Active
   - **Target branches**: _Include by pattern_ `main`. Not _Default branch_: that moves to `develop` in step 5
   - ☑ **Restrict deletions**
   - ☑ **Require a pull request before merging**, and under **Additional settings**, **Allowed merge methods**: only **Merge**
   - ☑ **Require status checks to pass**, with `check`
   - ☑ **Block force pushes**
   - ☐ **Require linear history**: a merge commit isn't linear, so this would block every release

4. Another ruleset named `protect develop`:
   - **Enforcement status**: Active
   - **Bypass list**: **Repository admin**, _Always allow_, so you can still push straight to `develop`
   - **Target branches**: _Include by pattern_ `develop`
   - ☑ **Restrict deletions**
   - ☑ **Require linear history**
   - ☑ **Require a pull request before merging**, with **Allowed merge methods**: only **Squash**
   - ☑ **Require status checks to pass**, with `check`
   - ☑ **Block force pushes**

5. **Settings → General → Default branch**: switch to `develop` (the ⇄ button). New pull requests then target `develop` on their own. Locally, point `origin/HEAD` at it:

   ```bash
   git remote set-head origin -a
   ```

## Check it

- A pull request into `develop` offers only **Squash and merge**
- A pull request from `develop` into `main` offers only **Create a merge commit**, once `check` passes
- **Settings → Rules → Rulesets** shows both rulesets as Active, `protect main` targeting `main` by name

CI needs no changes: `.github/workflows/ci.yml` runs on every pull request, whichever branch it targets. Scheduled workflows, if you add any, always run from the default branch, so from `develop`.
