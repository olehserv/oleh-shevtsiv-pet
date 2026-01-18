/**
 * Responsibilities:
 * - Use validate-release-branch.js to enforce branch policy
 * - If CALCULATED_TAG is provided, validate expected vs calculated
 * - Comment results into PR (set env var to disable: COMMENT_MODE=never)
 * - Set outputs: 
 *      should_tag=true|false (indicating if tagging should proceed)
 *      expected_tag=vX.Y.Z (expected tag name specified in release branch)
 */

const validateReleasePr = require("./validate-release-pr.js");

module.exports = async ({ github, context, core, baseBranch }) => {
    function setShouldTag(ok) { core.setOutput("should_tag", ok ? "true" : "false"); }
    
    const pr = context.payload.pull_request;

    // 1) Branch policy gate
    const releasePrCheck = validateReleasePr({ pr, baseBranch, core, setFailed: false });
    if (!releasePrCheck.ok) {
        await createComment(github, context, pr?.number, renderBranchPolicyBody(releasePrCheck.headRef, releasePrCheck.message));
        core.setFailed(releasePrCheck.message);
        setShouldTag(false);
        return;
    }

    const expectedTag = releasePrCheck.expectedTag;
    core.setOutput("expected_tag", expectedTag);

    const calculatedTag = (process.env.CALCULATED_TAG || "").trim();
    if (!calculatedTag) {
        setShouldTag(true);
        return;
    }

    const previousTag = (process.env.PREVIOUS_TAG || "").trim();

    await createComment(
        github,
        context,
        pr.number,
        renderVersionBody(releasePrCheck.headRef, previousTag, expectedTag, calculatedTag)
    );

    const tagsMatch = expectedTag === calculatedTag;

    setShouldTag(tagsMatch);

    if (!tagsMatch) {
        core.setFailed(
            `Version mismatch: expected '${expectedTag}' (from ${releasePrCheck.headRef}) but calculated '${calculatedTag}' (from ${previousTag || "<none>"}).`
        );
    }
};

async function createComment(github, context, prNumber, body) {
    const shouldComment = process.env.COMMENT_MODE !== "never";
    if (!shouldComment || !prNumber) {
        return;
    }

    await github.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: prNumber,
        body,
    });
}

function renderBranchPolicyBody(headRef, message) {
    return [
        "## 🧩 Release PR policy check",
        "",
        `Source branch: \`${headRef || "<missing>"}\``,
        "",
        `**Result:** ${message}`,
    ].join("\n");
}

function renderVersionBody(headRef, previousTag, expectedTag, calculatedTag) {
    const statusLine = expectedTag === calculatedTag
        ? "✅ **Version matches. Ready to tag.**"
        : "❌ **Version mismatch. Tagging is blocked.**";

    return [
        "## 🔖 Release version validation",
        "",
        `Release branch: \`${headRef}\``,
        "",
        "| Type | Version |",
        "|------|---------|",
        `| Previous | \`${previousTag || "<none>"}\` |`,
        `| Expected | \`${expectedTag}\` |`,
        `| Calculated (dry run) | \`${calculatedTag}\` |`,
        "",
        statusLine
    ].join("\n");
}