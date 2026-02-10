import type { KnownBlock } from '@slack/types';

/**
 * Builds pagination control blocks.
 */
export function buildPaginationBlock(
  currentPage: number,
  totalPages: number,
): KnownBlock[] {
  if (totalPages <= 1) return [];

  const elements: any[] = [];

  if (currentPage > 0) {
    elements.push({
      type: 'button',
      text: { type: 'plain_text', text: '< Prev', emoji: true },
      action_id: 'page_prev',
    });
  }

  elements.push({
    type: 'button',
    text: {
      type: 'plain_text',
      text: `Page ${currentPage + 1} of ${totalPages}`,
      emoji: true,
    },
    action_id: 'page_noop',
  });

  if (currentPage < totalPages - 1) {
    elements.push({
      type: 'button',
      text: { type: 'plain_text', text: 'Next >', emoji: true },
      action_id: 'page_next',
    });
  }

  return [
    { type: 'divider' },
    {
      type: 'actions',
      elements,
    },
  ];
}
