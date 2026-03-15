
const OWNER = 'japiohopman';
const REPO = 'risk';
const BRANCH = 'main';
// Use VITE_ environment variables for build-time secrets if needed.
const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

/**
 * Fetches the entire repository structure recursively.
 * This is much faster than fetching individual directories as it's a single call.
 */
export async function fetchFullRepositoryTree(): Promise<string[]> {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/${BRANCH}?recursive=1`;
  try {
    const res = await fetch(url, {
      headers: { 
        Authorization: `token ${TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (res.status === 401) {
      throw new Error("UNAUTHORIZED: GitHub token is invalid or expired.");
    }

    if (res.ok) {
      const data = await res.json();
      if (data.tree && Array.isArray(data.tree)) {
        // Return only file paths that are in the assets folder to keep the manifest lean
        return data.tree
          .filter((item: any) => item.type === 'blob' && (item.path.startsWith('assets/audio/voices') || item.path.startsWith('assets/audio/sfx')))
          .map((item: any) => item.path);
      }
    }
    return [];
  } catch (e: any) {
    console.error("Tree Fetch Failure:", e);
    throw e;
  }
}

export async function uploadAsset(path: string, base64Content: string, message: string) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
  
  let sha: string | null = null;
  try {
    const res = await fetch(`${url}?ref=${BRANCH}`, {
      headers: { Authorization: `token ${TOKEN}` }
    });
    if (res.ok) {
      const data = await res.json();
      sha = data.sha;
    }
  } catch (e) {
    // Expected for new files
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: base64Content,
      branch: BRANCH,
      ...(sha ? { sha } : {})
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Upload Failed: ${error.message}`);
  }

  return await response.json();
}
