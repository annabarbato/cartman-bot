const { Octokit } = require("@octokit/rest");

let octokit;

function init() {
  octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
}

async function postComment(owner, repo, issueNumber, quote) {
  const body = `> *${quote}*\n\n![cartman](https://i.imgur.com/TKLnhGY.png)\n\n--- \n*-- Eric Cartman, PR Reviewer*`;

  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body,
  });

  console.log(`Posted to ${owner}/${repo}#${issueNumber}: "${quote}"`);
}

module.exports = { init, postComment };
