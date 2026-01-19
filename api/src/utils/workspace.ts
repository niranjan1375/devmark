import prisma from './db';

/**
 * Get the personal workspace for a user
 * Creates one if it doesn't exist (for backward compatibility)
 */
export async function getPersonalWorkspace(userId: string) {
  let workspace = await prisma.workspace.findUnique({
    where: { userId },
  });

  if (!workspace) {
    // Create personal workspace if it doesn't exist (backward compatibility)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    const workspaceName = user?.name
      ? `${user.name}'s Workspace`
      : `${user?.email}'s Workspace`;

    workspace = await prisma.workspace.create({
      data: {
        userId,
        name: workspaceName,
        isPersonal: true,
      },
    });
  }

  return workspace;
}

/**
 * Get workspace ID for a user (their personal workspace)
 */
export async function getWorkspaceId(userId: string): Promise<string> {
  const workspace = await getPersonalWorkspace(userId);
  return workspace.id;
}
