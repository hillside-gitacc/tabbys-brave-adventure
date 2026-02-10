/**
 * Formats a unix timestamp (seconds) into a relative time string like "3 min ago".
 */
export function timeAgo(unixSeconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - unixSeconds;

  if (diff < 0) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(unixSeconds * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Creates a Slack deep link to a specific message.
 */
export function messagePermalink(workspaceDomain: string, channelId: string, ts: string): string {
  const tsFormatted = ts.replace('.', '');
  return `https://${workspaceDomain}.slack.com/archives/${channelId}/p${tsFormatted}`;
}
