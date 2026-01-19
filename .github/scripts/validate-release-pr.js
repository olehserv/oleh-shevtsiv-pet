/**
 * Validate release PR and branch name format
 *
 * Validates that a PR targeting baseBranch comes from: release/v{major}.{minor}.{patch}
 * Returns { ok, baseRef, headRef, expectedTag, message }.
 */

module.exports = ({ pr, baseBranch, core, setFailed = true } = {}) => {
  if (!pr) {
    return ErrorResult(undefined, undefined, "❌ No pull_request in context.", core, setFailed);
  }

  const baseRef = pr.base?.ref;
  const headRef = pr.head?.ref;

  if (baseRef !== baseBranch) {
    return ErrorResult(baseRef, headRef, `❌ PR base is '${baseRef}', expected '${baseBranch}'.`, core, setFailed);
  }

  const releaseBranchRegex = /^release\/v\d+\.\d+\.\d+$/;

  if (!headRef || !releaseBranchRegex.test(headRef)) {
    return ErrorResult(baseRef, headRef, `❌ PR head '${headRef}' does not match expected format 'release/vX.Y.Z'.`, core, setFailed);
  }

  // release/v1.2.3 -> v1.2.3
  const expectedTag = headRef.substring("release/".length);

  return OkResult(baseRef, headRef, expectedTag);
};

function OkResult(baseRef, headRef, expectedTag) {
  return { ok: true, baseRef, headRef, expectedTag, message: "✅🆗" };
}

function ErrorResult(baseRef, headRef, message, core, setFailed = false) {
  if (setFailed) {
      core.setFailed(message);
  }
  return { ok: false, baseRef, headRef, message };
}