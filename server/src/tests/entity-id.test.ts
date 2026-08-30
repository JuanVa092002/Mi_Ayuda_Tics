import { describe, expect, it } from 'vitest'
import { Types } from 'mongoose'
import { extractEntityId, entityIdsEqual, isFuncionarioOwner } from '../shared/utils/entity-id'

describe('extractEntityId / isFuncionarioOwner', () => {
  const hex = '64a000000000000000000001'

  it('accepts string, ObjectId, populated doc and { _id | id }', () => {
    expect(extractEntityId(hex)).toBe(hex)
    expect(extractEntityId(new Types.ObjectId(hex))).toBe(hex)
    expect(extractEntityId({ _id: hex })).toBe(hex)
    expect(extractEntityId({ id: hex })).toBe(hex)
    expect(extractEntityId({ _id: { _id: hex } })).toBe(hex)
    expect(extractEntityId({ _id: hex, nombre: 'Ana' })).toBe(hex)
  })

  it('compares funcionario owner independently of shape', () => {
    expect(isFuncionarioOwner('funcionario', hex, new Types.ObjectId(hex))).toBe(true)
    expect(isFuncionarioOwner('funcionario', { _id: hex }, { _id: hex, nombre: 'Ana' })).toBe(true)
    expect(isFuncionarioOwner('funcionario', hex, '64a000000000000000000002')).toBe(false)
    expect(isFuncionarioOwner('tecnico', hex, hex)).toBe(false)
    expect(isFuncionarioOwner('lider', hex, hex)).toBe(false)
  })

  it('entityIdsEqual is false when either side is missing', () => {
    expect(entityIdsEqual(hex, undefined)).toBe(false)
    expect(entityIdsEqual(undefined, hex)).toBe(false)
  })
})
