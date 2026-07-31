export interface TreeNode { id: string; parentId?: string; sortOrder: number }

export function descendantIds(nodes: TreeNode[], rootId: string) {
  const result = new Set<string>(); const pending = [rootId]
  while (pending.length) {
    const parent = pending.pop()!
    for (const node of nodes) if (node.parentId === parent && !result.has(node.id)) { result.add(node.id); pending.push(node.id) }
  }
  return result
}

export function nodeDepth(nodes: TreeNode[], nodeId?: string) {
  let depth = 0; let current = nodeId; const visited = new Set<string>()
  while (current) {
    if (visited.has(current)) return Number.POSITIVE_INFINITY
    visited.add(current); current = nodes.find((node) => node.id === current)?.parentId; depth += 1
  }
  return depth
}

export function canAddMindNode(nodes: TreeNode[], parentId?: string, maxDepth = 4, maxNodes = 40) {
  return nodes.length < maxNodes && nodeDepth(nodes, parentId) < maxDepth
}
