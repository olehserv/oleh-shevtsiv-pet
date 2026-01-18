/*
*  This script checks if a backmerge PR from base branch to target branch exists after a release PR is merged.
*/

module.exports = async ({ github, context, core, baseBranch, targetBranch }) => {
    const owner = context.repo.owner;
    const repo = context.repo.repo;
    const pr = context.payload.pull_request;

    const mergedPrNumber = pr.number;
    const mergedPrUrl = pr.html_url;
    const releaseBranch = pr.head.ref;

    const backmergeUrl = `https://github.com/${owner}/${repo}/compare/${targetBranch}...${baseBranch}`;

    const pulls = await github.rest.pulls.list({
        owner,
        repo,
        state: "open",
        base: targetBranch,
        head: `${owner}:${baseBranch}`,
    });

    if (pulls.data.length > 0) {
        core.info(`Backmerge PR already exists: ${pulls.data.map(p => `#${p.number}`).join(", ")}`);
        return;
    }

    await github.rest.issues.createComment({
        owner,
        repo,
        issue_number: mergedPrNumber,
        body: `🚨 **Backmerge required**\n\nPlease create a PR **${baseBranch} → ${targetBranch}**:\n${backmergeUrl}`,
    });

    const label = "backmerge-required";
    const q = `repo:${owner}/${repo} is:issue is:open label:${label} "${mergedPrNumber}"`;
    const existing = await github.rest.search.issuesAndPullRequests({ q });

    if (existing.data.total_count === 0) {
        const title = `Backmerge required: create PR ${baseBranch} → ${targetBranch} (after merging ${releaseBranch})`;
        const body = [
            `A release branch was merged into **${baseBranch}**, but no backmerge PR exists.`,
            ``,
            `👉 **Create PR ${baseBranch} → ${targetBranch}:**`,
            backmergeUrl,
            ``,
            `**Context:**`,
            `- Release branch: \`${releaseBranch}\``,
            `- Merged PR: #${mergedPrNumber}`,
            `- URL: ${mergedPrUrl}`,
        ].join("\n");

        const issue = await github.rest.issues.create({
            owner,
            repo,
            title,
            body,
            labels: [label]
        });
        core.info(`Created issue: #${issue.data.number}`);
    } else {
        core.info(`Backmerge issue already exists. Skipping issue creation.`);
    }

    core.setFailed(`Missing backmerge PR (${baseBranch} → ${targetBranch})`);
};