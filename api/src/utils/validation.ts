export function validateNote(note: string): { valid: boolean; error?: string } {
  if (!note || note.trim().length === 0) {
    return { valid: false, error: 'Note is required' };
  }
  if (note.length > 200) {
    return { valid: false, error: 'Note must be 200 characters or less' };
  }
  return { valid: true };
}

export function validateTags(tags: string[]): { valid: boolean; error?: string } {
  if (tags.length > 5) {
    return { valid: false, error: 'Maximum 5 tags allowed' };
  }
  return { valid: true };
}

export function normalizeTags(tags: string[]): string[] {
  // Convert to lowercase for case-insensitive storage, preserve spaces
  return tags.map(tag => tag.trim().toLowerCase());
}
