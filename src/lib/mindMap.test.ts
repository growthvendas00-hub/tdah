import { describe, expect, it } from 'vitest'
import { canAddMindNode, descendantIds, nodeDepth } from './mindMap'

const tree = [
  { id: 'root', sortOrder: 0 },
  { id: 'child', parentId: 'root', sortOrder: 0 },
  { id: 'grandchild', parentId: 'child', sortOrder: 0 },
  { id: 'sibling', parentId: 'root', sortOrder: 1 },
]

describe('mind map safety', () => {
  it('removes an entire branch without touching siblings', () => {
    expect([...descendantIds(tree, 'child')]).toEqual(['grandchild'])
    expect(descendantIds(tree, 'root')).toEqual(new Set(['child', 'sibling', 'grandchild']))
  })

  it('calculates depth and blocks a fifth visual level', () => {
    const fourth = [...tree, { id: 'fourth', parentId: 'grandchild', sortOrder: 0 }]
    expect(nodeDepth(fourth, 'fourth')).toBe(4)
    expect(canAddMindNode(fourth, 'fourth')).toBe(false)
    expect(canAddMindNode(fourth, 'child')).toBe(true)
  })

  it('detects corrupt cycles instead of looping forever', () => {
    const corrupt = [{ id: 'a', parentId: 'b', sortOrder: 0 }, { id: 'b', parentId: 'a', sortOrder: 0 }]
    expect(nodeDepth(corrupt, 'a')).toBe(Number.POSITIVE_INFINITY)
    expect(canAddMindNode(corrupt, 'a')).toBe(false)
  })

  it('caps a map at forty nodes', () => {
    const full = Array.from({ length: 40 }, (_, index) => ({ id: `${index}`, sortOrder: index }))
    expect(canAddMindNode(full)).toBe(false)
  })
})
