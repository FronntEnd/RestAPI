import { Octokit } from "@octokit/core";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const [, , username, role , ...orgNames] = process.argv;

if (!username ||!role||orgNames.length === 0) {
  console.error('Invalid input. Please provide the username, role (optional), and at least one organization name.');
  process.exit(1);
}

const token = process.env.GITHUB_TOKEN;

const octokit = new Octokit({
  auth: token,
  request: {
    fetch: fetch
  }
});
async function getUserId(username) {
  try {
    const response = await octokit.request('GET /users/{username}', {
      username: username
    });
    return response.data.id;
  } catch (error) {
    console.error(`Error fetching user ID for ${username}:`, error.message);
    process.exit(1);
  }
}
async function inviteUserToOrg(org, userId, role) {
  try {
    await octokit.request('POST /orgs/{org}/invitations', {
      org: org,
      invitee_id: userId,
      role: role,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    console.log(`Invitation sent successfully to ${userId} to join ${org} as ${role}.`);
  } catch (error) {
    console.error(`Error inviting ${userId} to ${org}:`, error);
  }
}

async function main() {
  const userId = await getUserId(username);
  for (const orgName of orgNames) {
    await inviteUserToOrg(orgName, userId, role);
  }
}

main();
